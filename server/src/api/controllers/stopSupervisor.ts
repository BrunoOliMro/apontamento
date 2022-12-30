import { RequestHandler } from 'express';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const stopSupervisor: RequestHandler = async (req, res) => {
    try {
        var supervisor = String(sanitize(req.body['superMaqPar'])) || null
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))!.replaceAll(' ', '')) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var maxQuantityReleased = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var goodFeed = null
        var missingFeed = null
        var reworkFeed = null
        var badFeed = null
        var pointCode = [3]
        var pointedCodeDescriptionProdIniciated = [`Ini Prod.`]
        var motivo = null
        var tempoDecorrido = 0
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`
    } catch (error) {
        console.log('Error on StopSupervisor --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (pointedCode.message === 'Machine has stopped') {
            const resource = await select(lookForSupervisor)
            if (resource) {
                const insertTimerBackTo3 = await insertInto(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointedCodeDescriptionProdIniciated, motivo, missingFeed, reworkFeed, tempoDecorrido)
                if (insertTimerBackTo3) {
                    return res.status(200).json({ message: 'Sucess' })
                } else {
                    return res.json({ message: 'Supervisor not found' })
                }
            } else if (!resource) {
                return res.json({ message: 'Supervisor not found' })
            } else {
                return res.json({ message: 'Supervisor not found' })
            }
        } else {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}