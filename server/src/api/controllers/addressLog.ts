import { inicializer } from "../services/variableInicializer"
import { unravelBarcode } from "../utils/unravelBarcode" 
import { selectQuery } from "../services/query"
import { message } from "../services/message"
import { RequestHandler } from "express"

export const addressLog: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    const barcode = await unravelBarcode(variables.body.barcode)

    if(!barcode.data){
        return res.json({status: message(1), message: message(0), data: message(33)})
    }

    const data = await selectQuery(31, barcode.data)

    return res.json({status: message(1), message: message(1), data: data})
}