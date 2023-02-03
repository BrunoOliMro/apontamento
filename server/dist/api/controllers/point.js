"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const valuesFromChildren_1 = require("../services/valuesFromChildren");
const insertNewOrder_1 = require("../services/insertNewOrder");
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const getAddress_1 = require("../services/getAddress");
const sendEmail_1 = require("../utils/sendEmail");
const query_1 = require("../services/query");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const update_1 = require("../services/update");
const point = async (req, res) => {
    var t0 = performance.now();
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables.body) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3]);
    if (!resultVerifyCodeNote.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(5), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
    }
    const totalValue = (Number(variables.body.valorFeed) || 0) + (Number(variables.body.badFeed) || 0) + (Number(variables.body.reworkFeed) || 0) + (Number(variables.body.missingFeed) || 0);
    const released = Number(variables.cookies.QTDE_LIB) - totalValue;
    const startProd = new Date(resultVerifyCodeNote.time).getTime();
    const finalProdTimer = Number(new Date().getTime() - startProd) || null;
    variables.body.valorApontado = totalValue;
    variables.body.released = released;
    variables.body.NUMERO_OPERACAO = variables.cookies.NUMERO_OPERACAO;
    variables.body.CODIGO_MAQUINA = variables.cookies.CODIGO_MAQUINA;
    variables.body.NUMERO_ODF = variables.cookies.NUMERO_ODF;
    variables.cookies.QTDE_LIB = Number(variables.cookies.QTDE_LIB);
    variables.cookies.pointedCodeDescription = ['Fin Prod.'];
    variables.cookies.tempoDecorrido = finalProdTimer;
    variables.cookies.pointedCode = [4];
    variables.cookies.goodFeed = variables.body.valorFeed || 0;
    variables.cookies.badFeed = variables.body.badFeed || 0;
    variables.cookies.missingFeed = variables.body.missingFeed || 0;
    variables.cookies.reworkFeed = variables.body.reworkFeed || 0;
    if (!totalValue) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
    }
    else if (!variables.body.supervisor && totalValue === variables.cookies.QTDE_LIB) {
        if (variables.body.badFeed > 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(21), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
        else {
            variables.body.supervisor = '004067';
        }
    }
    else if (!Number(variables.cookies.QTDE_LIB) || Number(variables.body.valorFeed) > Number(variables.cookies.QTDE_LIB) || totalValue > Number(variables.cookies.QTDE_LIB) || Number(variables.body.badFeed) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.missingFeed) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.reworkFeed) > Number(variables.cookies.QTDE_LIB)) {
        return res.json({ message: 'Quantidade apontada excede o limite' });
    }
    else if (variables.body.badFeed > 0) {
        if (!variables.body.supervisor) {
            console.log('provalmente aqui');
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
        const findSupervisor = await (0, query_1.selectQuery)(10, variables.body);
        if (findSupervisor.length <= 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(17), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
    }
    let t3 = performance.now();
    console.log("Call Variables in point.ts took: " + (t3 - t0) + " milliseconds.");
    var t4 = performance.now();
    const valuesFromHisaponta = await (0, query_1.selectQuery)(9, variables.cookies);
    if (variables.cookies.FUNCIONARIO !== valuesFromHisaponta[0].USUARIO) {
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
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
    }
    var t5 = performance.now();
    console.log("Call t5 and t4 took: ", (t5 - t4));
    var t6 = performance.now();
    if (variables.cookies.condic === 'P') {
        variables.cookies.totalValue = totalValue;
        await (0, valuesFromChildren_1.getChildrenValuesBack)(variables, req) || '';
    }
    var t9 = performance.now();
    console.log('t6 e t9', t9 - t6);
    var t11 = performance.now();
    if (variables.body.reworkFeed > 0 || variables.body.missingFeed > 0) {
        const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
        await (0, sendEmail_1.createNewOrder)(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg[0].QTDE_ODF, resultSelectPcpProg[0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA);
        await (0, insertNewOrder_1.insertIntoNewOrder)(variables, 0);
    }
    var t12 = performance.now();
    console.log('t12 e t11', t12 - t11);
    var t15 = performance.now();
    var address;
    if ('00' + String(variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '')) === '00999') {
        address = await (0, getAddress_1.getAddress)(totalValue, variables, req);
    }
    var resFromChildren = '';
    if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)) {
        resFromChildren = await (0, getAddress_1.getAddress)(variables.cookies.totalValue - Number(variables.cookies.QTDE_LIB), variables, req);
    }
    var t16 = performance.now();
    console.log('ADDREESS: ', t16 - t15);
    console.log('address', address);
    console.log('resFromChildren', resFromChildren);
    var t7 = performance.now();
    await (0, update_1.update)(3, variables.body);
    await (0, insert_1.insertInto)(variables.cookies);
    var t8 = performance.now();
    console.log('T7 e T8 took: ', t8 - t7);
    var t1 = performance.now();
    console.log("Call Point.ts took: ", t1 - t0);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: (0, message_1.message)(49), address: !address ? (0, message_1.message)(33) : address, returnValueAddress: !resFromChildren.returnValueAddress ? (0, message_1.message)(33) : resFromChildren.returnValueAddress.address[0].ENDERECO });
};
exports.point = point;
//# sourceMappingURL=point.js.map