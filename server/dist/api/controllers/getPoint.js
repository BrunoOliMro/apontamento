"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = void 0;
const updateQuantityCstStorage_1 = require("../utils/updateQuantityCstStorage");
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const selectAddress_1 = require("../services/selectAddress");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const getPoint = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json((0, message_1.message)(33));
    }
    const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
    const hostname = req.get('host');
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    const ip = String(Object.entries(results)[0][1]);
    const pointedCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [4]);
    if (!pointedCode.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), address: (0, message_1.message)(33) });
    }
    var comprimento = 1;
    var largura = 1;
    var peso = 1;
    console.log('variables.cookies.NUMERO_OPERACAO', '00', +variables.cookies.NUMERO_OPERACAO.replaceAll(' ', ''));
    if ('00' + String(variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '')) === '00999') {
        const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`;
        console.log('partCodeCase', partCodeCase);
        const isNullCase = `IS NULL`;
        var add;
        await callAddress();
        async function callAddress() {
            if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
                add = await (0, selectAddress_1.selectAddress)(partCodeCase, 5, comprimento, largura, peso);
                if (add === (0, message_1.message)(17)) {
                    add = await (0, selectAddress_1.selectAddress)(isNullCase, 5, comprimento, largura, peso);
                }
            }
            else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
                add = await (0, selectAddress_1.selectAddress)(partCodeCase, 7, comprimento, largura, peso);
                if (add === (0, message_1.message)(17)) {
                    add = await (0, selectAddress_1.selectAddress)(isNullCase, 7, comprimento, largura, peso);
                }
            }
            const pecas = await (0, query_1.selectQuery)(3);
            const composicaoDeEstoque = await (0, query_1.selectQuery)(4);
            if (composicaoDeEstoque.data.length <= 0 || pecas.data.length <= 0) {
                await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip);
                return add[0].ENDERECO = (0, message_1.message)(46);
            }
            const array = [];
            if (pecas.data[0].EXECUT * resultSelectPcpProg.data[0].QTD_BOAS > composicaoDeEstoque.data[0].PESO) {
                peso = composicaoDeEstoque.data[0].PESO;
                array.push(false);
            }
            else if (pecas.data[0].COMPRIMENTO > composicaoDeEstoque.data[0].COMPRIMENTO) {
                comprimento = composicaoDeEstoque.data[0].COMPRIMENTO;
                array.push(false);
            }
            else if (pecas.data[0].LARGURA > composicaoDeEstoque.data[0].LARGURA) {
                largura = composicaoDeEstoque.data[0].LARGURA;
                array.push(false);
            }
            else if (pecas.data[0].COMPRIMENTO + pecas.data[0].LARGURA > composicaoDeEstoque.data[0].COMPRIMENTO + composicaoDeEstoque.data[0].LARGURA) {
                array.push(false);
            }
            else if (pecas.data[0].COMPRIMENTO * pecas.data[0].LARGURA * variables.cookies.QTDE_LIB > composicaoDeEstoque.data[0].COMPRIMENTO * composicaoDeEstoque.data[0].LARGURA * composicaoDeEstoque.data[0].ALTURA) {
                array.push(false);
            }
            else if (composicaoDeEstoque.data[0].COMPRIMENTO * composicaoDeEstoque.data[0].LARGURA < pecas.data[0].COMPRIMENTO * pecas.data[0].LARGURA) {
                array.push(false);
            }
            array.filter((element) => {
                if (element === false) {
                    callAddress();
                }
            });
        }
        await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip);
        if (add[0].ENDERECO) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: add[0].ENDERECO, address: add[0].ENDERECO });
        }
    }
    else {
        await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, add = (0, message_1.message)(46), variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip);
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(32), data: (0, message_1.message)(33), address: (0, message_1.message)(46) });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map