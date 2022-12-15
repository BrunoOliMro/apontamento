import { RequestHandler } from "express";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const stopSupervisor: RequestHandler = async (req, res) => {
    try {
        var supervisor: string | null = String(sanitize(req.body['superSuperMaqPar'])) || null
        var odfNumber: number = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        var machineCode: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var qtdLibMax: number = decrypted(String(sanitize(req.cookies['QTDE_LIB']))) || null
        var funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var codigoPeca: string = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
        var boas = null
        var faltante = null
        var retrabalhada = null
        var ruins = null
        var codAponta = 3
        var descricaoCodAponta = `Ini Prod.`
        var motivo = null
        var tempoDecorrido = 0
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`
    } catch (error) {
        console.log('Error on StopSupervisor --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, machineCode, funcionario)
        if (pointedCode.message === 'Machine has stopped') {
            const resource = await select(lookForSupervisor)
            if (resource) {
                const insertTimerBackTo3 = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido)
                if (insertTimerBackTo3) {
                    return res.status(200).json({ message: 'maquina' })
                } else {
                    return res.json({ message: "supervisor não encontrado" })
                }
            } else if (!resource) {
                return res.json({ message: "supervisor não encontrado" })
            } else {
                return res.json({ message: "supervisor não encontrado" })
            }
        } else {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        return res.json({ message: "erro na parada de maquina" })
    }
}