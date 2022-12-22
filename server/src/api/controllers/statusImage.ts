import { RequestHandler } from 'express';
import { pictures } from '../pictures';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const statusImage: RequestHandler = async (req, res) => {
    try {
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var operationNumber = Number(decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))!.replaceAll(' ', '')) || null
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var stringSelectProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = '${revision}' AND IMAGEM IS NOT NULL`
        var statuString: string = String('_status')
        var imgResult: string[] = [];
    } catch (error) {
        console.log('Error on StatusImage --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (pointCode.message === 'Ini Prod' || pointCode.message === 'Pointed' || pointCode.message === 'Rip iniciated' || pointCode.message === 'Machine has stopped') {
            const lookOnProcess = await select(stringSelectProcess)
            if (lookOnProcess.length > 0) {
                try {
                    for await (const [i, record] of lookOnProcess.entries()) {
                        const rec = await record;
                        const path = await pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], statuString, String(i));
                        imgResult.push(path);
                    }
                    return res.status(200).json(imgResult)
                } catch (error) {
                    console.log('Error - statusimage -', error);
                    return res.json({ error: true, message: 'Error' });
                }
            } else {
                return res.json({ message: 'Not found' })
            }
        } else {
            return res.json({ message: pointCode.message })
        }
    } catch (error) {
        console.log('Error on StatusImage', error)
        return res.json({ error: true, message: 'Error' });
    }
}