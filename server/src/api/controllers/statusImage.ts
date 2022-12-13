import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const statusImage: RequestHandler = async (req, res) => {
    const numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const statusImg: string = String("_status")
    const codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const operationNumber = decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))
    let odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))
    const lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`
    let imgResult: string[] = [];
    try {

        const x = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
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
        } else {
            return res.json({ message: x.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}