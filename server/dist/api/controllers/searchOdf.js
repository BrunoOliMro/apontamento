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
const encodedOdf_1 = require("../utils/encodedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const update_1 = require("../services/update");
const codeNoteMessage_1 = require("../utils/codeNoteMessage");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let qtdLibMax;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA  FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    console.log('linha 18 /searchOdf/', req.body.message);
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' });
    }
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, dados.numOper);
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' });
    }
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    console.log('linha 33 /searchOdf/', selectedItens.odf);
    if (indexOdf === 0) {
        qtdLibMax = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA;
    }
    else {
        qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
    }
    if (qtdLibMax === 0) {
        return res.json({ message: 'não há limite na odf' });
    }
    console.log('liha 45', qtdLibMax);
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee'])));
    if (!funcionario) {
        console.log("linha 52 /funcionario/", funcionario);
        return res.json({ message: 'Algo deu errado' });
    }
    let qtdLibString = (0, encryptOdf_1.encrypted)(String(qtdLibMax));
    let encryptedOdfNumber = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.NUMERO_ODF));
    const encryptedNextMachine = (0, encryptOdf_1.encrypted)(String(selectedItens.nextOdf.CODIGO_MAQUINA));
    const encryptedNextOperation = (0, encryptOdf_1.encrypted)(String(selectedItens.nextOdf.NUMERO_OPERACAO));
    const encryptedCodePart = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.CODIGO_PECA));
    const encryptedMachineCode = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.CODIGO_MAQUINA));
    const operationNumber = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.NUMERO_OPERACAO));
    const encryptedRevision = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.REVISAO));
    const encodedOdfNumber = (0, encodedOdf_1.encoded)(String(selectedItens.odf.NUMERO_ODF));
    const encodedOperationNumber = (0, encodedOdf_1.encoded)(String(selectedItens.odf.NUMERO_OPERACAO));
    const encodedMachineCode = (0, encodedOdf_1.encoded)(String(selectedItens.odf.CODIGO_MAQUINA));
    res.cookie('NUMERO_ODF', encryptedOdfNumber, { httpOnly: true });
    res.cookie('encodedOdfNumber', encodedOdfNumber, { httpOnly: true });
    res.cookie('encodedOperationNumber', encodedOperationNumber, { httpOnly: true });
    res.cookie('encodedMachineCode', encodedMachineCode, { httpOnly: true });
    res.cookie('MAQUINA_PROXIMA', encryptedNextMachine, { httpOnly: true });
    res.cookie('OPERACAO_PROXIMA', encryptedNextOperation, { httpOnly: true });
    res.cookie('CODIGO_PECA', encryptedCodePart, { httpOnly: true });
    res.cookie('CODIGO_MAQUINA', encryptedMachineCode, { httpOnly: true });
    res.cookie('NUMERO_OPERACAO', operationNumber, { httpOnly: true });
    res.cookie('REVISAO', encryptedRevision, { httpOnly: true });
    let y = await (0, codeNoteMessage_1.codeNoteMessage)(req.body.message);
    console.log('linha 92 /y/', y);
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, qtdLibMax, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA);
    var response = {
        message: '',
        url: '',
    };
    try {
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`;
        const x = await (0, update_1.update)(y);
        console.log('lookForChildComponents.quantidade', lookForChildComponents.quantidade);
        if (x === 'Update sucess') {
            if (lookForChildComponents.quantidade) {
                res.cookie('qtdLibMax', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.quantidade)));
            }
            else {
                res.cookie('qtdLibMax', qtdLibString);
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
                res.cookie('execut', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.execut)));
                res.cookie('reservedItens', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.reserved)));
                res.cookie('codigoFilho', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.codigoFilho)));
                res.cookie('condic', (0, encryptOdf_1.encrypted)(String(lookForChildComponents.condic)));
                res.cookie('quantidade', lookForChildComponents.quantidade);
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