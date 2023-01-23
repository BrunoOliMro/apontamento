import { inicializer } from '../services/variableInicializer';
import { cookieGenerator } from '../utils/cookieGenerator';
import { message } from '../services/message';
import { RequestHandler } from 'express';
import { selectQuery } from '../services/query';

export const searchBagde: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.body.badge) {
        return res.json({ status: message(1), message: message(17), data: message(33) });
    }

    const resultQuery = await selectQuery(16, variables.body)

    if (resultQuery.message !== message(17)) {
        await cookieGenerator(res, resultQuery.data![0])
    }

    return res.json({ status: message(1), message: message(1), data: resultQuery.data })
}