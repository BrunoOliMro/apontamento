import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const historic: RequestHandler = async (req, res) => {
    const variables = await inicializer(req);
    const obj = [];

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    if (resultVerifyCodeNote.accepted) {
        const detailHistoric = await selectQuery(5, variables.cookies)
        const generalHistoric = await selectQuery(6, variables.cookies)

        console.log('detailHistoric', detailHistoric.data);
        console.log('generalHistoric', generalHistoric.data)
        console.log('DETAIL', detailHistoric);
        console.log('Genereal', generalHistoric );
        if(detailHistoric.data){
            for (const iterator of detailHistoric.data) {
                if (iterator.BOAS > 0) {
                    obj.push(iterator)
                }
                if (iterator.REFUGO > 0) {
                    obj.push(iterator)
                }
            }
            detailHistoric.data.reduce((acc: any, iterator: any) => {
                return acc + iterator.BOAS + iterator.REFUGO
            }, 0)
        }


        let objRes = {
            resourceDetail: detailHistoric.data,
            resource: generalHistoric.data,
            message: message(34)
        }

        // console.log('letRes', objRes);

        return res.json({ status: message(1), message: message(34), data: objRes })
    } else {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }
}