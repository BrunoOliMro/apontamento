import { RequestHandler } from "express";
import { select } from "../services/select";

export const stopMotives: RequestHandler = async (_req, res) => {
    try {
        const queryStr = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`;
        let resource = await select(queryStr);
        if (!resource) {
            return res.json({ message: 'erro motivos de parada de maquina' })
        } else if (resource) {
            let resoc = resource.map((e: any) => e.DESCRICAO)
            if (resoc) {
                return res.status(200).json(resoc)
            } else {
                return res.json({ message: 'erro motivos de parada de maquina' })
            }
        } else {
            return res.json({ message: 'erro motivos de parada de maquina' })
        }
    } catch (error) {
        return res.json({ message: 'erro motivos de parada de maquina' })
    }
}