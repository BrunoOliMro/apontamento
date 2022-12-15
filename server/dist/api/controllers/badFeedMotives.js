"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badFeedMotives = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const badFeedMotives = async (req, res) => {
    try {
        var y = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`;
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
        var codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    }
    catch (error) {
        console.log('Error on BadFeedMotives --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(y);
            const resoc = resource.map((e) => e.DESCRICAO);
            if (resource.length > 0) {
                return res.status(200).json(resoc);
            }
            else {
                return res.json({ message: 'erro em motivos do refugo' });
            }
        }
        else {
            return res.json({ message: pointedCode.message });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro em motivos de refugo' });
    }
};
exports.badFeedMotives = badFeedMotives;
//# sourceMappingURL=badFeedMotives.js.map