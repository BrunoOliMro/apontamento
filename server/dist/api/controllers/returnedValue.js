"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const odfIndex_1 = require("../utils/odfIndex");
const sanitize_1 = require("../utils/sanitize");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const returnedValue = async (req, res) => {
    try {
        var quantityPointedBack = Number((0, sanitize_1.sanitize)(req.body['quantity'])) || null;
        var supervisor = (0, sanitize_1.sanitize)(req.body['supervisor']) || null;
        var optionChoosed = String((0, sanitize_1.sanitize)(req.body['returnValueStorage'])) || null;
        if (!optionChoosed) {
            return res.json({ message: 'Não foi indicado boas e ruins' });
        }
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CRACHA']))) || null;
        var data = (0, unravelBarcode_1.unravelBarcode)((0, sanitize_1.sanitize)(req.body['barcodeReturn'])) || null;
        var lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${data.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
        var goodFeed = null;
        var badFeed = null;
        var pointCode = [8];
        var pointCodeDescription = null;
        var motives = null;
        var timeSpend = null;
    }
    catch (error) {
        console.log('Error on returning values --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    var response = {
        message: '',
    };
    if (optionChoosed === 'BOAS') {
        goodFeed = quantityPointedBack;
    }
    if (optionChoosed === 'RUINS') {
        badFeed = quantityPointedBack;
    }
    if (!goodFeed) {
        goodFeed = 0;
    }
    if (!badFeed) {
        badFeed = 0;
    }
    const codeNoteResult = await (0, codeNote_1.codeNote)(data.numOdf, data.numOper, data.codMaq, employee);
    if (codeNoteResult.message !== 'Begin new process') {
        return res.json({ message: 'Not possible to return' });
    }
    let valorTotal = goodFeed + badFeed;
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, data.numOper);
    const selectedItens = groupOdf[indexOdf];
    if (selectedItens.odf.QTDE_APONTADA < valorTotal || selectedItens.odf.QTDE_APONTADA <= 0 || selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF === 0 || !selectedItens.odf.QTD_REFUGO && badFeed > 0) {
        return res.json({ message: 'No limit' });
    }
    else if (!selectedItens.odf || '00' + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== data.numOper) {
        response.message = 'Invalid ODF';
        return res.json(response);
    }
    else {
        let codigoPeca = String(selectedItens.odf.CODIGO_PECA);
        let revisao = String(selectedItens.odf.REVISAO);
        let qtdLib = selectedItens.odf.QTDE_LIB - valorTotal;
        let faltante = selectedItens.odf.QTD_FALTANTE - valorTotal;
        let retrabalhada = null;
        let qtdLibMax = selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF;
        const selectSuper = await (0, select_1.select)(lookForSupervisor);
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await (0, insert_1.insertInto)(employee, data.numOdf, codigoPeca, revisao, data.numOper, data.codMaq, qtdLibMax, goodFeed, badFeed, pointCode, pointCodeDescription, motives, faltante, retrabalhada, timeSpend);
                if (insertHisCodReturned) {
                    const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - ${goodFeed}, QTD_FALTANTE = QTD_FALTANTE - ${faltante}, QTDE_LIB = ${qtdLib} ,QTD_REFUGO = QTD_REFUGO - ${badFeed} WHERE 1 = 1 AND NUMERO_ODF = '${data.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${data.numOper}' AND CODIGO_MAQUINA = '${data.codMaq}'`;
                    const updateValuesOnPcp = await (0, update_1.update)(updateQuery);
                    if (updateValuesOnPcp === 'Success') {
                        return res.status(200).json({ message: 'Success' });
                    }
                    else {
                        return res.json({ message: 'Error' });
                    }
                }
                else {
                    return res.json({ message: 'Error' });
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: 'Error' });
            }
        }
        else {
            return res.json({ message: 'Error' });
        }
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map