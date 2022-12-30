import { RequestHandler } from 'express';
import { pictures } from '../pictures';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const drawing: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))!.replaceAll(' ', '')) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var drawingString = String('_desenho')
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var lookForImages = `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND IMAGEM IS NOT NULL`
    } catch (error) {
        console.log('Error on Drawing --cookies--', error);
        return res.json({ message: '' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resource: any = await select(lookForImages)
            const imgResult = [];
            for await (const [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], drawingString, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: '' });
    }
}