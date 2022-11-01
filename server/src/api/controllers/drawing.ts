import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";

export const draw: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    const revisao = Number(sanitize(req.cookies['REVISAO'])) || 0
    const numpec = String(sanitize(req.cookies["CODIGO_PECA"])) || null
    let desenho = String("_desenho")

    if (revisao === 0) {
        console.log("linha 13 / draw/ ");
    }
    try {
        const resource = await connection.query(`
        SELECT
        DISTINCT
            [NUMPEC],
            [IMAGEM],
            [REVISAO]
        FROM  QA_LAYOUT(NOLOCK) 
        WHERE 1 = 1 
            AND NUMPEC = '${numpec}'
            AND REVISAO = ${revisao}
            AND IMAGEM IS NOT NULL`).then(res => res.recordset)
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
            imgResult.push(path);
        }
        return res.status(200).json(imgResult);
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}