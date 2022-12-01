"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const odfData = async (req, res) => {
    const numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"])))) || 0;
    const numOper = "00" + (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0');
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee']))) || null;
    const lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    };
    try {
        const data = await (0, select_1.select)(lookForOdfData);
        let x = (0, encryptOdf_1.encrypted)(String(data[0].QTDE_ODF));
        res.cookie("qtdLibMax", x);
        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' });
        }
        const indexOdf = await (0, odfIndex_1.odfIndex)(data, numOper);
        const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(data, indexOdf);
        response.odfSelecionada = selectedItens.odf;
        if (response.message === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' });
        }
        else {
            response.message = 'Tudo certo por aqui /OdfData.ts/';
            return res.status(200).json(response);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map