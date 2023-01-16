import { selectQuery } from "../services/query";
import { message } from "../services/message";
import { RequestHandler } from "express";

// const queryStr = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`;
export const stopMotives: RequestHandler = async (_req, res) => {
    const result = await selectQuery(27)
    return res.json({ status: message(1), message: message(1), data: result.data })
}