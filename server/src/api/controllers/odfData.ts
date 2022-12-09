import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
//import { encrypted } from "../utils/encryptOdf";
import { odfIndex } from "../utils/odfIndex";
import { selectedItensFromOdf } from "../utils/queryGroup";

export const odfData: RequestHandler = async (req, res) => {
    const odfNumber: number | null = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || null
    let operationNumber = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let codeMachine = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    const numOper: string | null = "00" + decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0') || null
    const funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    }
    try {
        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' })
        }

        const x = await codeNote(odfNumber, operationNumber, codeMachine)
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated' || x === 'Machine has stopped') {
            const data = await select(lookForOdfData)
            const indexOdf = await odfIndex(data, numOper)
            const selectedItens: any = await selectedItensFromOdf(data, indexOdf)
            response.odfSelecionada = selectedItens.odf;
            console.log('LINHA 33 /ODFDATA/ - QTD-LIB- ', selectedItens.odf.QTDE_LIB);
            if (response.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            } else {
                response.message = 'Tudo certo por aqui /OdfData.ts/'
                return res.status(200).json(response);
            }
        } else {
            return res.json({ message: x })
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
}