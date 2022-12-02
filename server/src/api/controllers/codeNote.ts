import { RequestHandler } from 'express';
import sanitize from 'sanitize-html';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { decodedBuffer } from '../utils/decodeOdf';
import { decrypted } from '../utils/decryptedOdf';
import { unravelBarcode } from '../utils/unravelBarcode';

export const codeNote: RequestHandler = async (req, res, next) => {
    let dados = unravelBarcode(req.body.barcode)
    let numeroOper = Number(dados.numOper.replaceAll('000', '')) || 0
    let odfNumber = Number(dados.numOdf) || 0
    let codMaq = String(dados.codMaq) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['employee']))) || null
    let codigoPeca = String('' || null)

    if (!funcionario || funcionario === '') {
        console.log("funcionarario /codenote/", funcionario);
        return res.json({ message: 'Acesso negado' })
    }

    if (!dados) {
        const numeroOdfCookies = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
        const codigoOper: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null

        dados.numOdf = numeroOdfCookies
        dados.numOper = codigoOper
        dados.codMaq = codigoMaq

        //Decodifica numero da odf
        const encodedOdfString: string = decodedBuffer(String(sanitize(req.cookies['encodedOdfString'])))

        //Compara o Codigo Descodificado e o descriptografado
        if (encodedOdfString === numeroOdfCookies) {
            return next()
        } else {
            return res.json({ message: 'Acesso negado' })
        }
    }

    try {
        const lookForHisaponta = `SELECT TOP 1 USUARIO, NUMOPE, ITEM, CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${numeroOper} AND ITEM = '${codMaq}' ORDER BY DATAHORA DESC`
        const codIdApontamento = await select(lookForHisaponta)
        console.log('linha 45 /codIdApontamento/', codIdApontamento);
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
        var obj = {
            message: ''
        }

        if (codIdApontamento.length > 0) {
            if (codIdApontamento[0]?.CODAPONTA === 1) {
                req.body.message = `codeApont 1 setup iniciado`
                next()
            }

            if (codIdApontamento[0]?.CODAPONTA === 2) {
                console.log("linha 100 /code note/");
                obj.message = `codeApont 2 setup finalizado`
                req.body.message = `codeApont 2 setup finalizado`
                next()
            }

            if (codIdApontamento[0]?.CODAPONTA === 3) {
                req.body.message = `codeApont 3 prod iniciado`
                next()
            }

            if (codIdApontamento[0]?.CODAPONTA === 4) {
                req.body.message = `codeApont 4 prod finalzado`
                next()
            }

            if (codIdApontamento[0]?.CODAPONTA === 7) {
                // req.body.message = `codeApont 5 maquina parada`
                // next()
                return res.json({ message: `codeApont 5 maquina parada` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 6) {
                req.body.message = `codeApont 1 setup iniciado`
                const insertResponse = await insertInto(funcionario, odfNumber, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido)
                if (insertResponse === 'Algo deu errado') {
                    return res.json({ message: 'Algo deu errado' })
                }
                next()
            }

            // if (codIdApontamento[0]?.CODAPONTA === 6) {
            //     req.body.message = `codeApont 1 setup iniciado`
            //     next()
            // }

            if (lastEmployee !== funcionario && codIdApontamento[0]?.CODAPONTA === 6) {
                console.log("chaamr outra função");
                req.body.message = `codeApont 1 setup iniciado`
            }
        }
        if (codIdApontamento.length <= 0) {
            console.log('code note linha 126');
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