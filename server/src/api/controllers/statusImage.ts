import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const statusImage: RequestHandler = async (req, res) => {
    const numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const statusImg: string = String("_status")
    const lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`
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
        const resource = await select(lookOnProcess)

        let imgResult: string[] = [];
        if (typeof resource !== 'string') {
            for await (let [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                imgResult.push(path);
            }
        }

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