import { RequestHandler } from "express";
import { insertInto } from "../services/insert";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const stopPost: RequestHandler = async (req, res) => {
    try {
        var odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
        var revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var operationNumber = decrypted(String(req.cookies['NUMERO_OPERACAO'])) || null
        var machineCode = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var qtdLibMax = decrypted(String(sanitize(req.cookies['QTDE_LIB']))) || null
        var boas = null
        var faltante = null
        var retrabalhada = null
        var codAponta = 7
        var ruins = null
        var motivo = ''
        var descricaoCodAponta = 'Parada'

        //Encerra o processo todo
        var end = new Date().getTime() || 0;
        var start = decrypted(String(sanitize(req.cookies["startSetupTime"]))) || 0
        var final: number = Number(end - start) || 0
    } catch (error) {
        console.log('Error on stopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        var pointedCode = await codeNote(odfNumber, operationNumber, machineCode, funcionario)
    } catch (error) {
        console.log('Error on StopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    if (pointedCode.message === 'Machine has stopped') {
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