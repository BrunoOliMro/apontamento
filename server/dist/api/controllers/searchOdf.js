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
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const update_1 = require("../services/update");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let qtdLibMax;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA  FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' });
    }
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, dados.numOper);
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' });
    }
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    console.log('linha 33 /searchOdf/', selectedItens);
    if (indexOdf === 0) {
        qtdLibMax = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA;
    }
    else {
        qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
    }
    if (qtdLibMax === 0) {
        return res.json({ message: 'não há limite na odf' });
    }
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CRACHA'])));
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' });
    }
    await (0, cookieGenerator_1.cookieGenerator)(res, selectedItens.odf);
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, qtdLibMax, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA);
    var response = {
        message: '',
        url: '',
    };
    console.log('linha 101 /searchOdf/', lookForChildComponents.quantidade);
    try {
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`;
        const x = await (0, update_1.update)(y);
        if (x === 'Update sucess') {
            if (lookForChildComponents.quantidade) {
                res.cookie('QTDE_LIB', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.quantidade)));
            }
            if (lookForChildComponents.reserved > qtdLibMax) {
                lookForChildComponents.reserved = qtdLibMax;
            }
            if (lookForChildComponents === 'não é nessa operação que deve ser reservado') {
                return res.json({ message: 'Valores Reservados' });
            }
            if (!lookForChildComponents || lookForChildComponents === 'Quantidade para reserva inválida') {
                return res.json({ message: 'Algo deu errado' });
            }
            if (lookForChildComponents.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            }
            if (lookForChildComponents.message === 'Valores Reservados') {
                await (0, cookieGenerator_1.cookieGenerator)(res, lookForChildComponents);
                return res.json({ message: 'Valores Reservados' });
            }
            if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
                return res.json({ message: 'Quantidade para reserva inválida' });
            }
            if (lookForChildComponents.message === 'Não há item para reservar') {
                return res.json({ message: 'Valores Reservados' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else if (x === 'Algo deu errado') {
            console.log('linha 136 /searchOdf/');
            response.message = 'Algo deu errado';
            return response;
        }
        else {
            console.log('linha 140 /searchOdf/');
            response.message = 'Algo deu errado';
            return response;
        }
    }
    catch (error) {
        console.log('linha 145 Error on selectHasP', error);
        response.message = 'Algo deu errado';
        return res.json({ response });
    }
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map