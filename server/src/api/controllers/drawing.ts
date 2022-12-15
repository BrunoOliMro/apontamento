import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const drawing: RequestHandler = async (req, res) => {
    try {
        var odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        var codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var desenho = String("_desenho")
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var lookForImages = `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = ${revisao} AND IMAGEM IS NOT NULL`
    } catch (error) {
        console.log('Error on Drawing --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resource: any = await select(lookForImages)
            const imgResult = [];
            for await (const [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}