import { RequestHandler } from 'express';
import { insertInto } from '../services/insert';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const stopPost: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var operationNumber = String(decrypted(String(req.cookies['NUMERO_OPERACAO'])))!.replaceAll(' ', '') || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var maxQuantityReleased = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var goodFeed = null
        var missingFeed = null
        var reworkFeed = null
        var pointCode = [7]
        var badFeed = null
        var motives = null
        var pointCodeDescriptionStopPost = 'Parada'

        //Encerra o processo todo
        var end = new Date().getTime() || 0;
        var start = Number(decrypted(String(sanitize(req.cookies['startSetupTime'])))) || null
        var final: number = Number(end - start!) || 0
    } catch (error) {
        console.log('Error on stopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        var pointedCode = await codeNote(odfNumber, Number(operationNumber), machineCode, employee)
    } catch (error) {
        console.log('Error on StopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    if (pointedCode.message === 'Machine has stopped') {
        return res.json({ message: 'Máquina já parada' })
    } else {
        try {
            //Insere O CODAPONTA 7 de parada de máquina
            const resour = await insertInto(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionStopPost, motives, missingFeed, reworkFeed, final)
            if (resour) {
                return res.status(200).json({ message: 'Success' })
            } else if (resour === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' })
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } catch (error) {
            console.log(error)
            return res.json({ message: 'Algo deu errado' })
        }
    }
}