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
    let numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    let maquina = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let tempoAgora = new Date().getTime() || 0;
    let startTime = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['starterBarcode']))) || null;
    let startTimeNow = Number(startTime) || 0;
    let tempoDecorrido = Number(tempoAgora - startTimeNow) || 0;
    let lookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC`;
    try {
        const resource = await (0, select_1.select)(lookForTimer);
        let qtdProd = Number(req.cookies["qtdProduzir"][0]);
        let tempoExecut = Number(resource[0].EXECUT);
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000;
        let tempoRestante = (tempoTotalExecução - tempoDecorrido);
        if (tempoRestante <= 0) {
            tempoRestante = 0;
        }
        return res.status(200).json(tempoRestante);
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
    finally {
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map