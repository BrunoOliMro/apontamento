import { RequestHandler } from "express";
import { cookieCleaner } from "../utils/clearCookie";

export const clear: RequestHandler = async (_req, res) => {
    const x = await cookieCleaner(res)
    if (x) {
        return res.json({ message: 'Success' })
    } else {
        return res.json({ message: '' })
    }
}