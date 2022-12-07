import { RequestHandler } from "express";
import { insertInto } from "../services/insert";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const stopPost: RequestHandler = async (req, res) => {
    const odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    const funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    const revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const operationNumber = decrypted(String(req.cookies['NUMERO_OPERACAO'])) || null
    const machineCode = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const qtdLibMax = decrypted(String(sanitize(req.cookies['QTDE_LIB']))) || null
    const boas = 0
    const faltante = 0
    const retrabalhada = 0
    const codAponta = 7
    const ruins = 0
    const motivo = ''
    const descricaoCodAponta = 'Parada'

    //Encerra o processo todo
    const end = new Date().getTime() || 0;
    const start = decrypted(String(sanitize(req.cookies["startSetupTime"]))) || 0
    const final: number = Number(end - start) || 0

    const x = await codeNote(odfNumber, operationNumber, machineCode)
    if (x === 'Machine has stopped') {
        return res.json({ message: 'Máquina já parada' })
    } else {
        try {
            //Insere O CODAPONTA 7 de parada de máquina
            const resour = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final)
            if (resour) {
                return res.status(200).json({ message: 'maquina parada com sucesso' })
            } else if (resour === 'Algo deu errado') {
                return res.json({ message: 'erro ao parar a maquina' })
            } else {
                return res.json({ message: 'erro ao parar a maquina' })
            }
        } catch (error) {
            console.log(error)
            return res.json({ message: "ocorre um erro ao tentar parar a maquina" })
        }
    }
}