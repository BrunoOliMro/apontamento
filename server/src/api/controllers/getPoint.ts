// import { cstStorageUp } from '../utils/updateQuantityCstStorage';
// import { inicializer } from '../services/variableInicializer';
// import { verifyCodeNote } from '../services/verifyCodeNote';
// import { selectAddress } from '../services/selectAddress';
// import { selectQuery } from '../services/query';
// import { message } from '../services/message';
// import { RequestHandler } from 'express';

// export const getPoint: RequestHandler = async (req, res) => {
//     const variables = await inicializer(req)

//     if (!variables) {
//         return res.json(message(33))
//     }

//     const resultSelectPcpProg = await selectQuery(8, variables.cookies)
//     const hostname = req.get('host')
//     const { networkInterfaces } = require('os');
//     const nets = networkInterfaces();
//     const results: any = {}; // Or just '{}', an empty object

//     for (const name of Object.keys(nets)) {
//         for (const net of nets[name]) {
//             // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
//             if (net.family === 'IPv4' && !net.internal) {
//                 if (!results[name]) {
//                     results[name] = [];
//                 }
//                 results[name].push(net.address);
//             }
//         }
//     }
//     const ip = String(Object.entries(results)[0]![1])

//     const pointedCode = await verifyCodeNote(variables.cookies, [4])

//     if (!pointedCode.accepted) {
//         return res.json({ status: message(1), message: message(0), data: message(33), address: message(33) })
//     }

//     // operationNumber = '00' + operationNumber!.replaceAll(' ', '0')
//     //Caso a operação seja 999 fará baixa no estoque
//     var comprimento = 1
//     var largura = 1
//     var peso = 1
//     console.log('variables.cookies.NUMERO_OPERACAO', '00', + variables.cookies.NUMERO_OPERACAO.replaceAll(' ', ''));
//     if ('00' + String(variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', '')) === '00999') {
//         const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`
//         const isNullCase = `IS NULL`
//         var add: any;
//         await callAddress()

//         async function callAddress() {
//             if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
//                 add = await selectAddress(partCodeCase, 5, comprimento, largura, peso)
//                 if (add === message(17)) {
//                     add = await selectAddress(isNullCase, 5, comprimento, largura, peso)
//                 }
//             } else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
//                 add = await selectAddress(partCodeCase, 7, comprimento, largura, peso)
//                 if (add === message(17)) {
//                     add = await selectAddress(isNullCase, 7, comprimento, largura, peso)
//                 }
//             }
//             // const stringSelectOperacao = `SELECT TOP 1 NUMPEC, QUANT, REVISAO, COMPRIMENTO, LARGURA, AREA, EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND NUMITE IS NOT NULL`

//             // o select de cad_endreços tras a composição deste local no estoque
//             // const stringSelectCad = `SELECT * FROM  CST_CAD_ENDERECOS CE WHERE 1 = 1  AND ENDERECO = '${add[0].ENDERECO}'`

//             const pecas = await selectQuery(3)
//             const composicaoDeEstoque = await selectQuery(4)

//             if (composicaoDeEstoque.data!.length <= 0 || pecas.data!.length <= 0) {
//                 await cstStorageUp(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data![0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)
//                 return add[0].ENDERECO = message(46)
//             }

//             const array = []
//             if (pecas.data![0].EXECUT * resultSelectPcpProg.data![0].QTD_BOAS! > composicaoDeEstoque.data![0].PESO) {
//                 peso = composicaoDeEstoque.data![0].PESO
//                 array.push(false)
//             } else if (pecas.data![0].COMPRIMENTO > composicaoDeEstoque.data![0].COMPRIMENTO) {
//                 comprimento = composicaoDeEstoque.data![0].COMPRIMENTO
//                 array.push(false)
//             } else if (pecas.data![0].LARGURA > composicaoDeEstoque.data![0].LARGURA) {
//                 largura = composicaoDeEstoque.data![0].LARGURA
//                 array.push(false)
//             } else if (pecas.data![0].COMPRIMENTO + pecas.data![0].LARGURA > composicaoDeEstoque.data![0].COMPRIMENTO + composicaoDeEstoque.data![0].LARGURA) {
//                 array.push(false)
//             } else if (pecas.data![0].COMPRIMENTO * pecas.data![0].LARGURA * variables.cookies.QTDE_LIB! > composicaoDeEstoque.data![0].COMPRIMENTO * composicaoDeEstoque.data![0].LARGURA * composicaoDeEstoque.data![0].ALTURA) {
//                 array.push(false)
//             } else if (composicaoDeEstoque.data![0].COMPRIMENTO * composicaoDeEstoque.data![0].LARGURA < pecas.data![0].COMPRIMENTO * pecas.data![0].LARGURA) {
//                 array.push(false)
//             }

//             array.filter((element: boolean) => {
//                 if (element === false) {
//                     callAddress()
//                 }
//             })
//         }
//         await cstStorageUp(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data![0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)

//         if (add[0].ENDERECO) {
//             return res.json({ status: message(1), message: message(1), data: add[0].ENDERECO, address: add[0].ENDERECO })
//         }
//     } else {
//         await cstStorageUp(variables.cookies.QTDE_LIB, add = message(46), variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg.data![0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)
//         return res.json({ status: message(1), message: message(32), data: message(33), address: message(46) })
//     }
// }
