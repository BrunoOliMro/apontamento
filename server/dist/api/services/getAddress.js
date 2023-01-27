"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddress = void 0;
const updateQuantityCstStorage_1 = require("../utils/updateQuantityCstStorage");
const selectAddress_1 = require("./selectAddress");
const query_1 = require("./query");
const message_1 = require("./message");
const getAddress = async (_valueOfParts, variables, req) => {
    variables.cookies.ENDERECO = '5A01A02-8';
    const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
    const composicaoDeEstoque = await (0, query_1.selectQuery)(4, variables.cookies);
    const pecas = await (0, query_1.selectQuery)(3, variables.cookies);
    const hostname = req.get('host');
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
    var comprimento = 0;
    var largura = 0;
    var peso = 0;
    const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`;
    const isNullCase = `IS NULL`;
    let address;
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
    if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
        address = await (0, selectAddress_1.selectAddress)(partCodeCase, 5, comprimento, largura, peso);
        if (address === (0, message_1.message)(17)) {
            address = await (0, selectAddress_1.selectAddress)(isNullCase, 5, comprimento, largura, peso);
        }
    }
    else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
        address = await (0, selectAddress_1.selectAddress)(partCodeCase, 7, comprimento, largura, peso);
        if (address === (0, message_1.message)(17)) {
            address = await (0, selectAddress_1.selectAddress)(isNullCase, 7, comprimento, largura, peso);
        }
    }
    if ('00' + String(variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '')) === '00999') {
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
                (0, selectAddress_1.selectAddress)(partCodeCase, 5, comprimento, largura, peso);
            }
        });
    }
    console.log('chama cstStorage');
    await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, address[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, variables.cookies.goodFeed, variables.cookies.FUNCIONARIO, hostname, ip);
    if (address) {
        return { message: (0, message_1.message)(1), address: address };
    }
    else {
        return { message: (0, message_1.message)(1), address: (0, message_1.message)(46) };
    }
};
exports.getAddress = getAddress;
//# sourceMappingURL=getAddress.js.map