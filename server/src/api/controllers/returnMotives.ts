import { selectQuery } from "../services/query";
import { message } from "../services/message";
import { RequestHandler } from "express"

export const returnMotives: RequestHandler = async (_req, res) => {
    const result = await selectQuery(13)
    return res.json({ status: message(1), message: message(1), data: result || message(33) })
}