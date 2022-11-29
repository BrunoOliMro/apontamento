"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const status = async (req, res) => {
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    const maquina = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    const lookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC`;
    try {
        const resource = await (0, select_1.select)(lookForTimer);
        const tempoRestante = Number(resource[0].EXECUT * Number((0, decryptedOdf_1.decrypted)((0, sanitize_html_1.default)(String(req.cookies["qtdLibMax"])))) * 1000 - (Number(new Date().getTime() - (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['startSetupTime'])))))) || 0;
        if (tempoRestante > 0) {
            return res.status(200).json(tempoRestante);
        }
        else if (tempoRestante <= 0) {
            return res.json({ message: 'time for execution not found' });
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        console.log('linha 29 - Status.ts -', error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map