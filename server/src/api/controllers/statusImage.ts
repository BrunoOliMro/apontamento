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
    let imgResult: string[] = [];
    try {
        const resource = await select(lookOnProcess)
        if (resource.length > 0) {
            try {
                for await (let [i, record] of resource.entries()) {
                    const rec = await record;
                    const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                    imgResult.push(path);
                }
                return res.status(200).json(imgResult)
            } catch (error) {
                console.log('error - statusimage -', error);
                return res.json({ error: true, message: "Erro no servidor." });
            }
        } else {
            return res.json({ message: 'Status image not found' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}