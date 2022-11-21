import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const odfDataQtd: RequestHandler = async (req, res) => {
    let numeroOdf: number = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    numeroOdf = Number(numeroOdf)
    let numOper = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let numOpeNew = String(numOper!.toString().replaceAll(' ', "0")) || null
    const funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    try {
        const data: any = await select(lookForOdfData)
        res.cookie("qtdProduzir", data[0].QTDE_ODF)

        let codigoOperArray = data.map((e: any) => e.NUMERO_OPERACAO)

        let arrayAfterMap = codigoOperArray.map((e: any) => "00" + e).toString().replaceAll(' ', "0").split(",")

        let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === numOpeNew)

        console.log("linha 28", indiceDoArrayDeOdfs);

        let odfSelecionada = data[indiceDoArrayDeOdfs]
        let qtdeApontadaArray = data.map((e: any) => e.QTDE_APONTADA)
        let qtdOdfArray = data.map((e: any) => e.QTDE_ODF)
        let valorQtdOdf;
        let valorQtdeApontAnterior;
        let valorMaxdeProducao;

        //Caso seja o primeiro indice do array
        if (indiceDoArrayDeOdfs - 1 <= 0) {
            valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs]
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs]
            valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior || 0;
        }

        //Para os demais do array
        if (indiceDoArrayDeOdfs > 0) {
            qtdeApontadaArray = data.map((e: any) => e.QTDE_APONTADA)
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1]
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs]
            valorMaxdeProducao = x - valorQtdeApontAnterior || 0
        }

        console.log("linha 50 /OdfData/", odfSelecionada);

        console.log("linha 64 /odfData/", valorMaxdeProducao);

        //Obj que retorna ao front
        res.cookie("QTD_REFUGO", data[indiceDoArrayDeOdfs].QTD_REFUGO)
        const obj = {
            funcionario: funcionario,
            odfSelecionada,
            valorMaxdeProducao,
        }

        if (obj.odfSelecionada === undefined || obj.odfSelecionada === null) {
            return res.json({ message: 'erro ao pegar o tempo' });
        } else {
            //console.log("linha 336 /odf/ ", obj);
            return res.status(200).json(obj);
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: "erro ao pegar o tempo" });
    } finally {
        // await connection.close()
    }
}