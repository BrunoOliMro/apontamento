"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectToKnowIfHasP = void 0;
const global_config_1 = require("../../global.config");
const query_1 = require("./query");
const message_1 = require("./message");
const update_1 = require("./update");
const mssql_1 = __importDefault(require("mssql"));
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
    if (resultHasP.data.length <= 0) {
        return response.message = (0, message_1.message)(13);
    }
    else if (resultHasP.data.length > 0) {
        const execut = resultHasP.data.map((element) => element.EXECUT);
        const codigoFilho = resultHasP.data.map((item) => item.NUMITE);
        const minQtdAllowed = Math.min(...resultHasP.data.map((element) => element.QTD_LIBERADA_PRODUZIR));
        const processItens = resultHasP.data.map((item) => item.NUMSEQ).filter((element) => element === String(String(obj.data['NUMERO_OPERACAO']).replaceAll(' ', '')).replaceAll('000', ''));
        const minToProd = minQtdAllowed < obj.data['QTDE_LIB'] ? minQtdAllowed : Number(obj.data['QTDE_LIB']);
        const resultQuantityCst = await (0, query_1.selectQuery)(21, obj.data);
        if (resultQuantityCst.data[0]) {
            if (resultQuantityCst.data[0].hasOwnProperty('QUANTIDADE')) {
                if (resultQuantityCst.data[0].QUANTIDADE > 0) {
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
            const updateAlocacaoQuery = [];
            const insertAlocaoQuery = [];
            const updateStorageQuery = [];
            const insertAddressUpdate = [];
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            codigoFilho.forEach((element) => {
                insertAddressUpdate.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${obj.data['NUMERO_ODF']}', ${minToProd} ,'${obj.data['CODIGO_PECA']}', '${element}', '${'999' + element}', 'RESERVA', '${obj.data['NUMERO_OPERACAO'].replaceAll('000', '')}')`);
            });
            await connection.query(insertAddressUpdate.join('\n')).then(result => result.rowsAffected);
            codigoFilho.forEach((element, i) => {
                updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${minToProd * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
            });
            let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
            if (updateStorage > 0) {
                try {
                    codigoFilho.forEach((codigoFilho, i) => {
                        updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${minToProd * execut[i]} WHERE 1 = 1 AND ODF = '${obj.data['NUMERO_ODF']}' AND CODIGO_FILHO = '${codigoFilho}'`);
                    });
                    const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                    if (updateAlocacao <= 0) {
                        try {
                            if (processItens) {
                                codigoFilho.forEach((codigoFilho, i) => {
                                    insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data['NUMERO_ODF']}, ${String(String(obj.data['NUMERO_OPERACAO']).replaceAll(' ', '')).replaceAll('000', '')}, '${obj.data['CODIGO_PECA']}', '${codigoFilho}', ${minToProd * execut[i]}, 'ADDRESS', NULL, GETDATE(), '${obj.data['FUNCIONARIO']}')`);
                                });
                                const insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                if (insertAlocacao <= 0) {
                                    response.message = (0, message_1.message)(0);
                                }
                                else {
                                    try {
                                        const resultUpdate = await (0, update_1.update)(5, obj.data);
                                        if (resultUpdate === (0, message_1.message)(1)) {
                                            response.message = (0, message_1.message)(14);
                                            return response;
                                        }
                                        else {
                                            console.log('linha 105 /selectHAsP/');
                                            return response.message = (0, message_1.message)(0);
                                        }
                                    }
                                    catch (error) {
                                        console.log('linha 109 Error on selectHasP', error);
                                        return response.message = (0, message_1.message)(0);
                                    }
                                }
                            }
                        }
                        catch (error) {
                            console.log('linha 115 /selectHasP/', error);
                            return response.message = (0, message_1.message)(0);
                        }
                    }
                    else {
                        try {
                            const resultUpdate = await (0, update_1.update)(5, obj.data);
                            if (resultUpdate === (0, message_1.message)(1)) {
                                response.message = (0, message_1.message)(14);
                                return response;
                            }
                            else {
                                console.log('linha 125 /selectHAsP/');
                                return response.message = (0, message_1.message)(0);
                            }
                        }
                        catch (error) {
                            console.log('linha 129 Error on selectHasP', error);
                            return response.message = (0, message_1.message)(0);
                        }
                    }
                }
                catch (error) {
                    console.log('linha 134 /selectHasp/', error);
                    return response.message = (0, message_1.message)(0);
                }
            }
            else {
                return response.message = (0, message_1.message)(0);
            }
        }
        catch (error) {
            console.log('linha 141 /selectHasP/', error);
            return response.message = (0, message_1.message)(0);
        }
        finally {
            response.condic = resultHasP.data[0].CONDIC;
            obj.data['valorApontado'] = minToProd;
            obj.data['QTDE_LIB'] = minToProd;
            response.childCode = codigoFilho;
            response.quantidade = minToProd;
            response.message = (0, message_1.message)(14);
            response.execut = execut;
            return response;
        }
    }
    else {
        return response.message = (0, message_1.message)(0);
    }
};
exports.selectToKnowIfHasP = selectToKnowIfHasP;
//# sourceMappingURL=selectIfHasP.js.map