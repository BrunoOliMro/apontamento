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
        var odfNumber = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies["CODIGO_PECA"])))) || null
        var operationNumber = Number(decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var startSetupTime = Number(decrypted(String(sanitize(req.cookies["startSetupTime"])))) || null
        var maxQuantityReleased = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var toolString = String("_ferr")
        var goodFeed = null
        var badFeed = null
        var pointedCode = [1]
        var missingFeed = null
        var reworkFeed = null
        var pointedCodeDescription = 'Ini Setup.'
        var motives = null
        var stringLookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${partCode}'`
        var toolsImg;
        var result = [];
        if (odfNumber !== Number(decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber'])))) || null) {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        console.log('Error on Tools --cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }


    try {
        const codeNoteResult = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (codeNoteResult.message === 'First time acessing ODF' || codeNoteResult.message === 'Begin new process') {
            const inserted = await insertInto(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed, badFeed, pointedCode, pointedCodeDescription, motives, missingFeed, reworkFeed, startSetupTime)
            if (inserted === 'Success') {
                try {
                    toolsImg = await select(stringLookForTools)
                    if (toolsImg.length <= 0) {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                    if (toolsImg.length > 0) {
                        for await (const [i, record] of toolsImg.entries()) {
                            const rec = await record;
                            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                            result.push(path);
                        }
                        return res.json(result)
                    } else {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                } catch (error) {
                    console.log(error);
                    return res.json({ message: 'Not found' })
                }
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: codeNoteResult.message })
        }
    } catch (error) {
        console.log('Error on tools ', error);
        return res.json({ message: "Algo deu errado" })
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = String(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies["CODIGO_PECA"])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var maxQuantityReleased = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var boas = null
        var ruins = null
        var pointCodeSetupEnded = [2]
        var pointCodeIniciatedProd = [3]
        var pointCodeEndSetup = 'Fin Setup'
        var pointCodeProdIniciated = 'Ini Prod.'
        var missingFeed = null
        var reworkFeed = null
        var motive = null
        var startSetupTime = Number(decrypted(sanitize(req.cookies['startSetupTime']))) || null
        // Inicia a produção
        let startProd = await encrypted(String(new Date().getTime()))
        res.cookie("startProd", startProd)
    } catch (error) {
        console.log('Error on SelectedTools --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    //Encerra o primeiro tempo de setup
    const tempoDecorrido = Number(Number(new Date().getTime()) - startSetupTime!) || 0

    try {
        const codeNoteResult = await codeNote(odfNumber, Number(operationNumber), machineCode, employee)
        if (codeNoteResult.message === 'Pointed Iniciated') {
            //INSERE EM CODAPONTA 2
            const codApontamentoFinalSetup = await insertInto(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeSetupEnded, pointCodeEndSetup, motive, missingFeed, reworkFeed, tempoDecorrido)
            if (codApontamentoFinalSetup !== 'Algo deu errado') {
                //INSERE EM CODAPONTA 3
                const codApontamentoInicioSetup = await insertInto(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeIniciatedProd, pointCodeProdIniciated, motive, missingFeed, reworkFeed, Number(new Date().getTime() || null))
                if (codApontamentoInicioSetup !== 'Algo deu errado') {
                    return res.json({ message: 'Success' })
                } else {
                    return res.json({ message: 'Algo deu errado' })
                }
            }
            else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else if (codeNoteResult.message === 'Fin Setup') {
            //INSERE EM CODAPONTA 3
            const codApontamentoInicioSetup = await insertInto(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeIniciatedProd, pointCodeProdIniciated, motive, missingFeed, reworkFeed, Number(new Date().getTime() || null))
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'Success' })
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