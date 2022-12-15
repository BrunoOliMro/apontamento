import { RequestHandler } from "express";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    try {
        var odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
        var codeMachine = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    } catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }

    const lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY DATAHORA DESC`
    const lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY OP ASC`
    let obj = []
    try {

        const x = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
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
        } else {
            return res.json({ message: x })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Error ao localizar o histórico' });
    }
}