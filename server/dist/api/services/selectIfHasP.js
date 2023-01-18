"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectToKnowIfHasP = void 0;
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const select_1 = require("./select");
const update_1 = require("./update");
const mssql_1 = __importDefault(require("mssql"));
const selectToKnowIfHasP = async (obj) => {
    let response = {
        message: '',
        quantidade: obj.data.QTDE_LIB,
        childCode: [],
        condic: '',
        execut: 0,
        numeroOperNew: '',
    };
    let quantityToPoint;
    let numeroOperNew = String(obj.data.NUMERO_OPERACAO.replaceAll(' ', '')).replaceAll('000', '');
    obj.data.numeroOperNew = numeroOperNew;
    const updateStorageQuery = [];
    let updateAlocacaoQuery = [];
    const insertAlocaoQuery = [];
    try {
        const resultHasP = await (0, select_1.select)(22, obj.data);
        console.log('result Select has P', resultHasP);
        if (resultHasP.length <= 0) {
            return response.message = (0, message_1.message)(13);
        }
        else if (resultHasP.length > 0) {
            let execut = Math.max(...resultHasP.map((element) => element.EXECUT));
            const codigoFilho = resultHasP.map((item) => item.NUMITE);
            const numberOfQtd = Math.min(...resultHasP.map((element) => element.QTD_LIBERADA_PRODUZIR));
            const makeReservation = resultHasP.map((item) => item.NUMSEQ).filter((element) => element === numeroOperNew);
            console.log('makeReservation', makeReservation);
            if (makeReservation.length <= 0) {
                return response.message = (0, message_1.message)(13);
            }
            const resultQuantityCst = await (0, select_1.select)(21, obj.data);
            console.log('resultQuantityCst', resultQuantityCst);
            if (resultQuantityCst.length > 0) {
                if (resultQuantityCst[0].QUANTIDADE > 0) {
                    response.quantidade = resultQuantityCst[0].QUANTIDADE;
                    response.childCode = codigoFilho;
                    response.execut = execut;
                    response.condic = 'P';
                    response.message = (0, message_1.message)(15);
                    return response;
                }
            }
            if (obj.data.QTDE_LIB <= 0) {
                return response.message = (0, message_1.message)(12);
            }
            else if (numberOfQtd <= 0) {
                return response.message = (0, message_1.message)(12);
            }
            else if (obj.data.QTDE_LIB < numberOfQtd) {
                quantityToPoint = obj.data.QTDE_LIB;
            }
            else {
                quantityToPoint = numberOfQtd;
            }
            const quantitySetStorage = Number(quantityToPoint * execut);
            response.quantidade = quantityToPoint;
            response.condic = resultHasP[0].CONDIC;
            response.childCode = codigoFilho;
            response.execut = execut;
            obj.data.valorApontado = quantityToPoint;
            obj.data.QTDE_LIB = quantityToPoint;
            console.log('quantityToPoint', quantityToPoint);
            try {
                codigoFilho.forEach((element) => {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${quantitySetStorage} WHERE 1 = 1 AND CODIGO = '${element}'`);
                });
                const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
                let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
                if (updateStorage > 0) {
                    try {
                        codigoFilho.forEach((codigoFilho) => {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${quantityToPoint} WHERE 1 = 1 AND ODF = '${obj.data.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`);
                        });
                        const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                        if (updateAlocacao <= 0) {
                            try {
                                if (makeReservation) {
                                    codigoFilho.forEach((codigoFilho) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data.NUMERO_ODF}, ${numeroOperNew}, '${obj.data.CODIGO_PECA}', '${codigoFilho}', ${quantityToPoint}, 'ADDRESS', NULL, GETDATE(), '${obj.data.FUNCIONARIO}')`);
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
        }
        else {
            return response.message = (0, message_1.message)(0);
        }
    }
    catch (error) {
        console.log('linha 148 /error: selectHasP/: ', error);
        return response.message = (0, message_1.message)(0);
    }
};
exports.selectToKnowIfHasP = selectToKnowIfHasP;
//# sourceMappingURL=selectIfHasP.js.map