"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddress = void 0;
const updateQuantityCstStorage_1 = require("../utils/updateQuantityCstStorage");
const selectAddress_1 = require("./selectAddress");
const getAddress = async (_valueOfParts, variables, req) => {
    const hostname = req.get('host');
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
    var comprimento = 0;
    var largura = 0;
    var peso = 0;
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
    var t0 = performance.now();
    address = await (0, selectAddress_1.selectAddress)(variables.cookies.CODIGO_MAQUINA, comprimento, largura, peso, variables);
    var t1 = performance.now();
    console.log("select address time in get address", t1 - t0);
    let t2 = performance.now();
    await (0, updateQuantityCstStorage_1.insertHisrealAndCstEstoque)(variables.cookies.QTDE_LIB, address[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, variables.cookies.goodFeed, variables.cookies.FUNCIONARIO, hostname, ip, variables.cookies.childCode);
    let t3 = performance.now();
    console.log('chama cstStorage', t3 - t2);
    return address[0].ENDERECO;
};
exports.getAddress = getAddress;
//# sourceMappingURL=getAddress.js.map