"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectToKnowIfHasP = void 0;
const query_1 = require("./query");
const message_1 = require("./message");
const update_1 = require("./update");
const queryConnector_1 = require("../../queryConnector");
const selectToKnowIfHasP = async (obj) => {
    let response = {
        message: '',
        quantidade: obj.data['QTDE_LIB'],
        childCode: [],
        condic: '',
        execut: [],
        numeroOperNew: '',
    };
    const resultHasP = await (0, query_1.selectQuery)(22, obj.data);
    if (resultHasP.length <= 0) {
        return response.message = (0, message_1.message)(13);
    }
    else {
        const execut = resultHasP.map((element) => element.EXECUT);
        const codigoFilho = resultHasP.map((item) => item.NUMITE);
        const minQtdAllowed = Math.min(...resultHasP.map((element) => element.QTD_LIBERADA_PRODUZIR));
        const processItens = resultHasP.map((item) => item.NUMSEQ).filter((element) => element === String(String(obj.data['NUMERO_OPERACAO']).replaceAll(' ', '')).replaceAll('000', ''));
        const minToProd = minQtdAllowed < obj.data['QTDE_LIB'] ? minQtdAllowed : Number(obj.data['QTDE_LIB']);
        const resultQuantityCst = await (0, query_1.selectQuery)(21, obj.data);
        console.log('resultQuantityCst', resultQuantityCst);
        if (resultQuantityCst[0]) {
            if (resultQuantityCst[0].hasOwnProperty('QUANTIDADE')) {
                if (resultQuantityCst[0].QUANTIDADE > 0) {
                    response.execut = execut;
                    response.condic = 'P';
                    obj.data['valorApontado'] = minToProd;
                    obj.data['QTDE_LIB'] = minToProd;
                    response.childCode = codigoFilho;
                    response.quantidade = minToProd;
                    response.message = (0, message_1.message)(15);
                    return response;
                }
            }
        }
        if (!minToProd || minToProd <= 0) {
            return response = (0, message_1.message)(12);
        }
        if (processItens.length <= 0) {
            return response.message = (0, message_1.message)(13);
        }
        try {
            const insertAddressUpdate = [];
            codigoFilho.forEach((element, i) => {
                insertAddressUpdate.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${obj.data['NUMERO_ODF']}', ${minToProd} ,'${obj.data['CODIGO_PECA']}', '${element}', '${'999' + element}', 'RESERVA', '${obj.data['NUMERO_OPERACAO'].replaceAll('000', '')}')`);
                insertAddressUpdate.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${minToProd * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
                insertAddressUpdate.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data['NUMERO_ODF']}, ${String(String(obj.data['NUMERO_OPERACAO']).replaceAll(' ', '')).replaceAll('000', '')}, '${obj.data['CODIGO_PECA']}', '${element}', ${minToProd * execut[i]}, 'ADDRESS', NULL, GETDATE(), '${obj.data['FUNCIONARIO']}')`);
            });
            const conn = await (0, queryConnector_1.poolConnection)();
            await conn.request().query(insertAddressUpdate.join('\n')).then((result) => result.recordset);
            await (0, update_1.update)(5, obj.data);
            response.condic = resultHasP[0].CONDIC;
            obj.data['valorApontado'] = minToProd;
            obj.data['QTDE_LIB'] = minToProd;
            response.childCode = codigoFilho;
            response.quantidade = minToProd;
            response.message = (0, message_1.message)(14);
            response.execut = execut;
            return response;
        }
        catch (error) {
            console.log('linha 141 /selectHasP/', error);
            return response.message = (0, message_1.message)(0);
        }
    }
};
exports.selectToKnowIfHasP = selectToKnowIfHasP;
//# sourceMappingURL=selectIfHasP.js.map