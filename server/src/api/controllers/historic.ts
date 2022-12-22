import { RequestHandler } from 'express';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const historic: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))!.replaceAll(' ', '')) || null
        var codeMachine = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY DATAHORA DESC`
        var lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY OP ASC`
        var obj = []
    } catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        const codePointed = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (codePointed.message === 'Ini Prod' || codePointed.message === 'Pointed' || codePointed.message === 'Rip iniciated' || codePointed.message === 'Machine has stopped') {
            const detailHistoric = await select(lookForDetail)
            if (!detailHistoric) {
                return res.json({ message: 'Algo deu errado' });
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
                    return res.json({ message: 'Algo deu errado' });
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
                return res.json({ message: 'Algo deu errado' });
            }
        } else {
            return res.json({ message: codePointed })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Algo deu errado' });
    }
}