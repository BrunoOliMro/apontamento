import { cstStorageUp } from "../utils/updateQuantityCstStorage";
import { selectAddress } from "./selectAddress";
import { selectQuery } from "./query";
import { message } from "./message"

export const getAddress = async (_valueOfParts: number, variables: any, req: any) => {
    variables.cookies.ENDERECO = '5A01A02-8'
    const resultSelectPcpProg = await selectQuery(8, variables.cookies)
    const composicaoDeEstoque = await selectQuery(4, variables.cookies)
    const pecas = await selectQuery(3, variables.cookies)
    const hostname = req.get('host')
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results: any = {};
    var comprimento = 0
    var largura = 0
    var peso = 0
    const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`
    const isNullCase = `IS NULL`
    let address: any;
    // let address = await selectAddress(partCodeCase, 5, comprimento, largura, peso);

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

    if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
        address= await selectAddress(partCodeCase, 5, comprimento, largura, peso)
        if (address=== message(17)) {
            address= await selectAddress(isNullCase, 5, comprimento, largura, peso)
        }
    } else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
        address= await selectAddress(partCodeCase, 7, comprimento, largura, peso)
        if (address=== message(17)) {
            address= await selectAddress(isNullCase, 7, comprimento, largura, peso)
        }
    }


    if ('00' + String(variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', '')) === '00999') {
        const array = []
        if (pecas.data![0].EXECUT * resultSelectPcpProg.data![0].QTD_BOAS! > composicaoDeEstoque.data![0].PESO) {
            peso = composicaoDeEstoque.data![0].PESO
            array.push(false)
        } else if (pecas.data![0].COMPRIMENTO > composicaoDeEstoque.data![0].COMPRIMENTO) {
            comprimento = composicaoDeEstoque.data![0].COMPRIMENTO
            array.push(false)
        } else if (pecas.data![0].LARGURA > composicaoDeEstoque.data![0].LARGURA) {
            largura = composicaoDeEstoque.data![0].LARGURA
            array.push(false)
        } else if (pecas.data![0].COMPRIMENTO + pecas.data![0].LARGURA > composicaoDeEstoque.data![0].COMPRIMENTO + composicaoDeEstoque.data![0].LARGURA) {
            array.push(false)
        } else if (pecas.data![0].COMPRIMENTO * pecas.data![0].LARGURA * variables.cookies.QTDE_LIB! > composicaoDeEstoque.data![0].COMPRIMENTO * composicaoDeEstoque.data![0].LARGURA * composicaoDeEstoque.data![0].ALTURA) {
            array.push(false)
        } else if (composicaoDeEstoque.data![0].COMPRIMENTO * composicaoDeEstoque.data![0].LARGURA < pecas.data![0].COMPRIMENTO * pecas.data![0].LARGURA) {
            array.push(false)
        }

        array.filter((element: boolean) => {
            if (element === false) {
                selectAddress(partCodeCase, 5, comprimento, largura, peso);
            }
        })
    }

    await cstStorageUp(variables.cookies.QTDE_LIB, address![0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data![0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)
    if (address) {
        return { message: message(1), address: address }
    } else {
        return { message: message(1), address: message(46) }
    }
}