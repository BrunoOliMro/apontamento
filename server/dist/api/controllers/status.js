"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const status = async (req, res) => {
    try {
        var partCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])).replaceAll(' ', '')) || null;
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
        var revision = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || null;
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var quantityReleased = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(String(req.cookies['QTDE_LIB'])))) || null;
        var startSetupTime = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['startSetupTime']))) || null;
        var stringLookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND NUMOPE = ${operationNumber} AND MAQUIN = '${codeMachine}' AND REVISAO = ${revision} ORDER BY REVISAO DESC`;
        var response = {
            message: '',
            temporestante: 0,
        };
    }
    catch (error) {
        console.log('Error on Status.ts --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const lookForTimer = await (0, select_1.select)(stringLookForTimer);
            let timeLeft = Number(lookForTimer[0].EXECUT * quantityReleased * 1000 - (Number(new Date().getTime() - startSetupTime))) || 0;
            if (timeLeft > 0) {
                response.temporestante = timeLeft;
                return res.status(200).json(response);
            }
            else if (timeLeft <= 0) {
                timeLeft = 0;
                return res.json({ message: 'Not found' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: pointedCode });
        }
    }
    catch (error) {
        console.log('linha 42 - Status.ts -', error);
        return res.json({ error: true, message: 'Error' });
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map