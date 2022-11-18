import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const drawing: RequestHandler = async (req, res) => {
    //const connection = await mssql.connect(sqlConfig);
    const revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const numpec = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let top = `DISTINCT`
    let column = `[NUMPEC], [IMAGEM], [REVISAO]`
    let table = `QA_LAYOUT (NOLOCK)`
    let where = `AND NUMPEC = '${numpec}' AND REVISAO = ${revisao} AND IMAGEM IS NOT NULL`
    let orderBy = ``
    let desenho = String("_desenho")
    try {
        const resource: any = await select(table, top, column, where, orderBy)
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