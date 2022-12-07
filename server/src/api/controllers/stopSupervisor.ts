import { RequestHandler } from "express";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const stopSupervisor: RequestHandler = async (req, res) => {
    const supervisor: string | null = String(sanitize(req.body['superSuperMaqPar'])) || null
    const odfNumber: number = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    const operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const machineCode: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const qtdLibMax: number = decrypted(String(sanitize(req.cookies['QTDE_LIB']))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    const boas = 0
    const faltante = 0
    const retrabalhada = 0
    const ruins = 0
    const codAponta = 3
    const descricaoCodAponta = `Ini Prod.`
    const motivo = ''
    const tempoDecorrido = 0
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`

    try {
        const x = await codeNote(odfNumber, operationNumber, machineCode)
        if (x === 'Machine has stopped') {
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
            return res.json({ message: x })
        }
    } catch (error) {
        return res.json({ message: "erro na parada de maquina" })
    }
}