import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const statusImage: RequestHandler = async (req, res) => {
    try {
        var numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var statusImg: string = String("_status")
        var codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var operationNumber = decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))
        var odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))
        var lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`
        var imgResult: string[] = [];
    } catch (error) {
        console.log('Error on StatusImage --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const x = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const resource = await select(lookOnProcess)
            if (resource.length > 0) {
                try {
                    for await (const [i, record] of resource.entries()) {
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
        } else {
            return res.json({ message: x.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}