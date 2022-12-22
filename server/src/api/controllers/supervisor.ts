import { RequestHandler } from 'express';
import { select } from '../services/select';
import { sanitize } from '../utils/sanitize';

export const supervisor: RequestHandler = async (req, res) => {
    let supervisor = String(sanitize(req.body['supervisor']))!.replaceAll(' ', '') || null
    let stringLookForBadge = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`

    if (
        !supervisor ||
        supervisor === '' ||
        supervisor === '0' ||
        supervisor === '00' ||
        supervisor === '000' ||
        supervisor === '0000' ||
        supervisor === '00000' ||
        supervisor === '000000') {
        return res.json({ message: 'Supervisor not found' })
    }

    try {
        const lookForBadge = await select(stringLookForBadge)
        if (lookForBadge) {
            return res.json({ message: 'Supervisor found' })
        } else {
            return res.json({ message: 'Supervisor not found' })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}