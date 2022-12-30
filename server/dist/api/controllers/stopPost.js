"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const insert_1 = require("../services/insert");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopPost = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var operationNumber = String((0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO']))).replaceAll(' ', '') || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var goodFeed = null;
        var missingFeed = null;
        var reworkFeed = null;
        var pointCode = [7];
        var badFeed = null;
        var motives = null;
        var pointCodeDescriptionStopPost = ['Parada'];
        var end = new Date().getTime() || 0;
        var start = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['startSetupTime'])))) || null;
        var final = Number(end - start) || 0;
    }
    catch (error) {
        console.log('Error on stopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        var pointedCode = await (0, codeNote_1.codeNote)(odfNumber, Number(operationNumber), machineCode, employee);
    }
    catch (error) {
        console.log('Error on StopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    if (pointedCode.message === 'Machine has stopped') {
        return res.json({ message: 'Máquina já parada' });
    }
    else {
        try {
            const resour = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionStopPost, motives, missingFeed, reworkFeed, final);
            if (resour) {
                return res.status(200).json({ message: 'Success' });
            }
            else if (!resour) {
                return res.json({ message: 'Algo deu errado' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        catch (error) {
            console.log(error);
            return res.json({ message: 'Algo deu errado' });
        }
    }
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map