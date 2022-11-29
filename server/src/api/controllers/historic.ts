import { RequestHandler } from "express";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    let NUMERO_ODF = decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))
    const lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY DATAHORA DESC`
    const lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY OP ASC`
    let obj = []
    try {
        const detailHistoric = await select(lookForDetail)

        if (!detailHistoric) {
            return res.json({ message: 'Error ao localizar o histórico' });
        }

        for (const iterator of detailHistoric) {
            if (iterator.BOAS > 0) {
                obj.push(iterator)
            }
            if (iterator.REFUGO > 0) {
                obj.push(iterator)
            }
        }

        detailHistoric.reduce((acc: any, iterator: any) => {
            return acc + iterator.BOAS + iterator.REFUGO
        }, 0)

        try {
            const generalHistoric: any = await select(lookforGeneric)
            if (!generalHistoric) {
                return res.json({ message: 'Error ao localizar o histórico' });
            } else {
                let objRes = {
                    resourceDetail: generalHistoric,
                    resource: obj,
                    message: 'Exibir histórico'
                }
                return res.json(objRes)
            }
        } catch (error) {
            console.log(error)
            return res.json({ message: 'Error ao localizar o histórico' });
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Error ao localizar o histórico' });
    }
}