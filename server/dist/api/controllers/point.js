"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const global_config_1 = require("../../global.config");
const mssql_1 = __importDefault(require("mssql"));
const point = async (req, res) => {
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
    const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
    const valuesFromHisaponta = await (0, query_1.selectQuery)(9, variables.cookies);
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
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
        const findSupervisor = await (0, query_1.selectQuery)(10, variables.body);
        if (!findSupervisor.message) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(17), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
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
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: (0, message_1.message)(33), returnValueAddress: (0, message_1.message)(33) });
        }
    }
    var resFromChildren;
    if (variables.cookies.condic === 'P') {
        variables.cookies.totalValue = totalValue;
        resFromChildren = await (0, valuesFromChildren_1.getChildrenValuesBack)(variables, req);
    }
    if (variables.body.reworkFeed > 0 || variables.body.missingFeed > 0) {
        const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE, USUARIO, REVISAO) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${resultSelectPcpProg.data[0].QTDE_ODF}, ${released},${totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${resultSelectPcpProg.data[0].CODIGO_CLIENTE}', '${variables.cookies.FUNCIONARIO}', '${variables.cookies.REVISAO}')`;
        await (0, sendEmail_1.createNewOrder)(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg.data[0].QTDE_ODF, resultSelectPcpProg.data[0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA);
        await (0, insertNewOrder_1.insertIntoNewOrder)(newOrderString);
    }
    var address;
    if ('00' + String(variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '')) === '00999') {
        address = (0, getAddress_1.getAddress)(totalValue, variables, req);
    }
    console.log('resFromChildren.returnValueAddress.address[0].ENDERECO', resFromChildren);
    if (variables.cookies.condic === 'P') {
        const insertEveryAddress = [];
        console.log('historico linha 126');
        variables.cookies.childCode.split(',').forEach((element) => {
            insertEveryAddress.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${Number(variables.cookies.goodFeed)} ,'${variables.cookies.CODIGO_PECA}', '${element}', '${!resFromChildren ? (0, message_1.message)(33) : resFromChildren.returnValueAddress.address[0].ENDERECO}', 'APONTADO', '${variables.cookies.NUMERO_OPERACAO}')`);
        });
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        await connection.query(insertEveryAddress.join('\n')).then(result => result.rowsAffected);
    }
    await (0, update_1.update)(3, variables.body);
    await (0, insert_1.insertInto)(variables.cookies);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code, address: !address ? (0, message_1.message)(33) : address, returnValueAddress: !resFromChildren ? (0, message_1.message)(33) : resFromChildren.returnValueAddress.address[0].ENDERECO });
};
exports.point = point;
//# sourceMappingURL=point.js.map