import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const stopSupervisor: RequestHandler = async (req, res) => {
    const supervisor: string = decrypted(String(sanitize(req.body['superSuperMaqPar']))) || null
    const numeroOdf: number = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    const NUMERO_OPERACAO: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const CODIGO_MAQUINA: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const qtdLibMax: number = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
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
        const resource = await select(lookForSupervisor)

        if (resource) {
            const insertTimerBackTo3 = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido)
            if(insertTimerBackTo3 === 'insert done'){
                return res.status(200).json({ message: 'maquina' })
            } else {
                return res.json({ message: "supervisor não encontrado" })
            }
        } else if (!resource) {
            return res.json({ message: "supervisor não encontrado" })
        } else {
            return res.json({ message: "supervisor não encontrado" })
        }
    } catch (error) {
        return res.json({ message: "erro na parada de maquina" })
    }
}