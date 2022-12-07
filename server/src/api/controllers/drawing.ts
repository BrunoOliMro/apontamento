import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const drawing: RequestHandler = async (req, res) => {
    let odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let desenho = String("_desenho")
    const lookForImages = `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = ${revisao} AND IMAGEM IS NOT NULL`
    try {
        const x = await codeNote(odfNumber, operationNumber, codeMachine)
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated') {
            const resource: any = await select(lookForImages)
            let imgResult = [];
            for await (let [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
        } else {
            return res.json({ message: x })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}