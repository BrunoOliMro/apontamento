import { inicializer } from '../services/variableInicializer';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';
import { pictures } from '../pictures';
import { verifyCodeNote } from '../services/verifyCodeNote';

export const drawing: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    variables.cookies.drawingString = String('_drawing');
    const valuesResult = [];

    if (!variables) {
        return res.status(400).json({ status: message(1), message: message(0), data: message(33) });
    }

    const resultVerify = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    if (resultVerify.accepted) {
        const result: any = await selectQuery(19, variables.cookies)
        for await (const [i, record] of result!.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], variables.drawingString, String(i));
            valuesResult.push(path);
        }
        return res.status(200).json({ status: message(1), message: message(1), data: valuesResult });
    } else {
        return res.status(400).json({ status: message(1), message: message(0), data: message(33) })
    }
}
