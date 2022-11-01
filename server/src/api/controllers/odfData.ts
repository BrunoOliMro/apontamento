import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const odfData: RequestHandler = async (req, res) => {
    let numeroOdf = String(sanitize(req.cookies["NUMERO_ODF"])) || null
    let numOper = String(sanitize(req.cookies["NUMERO_OPERACAO"])) || null
    let numOpeNew = String(numOper!.toString().replaceAll(' ', "0")) || null
    const connection = await mssql.connect(sqlConfig);

    try {
        const resource = await connection.query(`
        SELECT 
        * 
        FROM
        VW_APP_APTO_PROGRAMACAO_PRODUCAO
        WHERE 1 = 1 
        AND [NUMERO_ODF] = ${numeroOdf}
        AND [CODIGO_PECA] IS NOT NULL
        ORDER BY NUMERO_OPERACAO ASC`.trim()).then(record => record.recordset);
        res.cookie("qtdProduzir", resource[0].QTDE_ODF)
        res.cookie("QTD_REFUGO", resource[0].QTD_REFUGO)
        let codigoOperArray = resource.map(e => e.NUMERO_OPERACAO)
        let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",")
        let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === numOpeNew)
        let odfSelecionada = resource[indiceDoArrayDeOdfs]
        let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
        let qtdOdfArray = resource.map(e => e.QTDE_ODF)
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
            qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1]
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs]
            valorMaxdeProducao = x - valorQtdeApontAnterior || 0
        }

        //Obj que retorna ao front
        const obj = {
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