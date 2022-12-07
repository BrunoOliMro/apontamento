import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
//import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
//import { encoded } from "../utils/encodedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

//Ferramenta
export const tools: RequestHandler = async (req, res) => {
    if (!Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))))) {
        return res.json({ message: 'Algo deu errado' })
    }
    //const decodedOdfNumber: number = Number(decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber'])))) || 0
    const numeroOdf: number = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || 0
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let numeroOperacao = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const start: number = Number(decrypted(String(sanitize(req.cookies["startSetupTime"])))) || 0
    const qtdLibMax: number = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || 0
    const ferramenta: string = String("_ferr")
    const boas = 0
    const ruins = 0
    const codAponta = 1
    const descricaoCodigoAponta = 'Ini Setup.'
    const faltante = 0
    const retrabalhada = 0
    const motivo = ''
    const lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`
    let toolsImg;
    const result = [];

    // if (numeroOdf !== decodedOdfNumber) {
    //     return res.json({ message: 'Erro na ODF' })
    // }

    try {
        const codeNoteResult = await codeNote(numeroOdf, numeroOperacao, codigoMaq)
        console.log('linha 45 /tools/', codeNoteResult);
        if (codeNoteResult === 'First time acessing ODF' || codeNoteResult === 'Begin new process') {
            const inserted = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, start)
            if (inserted !== 'Algo deu errado') {
                try {
                    toolsImg = await select(lookForTools)
                    console.log('linha 51 /tools/', toolsImg);
                    if (toolsImg.length <= 0) {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                    if (toolsImg.length > 0) {
                        for await (const [i, record] of toolsImg.entries()) {
                            const rec = await record;
                            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
                            result.push(path);
                        }
                        const obj = {
                            message: 'codeApont 1 inserido',
                            result: result,
                        }
                        return res.json(obj)
                    } else {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                } catch (error) {
                    console.log(error);
                    return res.json({ message: 'Data not found' })
                }
            } else {
                return res.json({ message: 'Something went wrong' })
            }
        } else {
            return res.json({ message: codeNoteResult })
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "Erro ao inserir codapontamento 1" })
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    const numeroOdf: number = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || 0
    const numeroOperacao: any = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const qtdLibMax: number = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || 0
    const boas = 0
    const ruins = 0
    const codAponta = 2
    const codAponta3 = 3
    const descricaoCodigoAponta = 'Fin Setup.'
    const descricaoCodigoAponta3 = 'Ini Prod.'
    const faltante = 0
    const retrabalhada = 0
    const motivo = String('' || null)
    let x = decrypted(sanitize(req.cookies['startSetupTime']))
    let y = Number(new Date().getTime())

    //Encerra o primeiro tempo de setup
    const tempoDecorrido = Number(y - x) || 0
    let z = await encrypted(String(new Date().getTime()))

    //Inicia a produção
    res.cookie("startProd", z)
    try {
        const codeNoteResult = await codeNote(numeroOdf, numeroOperacao, codigoMaq)
        console.log('codeNoteResult', codeNoteResult);
        if (codeNoteResult === 'Pointed Iniciated') {
            //INSERE EM CODAPONTA 2
            const codApontamentoFinalSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido)
            if (codApontamentoFinalSetup) {
                //INSERE EM CODAPONTA 3
                const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0))
                if (codApontamentoInicioSetup) {
                    return res.json({ message: 'ferramentas selecionadas com successo' })
                }
            }
        } else if (codeNoteResult === 'Fin Setup') {
            //INSERE EM CODAPONTA 3
            const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0))
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'ferramentas selecionadas com successo' })
            }
        } else {
            return res.json({ message: codeNoteResult })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}