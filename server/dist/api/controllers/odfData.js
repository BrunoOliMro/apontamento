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
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    numeroOdf = Number(numeroOdf);
    const numOper = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))) || null;
    const numOpeNew = String(numOper.toString().replaceAll(' ', "0")) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee']))) || null;
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    let response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
        valorMaxdeProducao: 0,
    };
    try {
        const data = await (0, select_1.select)(lookForOdfData);
        res.cookie("qtdProduzir", (0, encryptOdf_1.encrypted)(String(data[0].QTDE_ODF)));
        res.cookie("QTD_REFUGO", (0, encryptOdf_1.encrypted)(String(data[0].QTD_REFUGO)));
        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' });
        }
        const indexOdf = await (0, odfIndex_1.odfIndex)(data, numOpeNew);
        const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(data, indexOdf);
        response.odfSelecionada = selectedItens.odf;
        response.valorMaxdeProducao = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
        if (!response) {
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