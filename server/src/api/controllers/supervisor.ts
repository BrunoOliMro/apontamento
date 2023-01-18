import { inicializer } from '../services/variableInicializer';
import { message } from '../services/message';
import { select } from '../services/select';
import { RequestHandler } from 'express';
import { encrypted } from '../utils/encryptOdf';

export const supervisor: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(33), data: message(33) })
    }

    const lookForBadge = await select(10, variables.body)
    res.cookie('supervisor', encrypted('verificado'), {httpOnly: true})
    return res.json({ status: message(1), message: message(33), data: lookForBadge })
}