import { RequestHandler } from "express";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    let NUMERO_ODF = decrypted(String(sanitize(req.cookies["NUMERO_ODF"])))
    let resultPeçasBoas;
    const lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY DATAHORA DESC`
    const lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY OP ASC`
    try {
        const detailHistoric: any = await select(lookForDetail)
        const generalHistoric: any = await select(lookforGeneric)

        let obj: any = []

        for (const iterator of detailHistoric) {
            if (iterator.BOAS > 0) {
                obj.push(iterator)
            }
            if (iterator.REFUGO > 0) {
                obj.push(iterator)
            }
        }

        resultPeçasBoas = detailHistoric.reduce((acc: any, iterator: any) => {
            return acc + iterator.BOAS + iterator.REFUGO
        }, 0)

        if (resultPeçasBoas > 0) {
            let objRes = {
                resourceDetail: generalHistoric,
                resource: obj,
                message: 'Exibir histórico'
            }
            return res.json(objRes)
        }
        if (resultPeçasBoas <= 0) {
            return res.json({ message: 'Não há histórico a exibir' })
        } else {
            return res.json({ message: 'Error ao localizar o histórico' });
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Error ao localizar o histórico' });
    } finally {
        //await connection.close()
    }
}