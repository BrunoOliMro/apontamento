import { inicializer } from "../services/variableInicializer";
import { verifyCodeNote } from "../services/verifyCodeNote";
import { message } from "../services/message";
import { RequestHandler } from "express";

export const pointedCode: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const pointedCode = await verifyCodeNote(variables.cookies, [4, 5])

    if (pointedCode.accepted) {
        return res.status(200).json({ status: message(1), message: message(1), data: pointedCode.code })
    } else {
        return res.status(400).json({ status: message(1), message: message(0), data: pointedCode.code })
    }
}