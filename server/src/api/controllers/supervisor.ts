import { inicializer } from '../services/variableInicializer';
import { selectQuery } from '../services/query';
import { encrypted } from '../utils/encryptOdf';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const supervisor: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(33), data: message(33) })
    }

    const lookForBadge = await selectQuery(10, variables.body)

    if(lookForBadge![0]){
        res.cookie('supervisor', encrypted('verificado'), {httpOnly: true})
        return res.json({ status: message(1), message: message(33), data: lookForBadge![0].CRACHA, supervisor: lookForBadge })
    } else {
        return res.json({ status: message(1), message: message(33), data:  message(33), supervisor: message(33)})
    }
}