import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { odfIndex } from "../utils/odfIndex";
import { selectedItensFromOdf } from "../utils/queryGroup";

export const odfData: RequestHandler = async (req, res) => {
    let numeroOdf: number = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    numeroOdf = Number(numeroOdf)
    const numOper: string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    const numOpeNew = String(numOper!.toString().replaceAll(' ', "0")) || null
    const funcionario = decrypted(String(sanitize(req.cookies['employee']))) || null
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    let response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
        valorMaxdeProducao: 0,
    }
    try {
        const data: any = await select(lookForOdfData)
        res.cookie("qtdProduzir", encrypted(String(data[0].QTDE_ODF)))
        res.cookie("QTD_REFUGO", encrypted(String(data[0].QTD_REFUGO)))

        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' })
        }

        const indexOdf = await odfIndex(data, numOpeNew)

        const selectedItens: any = await selectedItensFromOdf(data, indexOdf)

        response.odfSelecionada = selectedItens.odf;
        response.valorMaxdeProducao = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;

        if (!response) {
            return res.json({ message: 'Algo deu errado' });
        } else {
            response.message = 'Tudo certo por aqui /OdfData.ts/'
            return res.status(200).json(response);
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
}