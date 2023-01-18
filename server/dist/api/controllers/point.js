"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const insertNewOrder_1 = require("../services/insertNewOrder");
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const sendEmail_1 = require("../utils/sendEmail");
const global_config_1 = require("../../global.config");
const query_1 = require("../services/query");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const update_1 = require("../services/update");
const mssql_1 = __importDefault(require("mssql"));
const point = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3]);
    console.log('resultVerifyCodeNote', resultVerifyCodeNote);
    console.log('Number(variables.body.valorFeed)', Number(variables.body.valorFeed) || 0);
    console.log('Number(variables.body.badFeed )', Number(variables.body.badFeed) || 0);
    console.log('Number(variables.body.missingFeed )', Number(variables.body.missingFeed) || 0);
    console.log('Number(variables.body.reworkFeed)', Number(variables.body.reworkFeed) || 0);
    const totalValue = (Number(variables.body.valorFeed) || 0) + (Number(variables.body.badFeed) || 0) + (Number(variables.body.reworkFeed) || 0);
    console.log('totalValue', totalValue);
    const diferenceBetween = Number(variables.cookies.execut) * Number(variables.cookies.QTDE_LIB) - Number(totalValue) * Number(variables.cookies.execut);
    const released = Number(variables.cookies.QTDE_LIB) - totalValue;
    const deleteCstAlocacao = [];
    const updateSaldoReal = [];
    const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
    const valuesFromHisaponta = await (0, query_1.selectQuery)(9, variables.cookies);
    const startProd = new Date(resultVerifyCodeNote.time).getTime();
    const finalProdTimer = Number(new Date().getTime() - startProd) || null;
    console.log('Number(variables.body.missingFeed) + Number(variables.cookies.QTDE_LIB!)', (Number(variables.body.missingFeed) || 0) + (Number(variables.cookies.QTDE_LIB) || 0));
    console.log('a', Number(variables.body.missingFeed) + Number(variables.cookies.QTDE_LIB) - totalValue);
    variables.body.missingFeed = variables.cookies.QTDE_LIB - totalValue;
    console.log('missingFeed', variables.body.missingFeed);
    console.log('total value', totalValue);
    console.log('VALOR A ser apontado', variables.body.missingFeed - totalValue);
    variables.cookies.QTDE_LIB = Number(variables.cookies.QTDE_LIB);
    variables.cookies.pointedCodeDescription = ['Fin Prod.'];
    variables.cookies.tempoDecorrido = finalProdTimer;
    variables.cookies.pointedCode = [4];
    if (!resultVerifyCodeNote.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(5), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code });
    }
    if (!totalValue) {
        return res.json((0, message_1.message)(0));
    }
    else if (!variables.body.supervisor && totalValue === variables.cookies.QTDE_LIB) {
        if (variables.body.badFeed > 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(21), data: (0, message_1.message)(33) });
        }
        else {
            variables.body.supervisor = '004067';
        }
    }
    else if (!Number(variables.cookies.QTDE_LIB) || Number(variables.body.valorFeed) > Number(variables.cookies.QTDE_LIB) || totalValue > Number(variables.cookies.QTDE_LIB) || Number(variables.body.badFeed) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.missingFeed) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.reworkFeed) > Number(variables.cookies.QTDE_LIB)) {
        return res.json({ message: 'Quantidade apontada excede o limite' });
    }
    else if (!variables.body.missingFeed) {
        variables.body.missingFeed = variables.cookies.QTDE_LIB - totalValue;
    }
    else if (variables.body.badFeed > 0) {
        if (!variables.body.value) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
        const findSupervisor = await (0, query_1.selectQuery)(10, variables.body);
        if (!findSupervisor.message) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(17), data: (0, message_1.message)(33) });
        }
    }
    if (variables.cookies.FUNCIONARIO !== valuesFromHisaponta.data[0].USUARIO) {
        variables.cookies.arrayDeCodAponta = [4, 5, 6];
        variables.cookies.descriptionArrat = ['Fin Prod.', 'Rip Ini.', 'Rip Fin.'];
        variables.cookies.goodEnd = null;
        variables.cookies.badEnd = null;
        variables.cookies.missingEnd = null;
        variables.cookies.reworkEnd = null;
        const resultEndingProcess = await (0, insert_1.insertInto)(variables.cookies);
        if (resultEndingProcess === (0, message_1.message)(1)) {
            variables.cookies.descriptionArray = ['Ini Setup.', 'Fin Setup.', 'Ini Prod.'];
            variables.cookies.codeArray = [1, 2, 3];
            const resultNewProcess = await (0, insert_1.insertInto)(variables.cookies);
            if (resultNewProcess !== (0, message_1.message)(1)) {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
    console.log('variables.cookies.condic', variables.cookies);
    if (variables.cookies.condic === 'P') {
        console.log('updating peças filhasss...');
        try {
            if (!variables.cookies.childCode) {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
            }
            variables.cookies.childCode = variables.cookies.childCode.split(',');
            console.log('childCode', variables.cookies.childCode);
            console.log('diferenceBetween', diferenceBetween);
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            if (totalValue < Number(variables.cookies.QTDE_LIB)) {
                try {
                    variables.cookies.childCode.forEach((codigoFilho) => {
                        console.log('codigoFilho', codigoFilho);
                        const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`;
                        updateSaldoReal.push(stringUpdate);
                    });
                    await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected);
                    console.log('update estoque saldoreal ');
                }
                catch (error) {
                    console.log('linha 140  - Point.ts - ', error);
                    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
                }
            }
            try {
                variables.cookies.childCode.forEach((codigoFilho) => {
                    const stringUpdate = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`;
                    deleteCstAlocacao.push(stringUpdate);
                });
                console.log('delete cst alocacao', deleteCstAlocacao);
                await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log('linha 159  - Point.ts - ', error);
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
            }
            finally {
                await connection.close();
            }
        }
        catch (error) {
            console.log('linha 165  - Point.ts - ', error);
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
    if (variables.body.reworkFeed > 0 || variables.body.missingFeed > 0) {
        console.log('insert into nova ordem');
        const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${resultSelectPcpProg.data[0].QTDE_ODF}, ${released},${totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${resultSelectPcpProg.data[0].CODIGO_CLIENTE}')`;
        await (0, sendEmail_1.createNewOrder)(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg.data[0].QTDE_ODF, resultSelectPcpProg.data[0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA);
        await (0, insertNewOrder_1.insertIntoNewOrder)(newOrderString);
    }
    variables.body.valorApontado = totalValue;
    variables.body.released = released;
    variables.body.NUMERO_OPERACAO = variables.cookies.NUMERO_OPERACAO;
    variables.body.CODIGO_MAQUINA = variables.cookies.CODIGO_MAQUINA;
    variables.body.NUMERO_ODF = variables.cookies.NUMERO_ODF;
    console.log("missingFeed: ", variables.body.missingFeed);
    console.log('updating 3');
    await (0, update_1.update)(3, variables.body);
    console.log('insert into 4');
    variables.cookies.goodFeed = variables.body.valorFeed || 0;
    variables.cookies.badFeed = variables.body.badFeed || 0;
    variables.cookies.missingFeed = variables.body.missingFeed || 0;
    variables.cookies.reworkFeed = variables.body.reworkFeed || 0;
    await (0, insert_1.insertInto)(variables.cookies);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33) });
};
exports.point = point;
//# sourceMappingURL=point.js.map