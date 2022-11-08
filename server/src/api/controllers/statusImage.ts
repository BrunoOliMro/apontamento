import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";

export const statusImage: RequestHandler = async (req, res) => {
    const numpec = String(sanitize(req.cookies["CODIGO_PECA"])) || null
    const revisao = String(sanitize(req.cookies['REVISAO'])) || null
    const statusImg = String("_status")
    const connection = await mssql.connect(sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT TOP 1
        [NUMPEC],
        [IMAGEM]
        FROM PROCESSO (NOLOCK)
        WHERE 1 = 1
        AND NUMPEC = '${numpec}'
        AND REVISAO = '${revisao}'
        AND IMAGEM IS NOT NULL
        `).then(record => record.recordset);
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
            imgResult.push(path);
        }
        //console.log("img", imgResult);
        if (!imgResult) {
            return res.json({ message: 'Erro no servidor' })
        } else {
            return res.status(200).json(imgResult)
        }

    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}