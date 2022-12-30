"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = void 0;
const select_1 = require("../services/select");
const selectAddress_1 = require("../services/selectAddress");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const updateQuantityCstStorage_1 = require("../utils/updateQuantityCstStorage");
const getPoint = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var quantityToProduce = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var stringPcpProg = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
        var resultSelectPcpProg = await (0, select_1.select)(stringPcpProg);
        var response = {
            message: '',
            address: '',
        };
        var hostname = req.get('host');
        var { networkInterfaces } = require('os');
        var nets = networkInterfaces();
        var results = {};
    }
    catch (error) {
        console.log('Error on GetPoint', error);
        return res.json({ message: '' });
    }
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
    const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, Number(operationNumber), machineCode, employee);
    if (pointedCode.message !== 'Pointed') {
        return res.json({ message: pointedCode });
    }
    try {
        var comprimento = 1;
        var largura = 1;
        var peso = 1;
        if ('00' + operationNumber.replaceAll(' ', '') === '00999') {
            const partCodeCase = `= '${partCode}'`;
            const isNullCase = `IS NULL`;
            var add;
            await callAddress();
            async function callAddress() {
                console.log('comprimento linha 70', comprimento);
                console.log('largura linha 70', largura);
                console.log('peso linha 70', peso);
                if (machineCode !== 'EX002') {
                    add = await (0, selectAddress_1.selectAddress)(partCodeCase, 5, comprimento, largura, peso);
                    if (add === 'Not found') {
                        add = await (0, selectAddress_1.selectAddress)(isNullCase, 5, comprimento, largura, peso);
                    }
                }
                else if (machineCode === 'EX002') {
                    add = await (0, selectAddress_1.selectAddress)(partCodeCase, 7, comprimento, largura, peso);
                    if (add === 'NotFound') {
                        add = await (0, selectAddress_1.selectAddress)(isNullCase, 7, comprimento, largura, peso);
                    }
                }
                const stringSelectOperacao = `SELECT TOP 1 NUMPEC, QUANT, REVISAO, COMPRIMENTO, LARGURA, AREA, EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND NUMITE IS NOT NULL`;
                const stringSelectCad = `SELECT * FROM  CST_CAD_ENDERECOS CE WHERE 1 = 1  AND ENDERECO = '${add[0].ENDERECO}'`;
                const composicaoDeEstoque = await (0, select_1.select)(stringSelectCad);
                const pecas = await (0, select_1.select)(stringSelectOperacao);
                if (composicaoDeEstoque.length <= 0 || pecas.length <= 0) {
                    await (0, updateQuantityCstStorage_1.cstStorageUp)(quantityToProduce, add[0].ENDERECO, partCode, odfNumber, resultSelectPcpProg[0].QTD_BOAS, employee, hostname, ip);
                    return res.json({ message: 'Success', address: '5A01A01-11' });
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
                const dimensaoCubicaPeca = comprimentoPeca * larguraPeca * quantityToProduce;
                const dimensaoLinearEstoque = comprimentoDoEndereco + composicaoDeEstoque[0].LARGURA;
                const dimensaoLinearPeca = comprimentoPeca + larguraPeca;
                const array = [];
                console.log('TA AQUI PESADAO', maxTotalWeightParts);
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
            await (0, updateQuantityCstStorage_1.cstStorageUp)(quantityToProduce, response.address, partCode, odfNumber, resultSelectPcpProg[0].QTD_BOAS, employee, hostname, ip);
            if (add[0].ENDERECO) {
                return res.json({ message: 'Success', address: add[0].ENDERECO });
            }
        }
        else {
            response.message = 'No address';
            return res.json(response);
        }
    }
    catch (error) {
        console.log('linha 160', error);
        return res.json({ message: '' });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map