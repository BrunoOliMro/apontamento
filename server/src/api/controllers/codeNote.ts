import { RequestHandler } from 'express';
import sanitize from 'sanitize-html';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { cookieCleaner } from '../utils/clearCookie';
import { cookieGenerator } from '../utils/cookieGenerator';
//import { decodedBuffer } from '../utils/decodeOdf';
import { decrypted } from '../utils/decryptedOdf';
import { encrypted } from '../utils/encryptOdf';
//import { encrypted } from '../utils/encryptOdf';
import { unravelBarcode } from '../utils/unravelBarcode';

export const codeNote: RequestHandler = async (req, res, next) => {
    let dados = unravelBarcode(req.body.barcode)
    let numeroOper = Number(dados.numOper.replaceAll('000', '')) || 0
    let odfNumber = Number(dados.numOdf) || 0
    let codMaq = String(dados.codMaq) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['CRACHA']))) || null
    let codigoPeca = String('' || null)

    if (!funcionario || funcionario === '') {
        console.log("funcionarario /codenote/", funcionario);
        return res.json({ message: 'Acesso negado' })
    }

    // if (!dados) {
    //     const numeroOdfCookies = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    //     const codigoOper: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    //     const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null

    //     dados.numOdf = numeroOdfCookies
    //     dados.numOper = codigoOper
    //     dados.codMaq = codigoMaq

    //     //Decodifica numero da odf
    //     const encodedOdfString: string = decodedBuffer(String(sanitize(req.cookies['encodedOdfString'])))

    //     //Compara o Codigo Descodificado e o descriptografado
    //     if (encodedOdfString === numeroOdfCookies) {
    //         return next()
    //     } else {
    //         return res.json({ message: 'Acesso negado' })
    //     }
    // }

    try {
        const lookForHisaponta = `SELECT TOP 1 USUARIO, NUMOPE, ITEM, CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${numeroOper} AND ITEM = '${codMaq}' ORDER BY DATAHORA DESC`
        const codIdApontamento = await select(lookForHisaponta)
        let lastEmployee = codIdApontamento[0]?.USUARIO
        let numeroOdfDB = codIdApontamento[0]?.ODF
        let codigoOperDB = codIdApontamento[0]?.NUMOPE
        let codigoMaqDB = codIdApontamento[0]?.ITEM

        // If the user is diferent than the last user
        if (lastEmployee !== funcionario
            && dados.numOdf === numeroOdfDB
            && dados.numOper === codigoOperDB
            && dados.codMaq === codigoMaqDB
        ) {
            console.log("usuario diferente");
            //Finalizar  a odf E iniciar uma nova
            return res.json({ message: 'usuario diferente' })
        }

        let tempoDecorrido = 0
        let revisao = String('' || null)
        let qtdLibMax = 0
        let boas = 0
        let ruins = 0
        let faltante = Number(0)
        let retrabalhada = 0
        let codAponta = 1
        let descricaoCodAponta = 'Ini Setup.'
        let motivo = String('')
        // var obj = {
        //     message: ''
        // }
        // console.log('linha 76', dados.numOdf);
        // console.log('linha 76', dados.numOper);
        // console.log('linha 76', dados.codMaq);
        let y = `SELECT TOP 1 * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${numeroOper} AND CODIGO_MAQUINA = '${dados.codMaq}'`;
        
        if (codIdApontamento.length > 0) {
            const x = await select(y);
            if (codIdApontamento[0]?.CODAPONTA === 1 || codIdApontamento[0]?.CODAPONTA === 6) {
                req.body.message = `codeApont 1 setup iniciado`
                next()
            }

            if (codIdApontamento[0]?.CODAPONTA === 2) {
                console.log("linha 100 /code note/");
                let descricaoCodigoAponta3 = ''
                let codAponta3 = 3
                await insertInto(funcionario, odfNumber, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0))
                return res.json({ message: 'ferramentas selecionadas com successo' })
                //return res.json({ message: `codeApont 2 setup finalizado` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 3) {
                const z = await encrypted(String(new Date().getDate()))
                res.cookie('startProd', z)
                await cookieGenerator(res, x[0])
                return res.json({ message: `codeApont 3 prod Ini.` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 4) {
                const z = await encrypted(String(new Date().getDate()))
                res.cookie('startRip', z)
                await cookieGenerator(res, x[0])
                return res.json({ message: `codeApont 4 prod finalzado` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 5) {
                await cookieGenerator(res, x[0])
                return res.json({ message: `codeApont 5 inicio de rip` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 7) {
                return res.json({ message: `codigo de apontamento: 7 = máquina parada` })
            }
        }
        if (codIdApontamento.length <= 0) {
            const resultInsert = await insertInto(funcionario, odfNumber, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido)
            if (resultInsert === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' })
            }
            next()
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}