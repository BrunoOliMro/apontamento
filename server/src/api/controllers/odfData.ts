import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { odfIndex } from "../utils/odfIndex";
import { selectedItensFromOdf } from "../utils/queryGroup";

export const odfData: RequestHandler = async (req, res) => {
    const numeroOdf: number = Number(decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))) || 0
    const numOper: string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
   // const numOpeNew = String(numOper!.toString().replaceAll(' ', "0")) || null
    const funcionario = decrypted(String(sanitize(req.cookies['employee']))) || null
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    let qtdLibMax: number;
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
        valorMaxdeProducao: 0,
    }
    try {
        const data = await select(lookForOdfData)
        res.cookie("qtdLibMax", encrypted(String(data[0].QTDE_ODF)))

        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' })
        }

        const indexOdf = await odfIndex(data, numOper)

        const selectedItens: any = await selectedItensFromOdf(data, indexOdf)

        if(indexOdf === 0){
            qtdLibMax = selectedItens.odf.QTDE_ODF
        } else {
            qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
        }

        response.odfSelecionada = selectedItens.odf;
        response.valorMaxdeProducao = qtdLibMax



        if (response.message === 'Algo deu errado') {
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