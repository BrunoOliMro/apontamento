import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const stopPost: RequestHandler = async (req, res) => {
    const numeroOdf = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    const funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    const revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const numeroOperacao = decrypted(String(req.cookies['NUMERO_OPERACAO'])) || null
    const codigoMaq = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
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

    const y = `SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${numeroOdf} AND NUMOPE = ${numeroOperacao} AND ITEM = '${codigoMaq}' ORDER BY DATAHORA DESC`
    const x = await select(y)
    console.log('x', x);

    if (x[0].CODAPONTA === 7) {
        return res.json({ message: 'Máquina já parada' })
    } else {
        try {
            //Insere O CODAPONTA 7 de parada de máquina
            const resour = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final)
            console.log("parada", resour);

            if (resour === 'insert done') {
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