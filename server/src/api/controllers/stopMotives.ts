import { RequestHandler } from "express";
import { select } from "../services/select";

export const stopMotives: RequestHandler = async (_req, res) => {
    try {
        const response = {
            message : '',
            motives : ''
        }
        const queryStr = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`;
        let resource = await select(queryStr);
        if (!resource) {
            return res.json({ message: 'Algo deu errado' })
        } else if (resource) {
            let resultMap = resource.map((e: any) => e.DESCRICAO)
            if (resultMap) {
                response.message = 'Success'
                response.motives = resultMap
                return res.status(200).json(response)
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}