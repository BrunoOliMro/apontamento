"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badFeedMotives = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const badFeedMotives = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))).replaceAll(' ', '')) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var motivesString = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`;
    }
    catch (error) {
        console.log('Error on BadFeedMotives --cookies--', error);
        return res.json({ message: '' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resultMotives = await (0, select_1.select)(motivesString);
            const resultMap = resultMotives.map((element) => element.DESCRICAO);
            if (resultMotives.length > 0) {
                return res.status(200).json(resultMap);
            }
            else {
                return res.json({ message: '' });
            }
        }
        else {
            return res.json({ message: pointedCode.message });
        }
    }
    catch (error) {
        console.log('BadFeedMotives :', error);
        return res.json({ message: '' });
    }
};
exports.badFeedMotives = badFeedMotives;
//# sourceMappingURL=badFeedMotives.js.map