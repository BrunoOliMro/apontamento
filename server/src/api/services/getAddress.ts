import { insertHisrealAndCstEstoque } from "../utils/updateQuantityCstStorage";
import { selectAddress } from "./selectAddress";

export const getAddress = async (_valueOfParts: number, variables: any, req: any) => {
    const hostname = req.get('host')
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results: any = {};
    var comprimento = 0
    var largura = 0
    var peso = 0
    // const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`
    // const isNullCase = `IS NULL`
    let address: any;

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    const ip = String(Object.entries(results)[0]![1])

    var t0 = performance.now()
    address = await selectAddress(variables.cookies.CODIGO_MAQUINA, comprimento, largura, peso, variables)
    var t1 = performance.now()
    console.log("select address time in get address", t1 - t0);


    let t2 = performance.now()
    await insertHisrealAndCstEstoque(variables.cookies.QTDE_LIB, address[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, variables.cookies.goodFeed, variables.cookies.FUNCIONARIO, hostname, ip, variables.cookies.childCode)
    let t3 = performance.now()
    console.log('chama cstStorage', t3 - t2);
    return address[0].ENDERECO
}