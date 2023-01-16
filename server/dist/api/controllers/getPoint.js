"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = void 0;
const updateQuantityCstStorage_1 = require("../utils/updateQuantityCstStorage");
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const selectAddress_1 = require("../services/selectAddress");
const message_1 = require("../services/message");
const select_1 = require("../services/select");
const getPoint = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json((0, message_1.message)(33));
    }
    const resultSelectPcpProg = await (0, select_1.select)(8, variables.cookies);
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
    console.log('Ob', Object.entries(results));
    console.log('ip', ip);
    const pointedCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [4, 5]);
    console.log('pointedCode get Point.ts: ', pointedCode);
    if (!pointedCode.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), address: (0, message_1.message)(33) });
    }
    var comprimento = 1;
    var largura = 1;
    var peso = 1;
    console.log('variables.cookies.NUMERO_OPERACAO', '00', +variables.cookies.NUMERO_OPERACAO.replaceAll(' ', ''));
    if ('00' + String(variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '')) === '00999') {
        console.log('14e9nhgierhbinbitrnbitnibitnbitnbt');
        const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`;
        console.log('partCodeCase', partCodeCase);
        const isNullCase = `IS NULL`;
        var add;
        await callAddress();
        console.log('variables.cookies.CODIGO_MAQUINA', variables.cookies.CODIGO_MAQUINA);
        async function callAddress() {
            if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
                add = await (0, selectAddress_1.selectAddress)(partCodeCase, 5, comprimento, largura, peso);
                console.log('add dif', add);
                if (add === (0, message_1.message)(17)) {
                    add = await (0, selectAddress_1.selectAddress)(isNullCase, 5, comprimento, largura, peso);
                    console.log('add di');
                }
            }
            else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
                add = await (0, selectAddress_1.selectAddress)(partCodeCase, 7, comprimento, largura, peso);
                console.log('add', add);
                if (add === (0, message_1.message)(17)) {
                    add = await (0, selectAddress_1.selectAddress)(isNullCase, 7, comprimento, largura, peso);
                    console.log('add', add);
                }
            }
            const pecas = await (0, select_1.select)(3);
            const composicaoDeEstoque = await (0, select_1.select)(4);
            if (composicaoDeEstoque.length <= 0 || pecas.length <= 0) {
                await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip);
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(46), address: (0, message_1.message)(46) });
            }
            const alturaDoEndereco = composicaoDeEstoque[0].ALTURA;
            const maxTotalWeightParts = pecas[0].EXECUT * resultSelectPcpProg[0].QTD_BOAS;
            const maxWeightStorage = composicaoDeEstoque[0].PESO;
            const comprimentoPeca = pecas[0].COMPRIMENTO;
            const comprimentoDoEndereco = composicaoDeEstoque[0].COMPRIMENTO;
            const larguraPeca = pecas[0].LARGURA;
            const larguraDoEndereco = composicaoDeEstoque[0].LARGURA;
            const areaDaPeca = comprimentoPeca * larguraPeca;
            const maxArea = composicaoDeEstoque[0].COMPRIMENTO * composicaoDeEstoque[0].LARGURA;
            const dimesaoCubicaEstoque = comprimentoDoEndereco * larguraDoEndereco * alturaDoEndereco;
            const dimensaoCubicaPeca = comprimentoPeca * larguraPeca * variables.cookies.QTDE_LIB;
            const dimensaoLinearEstoque = comprimentoDoEndereco + composicaoDeEstoque[0].LARGURA;
            const dimensaoLinearPeca = comprimentoPeca + larguraPeca;
            const array = [];
            if (maxTotalWeightParts > maxWeightStorage) {
                console.log('TA AQUI PESADAO');
                peso = maxWeightStorage;
                array.push(false);
            }
            if (comprimentoPeca > comprimentoDoEndereco) {
                console.log('comprimento errado');
                comprimento = comprimentoDoEndereco;
                array.push(false);
            }
            if (larguraPeca > larguraDoEndereco) {
                console.log('larguraPeca errado');
                largura = larguraDoEndereco;
                array.push(false);
            }
            if (dimensaoLinearPeca > dimensaoLinearEstoque) {
                console.log('dimensaoLinearPeca errado');
                array.push(false);
            }
            if (dimensaoCubicaPeca > dimesaoCubicaEstoque) {
                console.log('dimensaoCubicaPeca errado');
                array.push(false);
            }
            if (maxArea < areaDaPeca) {
                console.log('maxArea errado');
                array.push(false);
            }
            let casesFiltered = array.filter((element) => element === false);
            if (casesFiltered[0] === false) {
                callAddress();
            }
        }
        console.log('add[0].ENDERECO', add[0].ENDERECO);
        console.log('resultSelectPcpProg', resultSelectPcpProg);
        await (0, updateQuantityCstStorage_1.cstStorageUp)(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip);
        if (add[0].ENDERECO) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(46), address: add[0].ENDERECO });
        }
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(32), data: (0, message_1.message)(33), address: (0, message_1.message)(46) });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map