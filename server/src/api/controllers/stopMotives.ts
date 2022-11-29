import { RequestHandler } from "express";
import { select } from "../services/select";

export const stopMotives: RequestHandler = async (_req, res) => {
    try {
        const s = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`
        let resource = await select(s)
        let resoc = resource.map((e: any) => e.DESCRICAO)
        if (!resource) {
            return res.json({ message: 'erro motivos de parada de maquina' })
        } else {
            return res.status(200).json(resoc)
        }
    } catch (error) {
        return res.json({ message: 'erro motivos de parada de maquina' })
    }
}