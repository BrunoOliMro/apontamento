import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

//Ferramenta
export const tools: RequestHandler = async (req, res) => {
    try {
        var numeroOdf: number | null = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || null
        var codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var numeroOperacao = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
        var codigoMaq: string = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
        var funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var start: number | null = Number(decrypted(String(sanitize(req.cookies["startSetupTime"])))) || null
        var qtdLibMax: number | null = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var ferramenta: string = String("_ferr")
        var boas = null
        var ruins = null
        var codAponta = [1]
        var descricaoCodigoAponta = 'Ini Setup.'
        var faltante = null
        var retrabalhada = null
        var motivo = null
        var lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`
        var toolsImg;
        var result = [];
        if (numeroOdf !== Number(decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber']))))) {
            console.log('ODF Verificada com falha');
            return res.json({ message: 'Erro na ODF' })
        }
    } catch (error) {
        console.log('Error on Tools --cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }


    try {
        const codeNoteResult = await codeNote(numeroOdf, numeroOperacao, codigoMaq, funcionario)
        if (codeNoteResult.message === 'First time acessing ODF' || codeNoteResult.message === 'Begin new process') {
            const inserted = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, start)
            if (inserted !== 'Algo deu errado') {
                try {
                    toolsImg = await select(lookForTools)
                    if (toolsImg.length <= 0) {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                    if (toolsImg.length > 0) {
                        for await (const [i, record] of toolsImg.entries()) {
                            const rec = await record;
                            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
                            result.push(path);
                        }
                        // const obj = {
                        //     result: result,
                        // }
                        return res.json(result)
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
            return res.json({ message: codeNoteResult.message })
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "Erro ao inserir codapontamento 1" })
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    try {
        var numeroOdf: number | null = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var numeroOperacao: any = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        var codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var qtdLibMax: number | null = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var boas = null
        var ruins = null
        var codAponta = [2]
        var codAponta3 = [3]
        var descricaoCodigoAponta = 'Fin Setup.'
        var descricaoCodigoAponta3 = 'Ini Prod.'
        var faltante = null
        var retrabalhada = null
        var motivo = null
        var startSetupTime = decrypted(sanitize(req.cookies['startSetupTime'])) || null
    } catch (error) {
        console.log('Error on SelectedTools --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    //Encerra o primeiro tempo de setup
    const tempoDecorrido = Number(Number(new Date().getTime()) - startSetupTime) || 0
    let startProd = await encrypted(String(new Date().getTime()))

    //Inicia a produção
    res.cookie("startProd", startProd)
    try {
        const codeNoteResult = await codeNote(numeroOdf, numeroOperacao, codigoMaq, funcionario)
        if (codeNoteResult.message === 'Pointed Iniciated') {
            //INSERE EM CODAPONTA 2
            const codApontamentoFinalSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido)
            if (codApontamentoFinalSetup !== 'Algo deu errado') {
                //INSERE EM CODAPONTA 3
                const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || null))
                if (codApontamentoInicioSetup !== 'Algo deu errado') {
                    return res.json({ message: 'ferramentas selecionadas com successo' })
                } else {
                    return res.json({ message: 'Algo deu errado' })
                }
            }
            else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else if (codeNoteResult.message === 'Fin Setup') {
            //INSERE EM CODAPONTA 3
            const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || null))
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'ferramentas selecionadas com successo' })
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: codeNoteResult.message })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}