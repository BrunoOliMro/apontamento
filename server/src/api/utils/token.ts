import { Request, Response } from "express"

export const token = async (req: Request, _res: Response) =>{
    const authHeaders = req.headers["authorization"]
    const token = authHeaders && authHeaders.split(' ')
    return token
}