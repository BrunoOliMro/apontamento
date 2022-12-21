"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopSupervisor = async (req, res) => {
    try {
        var supervisor = String((0, sanitize_1.sanitize)(req.body['superSuperMaqPar'])) || null;
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var goodFeed = null;
        var missingFeed = null;
        var reworkFeed = null;
        var badFeed = null;
        var pointCode = [3];
        var pointedCodeDescriptionProdIniciated = `Ini Prod.`;
        var motivo = null;
        var tempoDecorrido = 0;
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    }
    catch (error) {
        console.log('Error on StopSupervisor --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (pointedCode.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(lookForSupervisor);
            if (resource) {
                const insertTimerBackTo3 = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointedCodeDescriptionProdIniciated, motivo, missingFeed, reworkFeed, tempoDecorrido);
                if (insertTimerBackTo3) {
                    return res.status(200).json({ message: 'Sucess' });
                }
                else {
                    return res.json({ message: 'Supervisor not found' });
                }
            }
            else if (!resource) {
                return res.json({ message: 'Supervisor not found' });
            }
            else {
                return res.json({ message: 'Supervisor not found' });
            }
        }
        else {
            return res.json({ message: pointedCode });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map