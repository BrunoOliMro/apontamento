import { RequestHandler } from "express";
import { cookieCleaner } from "../utils/clearCookie";

export const clear: RequestHandler =  async (_req, res) =>{
    await cookieCleaner(res)
    return res.json({message : 'Tudo limpo'})
}