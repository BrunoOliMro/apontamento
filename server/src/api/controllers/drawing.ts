import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const drawing: RequestHandler = async (req, res) => {
    //const connection = await mssql.connect(sqlConfig);
    const revisao: string  = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let desenho = String("_desenho")
    const lookForImages = `SELECT DISTINC [NUMPEC], [IMAGEM], [REVISAO] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = ${revisao} AND IMAGEM IS NOT NULL`
    try {
        const resource: any = await select(lookForImages)
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