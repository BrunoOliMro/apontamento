"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const update_1 = require("../services/update");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let qtdLibMax;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO'])));
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA  FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const lookForHisaponta = `SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${dados.numOdf} AND NUMOPE = ${dados.numOper} AND ITEM = '${dados.codMaq}' ORDER BY DATAHORA DESC`;
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' });
    }
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' });
    }
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, dados.numOper);
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' });
    }
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    if (indexOdf === 0) {
        qtdLibMax = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA;
    }
    else {
        qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
    }
    if (qtdLibMax === 0) {
        return res.json({ message: 'não há limite na odf' });
    }
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, qtdLibMax, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA);
    if (lookForChildComponents.quantidade > qtdLibMax) {
        selectedItens.odf.QTDE_LIB = qtdLibMax;
    }
    else {
        selectedItens.odf.QTDE_LIB = lookForChildComponents.quantidade;
    }
    await (0, cookieGenerator_1.cookieGenerator)(res, selectedItens.odf);
    await (0, cookieGenerator_1.cookieGenerator)(res, lookForChildComponents);
    const x = await (0, select_1.select)(lookForHisaponta);
    if (x.length > 0) {
        if (x[0].CODAPONTA === 1 || x[0].CODAPONTA === 2 || x[0].CODAPONTA === 3) {
            return res.json({ message: 'Proceed with process' });
        }
        else if (x[0].CODAPONTA === 4) {
            return res.json({ message: 'Pointed' });
        }
        else if (x[0].CODAPONTA === 5) {
            return res.json({ message: 'Rip iniciated' });
        }
        else if (x[0].CODAPONTA === 6) {
            return res.json({ message: 'Proceed with process' });
        }
        else if (x[0].CODAPONTA === 7) {
            return res.json({ message: 'Máquina Parada' });
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`;
    await (0, update_1.update)(y);
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map