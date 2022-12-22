import { RequestHandler } from 'express';
import { select } from '../services/select';
import { cookieGenerator } from '../utils/cookieGenerator';
import { encrypted } from '../utils/encryptOdf';
import { sanitize } from '../utils/sanitize';

export const searchBagde: RequestHandler = async (req, res) => {
    let badge = String(sanitize(req.body['badge'])) || null
    let lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${badge}' ORDER BY FUNCIONARIO`;

    if (!badge || badge === '0' || badge === '00' || badge === '000' || badge === '0000' || badge === '00000' || badge === '000000') {
        return res.json({ message: 'Crachá não encontrado' });
    }

    try {
        const findBadge = await select(lookForBadge)
        if (findBadge.length <= 0) {
            return res.json({ message: 'Crachá não encontrado' });
        } else if (findBadge.length > 0) {
            let startSetupTime = encrypted(String(new Date().getTime()));
            res.cookie('startSetupTime', startSetupTime, { httpOnly: true })
            await cookieGenerator(res, findBadge[0])
            return res.json({ message: 'Badge found' });
        } else {
            return res.json({ message: 'Crachá não encontrado' });
        }
    } catch (error) {
        console.log('Error on SearchBadge ', error)
        return res.json({ message: 'Crachá não encontrado' });
    }
}