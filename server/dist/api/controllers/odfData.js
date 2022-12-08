"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const odfData = async (req, res) => {
    const odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"])))) || null;
    let operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_MAQUINA"]))) || null;
    const numOper = "00" + (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0') || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    const lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    };
    try {
        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' });
        }
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine);
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated' || x === 'Machine has stopped') {
            const data = await (0, select_1.select)(lookForOdfData);
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
        else {
            return res.json({ message: x });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map