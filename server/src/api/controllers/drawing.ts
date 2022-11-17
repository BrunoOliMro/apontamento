import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";
import { decrypted } from "../utils/decryptedOdf";

export const drawing: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    const revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const numpec = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let desenho = String("_desenho")
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