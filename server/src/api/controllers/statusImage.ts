import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';
import { pictures } from '../pictures';

export const statusImage: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    const statuString: string = String('_status')
    const valuesResult: string[] = [];


    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    // console.log('variables.cookies', variables.cookies);
    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    // console.log('-- StatusImage.ts-- ', resultVerifyCodeNote);

    if (resultVerifyCodeNote.accepted) {
        const lookOnProcess = await selectQuery( 26, variables.cookies)

        if (lookOnProcess.data) {
            for await (const [i, record] of lookOnProcess.data.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], statuString, String(i));
                valuesResult.push(path);
            }
            console.log('valuesResult', valuesResult);
            if(valuesResult){
                return res.status(200).json({ status: message(1), message: message(1), data: valuesResult })
            } else {
                return res.status(200).json({ status: message(1), message: message(1), data: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(17), data: message(33) })
        }
    } else {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }
}