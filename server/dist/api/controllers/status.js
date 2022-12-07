"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const status = async (req, res) => {
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
    const codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']));
    let odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO']));
    const lookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${numpec}' AND NUMOPE = ${operationNumber} AND MAQUIN = '${codeMachine}' AND REVISAO = ${revisao} ORDER BY REVISAO DESC`;
    let response = {
        message: '',
        temporestante: 0,
    };
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine);
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated') {
            const resource = await (0, select_1.select)(lookForTimer);
            let tempoRestante = Number(resource[0].EXECUT * Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(String(req.cookies["QTDE_LIB"])))) * 1000 - (Number(new Date().getTime() - (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['startSetupTime'])))))) || 0;
            if (tempoRestante > 0) {
                response.temporestante = tempoRestante;
                return res.status(200).json(response);
            }
            else if (tempoRestante <= 0) {
                tempoRestante = 0;
                return res.json({ message: 'time for execution not found' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: x });
        }
    }
    catch (error) {
        console.log('linha 29 - Status.ts -', error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map