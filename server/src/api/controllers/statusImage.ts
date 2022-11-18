import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const statusImage: RequestHandler = async (req, res) => {
    const numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const statusImg: string = String("_status")
    //const connection = await mssql.connect(sqlConfig);
    const table = `PROCESSO (NOLOCK)`
    const top = `TOP 1`
    const column = `[NUMPEC], [IMAGEM]`
    const where = `AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`
    const orderBy = ``
    try {
        // const resource = await connection.query(`
        // SELECT TOP 1
        // [NUMPEC],
        // [IMAGEM]
        // FROM PROCESSO (NOLOCK)
        // WHERE 1 = 1
        // AND NUMPEC = '${numpec}'
        // AND REVISAO = '${revisao}'
        // AND IMAGEM IS NOT NULL
        // `).then(record => record.recordset);
        const resource: any = await select(table, top, column, where, orderBy )

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