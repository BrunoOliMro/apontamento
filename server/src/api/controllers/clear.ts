import { RequestHandler } from "express";
import { message } from "../services/message";
import { cookieCleaner } from "../utils/clearCookie";

export const clear: RequestHandler = async (_req, res) => {
    const resultCleaner = await cookieCleaner(res)
    return res.json({ status: message(1), message: message(1), data: resultCleaner })
}