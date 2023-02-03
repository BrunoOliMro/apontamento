"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAddress = void 0;
const query_1 = require("./query");
const message_1 = require("./message");
const selectAddress = async (codigoMaquina, comprimento, largura, peso, variables) => {
    const resultSelectPcpProg = await (0, query_1.selectQuery)(8, variables.cookies);
    const pecas = await (0, query_1.selectQuery)(3, variables.cookies);
    try {
        const values = {
            CODIGO_PECA: variables.cookies.CODIGO_PECA,
            comprimento: comprimento,
            largura: largura,
            peso: peso,
        };
        let data;
        if (codigoMaquina !== 'EX002') {
            data = await (0, query_1.selectQuery)(33, values);
            if (data) {
                data = await (0, query_1.selectQuery)(34, values);
            }
        }
        else if (codigoMaquina === 'EX002') {
            data = await (0, query_1.selectQuery)(35, values);
            console.log('data 7 = ex002', data);
            if (data) {
                console.log('data 7 = ex002', data);
                data = await (0, query_1.selectQuery)(36, values);
            }
        }
        const composicaoDeEstoque = await (0, query_1.selectQuery)(4, data[0]);
        const array = [];
        if (pecas[0].EXECUT * resultSelectPcpProg[0].QTD_BOAS > composicaoDeEstoque[0].PESO) {
            peso = composicaoDeEstoque[0].PESO;
            array.push(false);
        }
        else if (pecas[0].COMPRIMENTO > composicaoDeEstoque[0].COMPRIMENTO) {
            comprimento = composicaoDeEstoque[0].COMPRIMENTO;
            array.push(false);
        }
        else if (pecas[0].LARGURA > composicaoDeEstoque[0].LARGURA) {
            largura = composicaoDeEstoque[0].LARGURA;
            array.push(false);
        }
        else if (pecas[0].COMPRIMENTO + pecas[0].LARGURA > composicaoDeEstoque[0].COMPRIMENTO + composicaoDeEstoque[0].LARGURA) {
            array.push(false);
        }
        else if (pecas[0].COMPRIMENTO * pecas[0].LARGURA * variables.cookies.QTDE_LIB > composicaoDeEstoque[0].COMPRIMENTO * composicaoDeEstoque[0].LARGURA * composicaoDeEstoque[0].ALTURA) {
            array.push(false);
        }
        else if (composicaoDeEstoque[0].COMPRIMENTO * composicaoDeEstoque[0].LARGURA < pecas[0].COMPRIMENTO * pecas[0].LARGURA) {
            array.push(false);
        }
        array.filter(async (element) => {
            if (element === false) {
                data = await (0, exports.selectAddress)(variables.cookies.CODIGO_MAQUINA, comprimento, largura, peso, variables);
            }
        });
        console.log('data', data);
        return data;
    }
    catch (err) {
        console.log('err in select address ', err);
        return (0, message_1.message)(33);
    }
};
exports.selectAddress = selectAddress;
//# sourceMappingURL=selectAddress.js.map