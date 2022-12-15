import { RequestHandler } from "express";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
//import { encrypted } from "../utils/encryptOdf";
import { odfIndex } from "../utils/odfIndex";
import { sanitize } from "../utils/sanitize";
//import { selectedItensFromOdf } from "../utils/queryGroup";

export const odfData: RequestHandler = async (req, res) => {
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    }
    try {
        var odfNumber: number | null = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
        var codeMachine = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
        var numOper: string | null = "00" + decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0') || null
        var funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    } catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, codeMachine, funcionario)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const data = await select(lookForOdfData)
            const i = await odfIndex(data, numOper)
            response.odfSelecionada = data[i]
            response.funcionario = funcionario

            if (response.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            } else {
                response.message = 'Tudo certo por aqui /OdfData.ts/'
                return res.status(200).json(response);
            }
        } else {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
}