import { RequestHandler } from "express";
import { select } from "../services/select";
import { sanitize } from "../utils/sanitize";

export const supervisor: RequestHandler = async (req, res) => {
    let supervisor: string = String(sanitize(req.body['supervisor']))
    let lookForBadge = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`

    if (
        !supervisor ||
        supervisor === '' ||
        supervisor === '0' ||
        supervisor === '00' ||
        supervisor === '000' ||
        supervisor === '0000' ||
        supervisor === '00000' ||
        supervisor === '000000') {
        return res.json({ message: 'Supervisor não encontrado' })
    }

    try {
        const resource = await select(lookForBadge)
        if (resource) {
            return res.json({ message: 'Supervisor encontrado' })
        } else {
            return res.json({ message: 'Supervisor não encontrado' })
        }
    } catch (error) {
        return res.json({ message: 'Erro ao localizar supervisor' })
    }
}