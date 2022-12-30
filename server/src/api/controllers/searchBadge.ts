import { RequestHandler } from 'express';
import { select } from '../services/select';
import { cookieGenerator } from '../utils/cookieGenerator';
import { sanitize } from '../utils/sanitize';

export const searchBagde: RequestHandler = async (req, res) => {
    const message = {
        generalError: 'Ocorreu um erro, tente novamente...',
        badgeSuccess: 'Success',
        badgeNotFound: 'Crachá não encontrado'
    }
    const badge = String(sanitize(req.body['values'])) || null
    const lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${badge}' ORDER BY FUNCIONARIO`;

    if (!badge) {
        return res.json({ message: message.badgeNotFound });
    }

    try {
        const resultBadgeSearch = await select(lookForBadge)
        if (resultBadgeSearch.length <= 0) {
            return res.json({ message: message.badgeNotFound });
        } else if (resultBadgeSearch.length > 0) {
            await cookieGenerator(res, resultBadgeSearch[0])
            return res.json({ message: message.badgeSuccess });
        } else {
            return res.json({ message: message.badgeNotFound });
        }
    } catch (error) {
        console.log('Error on SearchBadge ', error)
        return res.json({ message: message.generalError });
    }
}