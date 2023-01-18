import { cstStorageUp } from '../utils/updateQuantityCstStorage';
import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectAddress } from '../services/selectAddress';
import { message } from '../services/message';
import { select } from '../services/select';
import { RequestHandler } from 'express';
// var stringPcpProg = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`

export const getPoint: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json(message(33))
    }

    const resultSelectPcpProg = await select(8, variables.cookies)
    const hostname = req.get('host')
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results: any = {}; // Or just '{}', an empty object

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
    console.log('Ob', Object.entries(results));
    console.log('ip', ip);
    console.log('hostname', hostname);

    const pointedCode = await verifyCodeNote(variables.cookies, [4, 5])

    console.log('pointedCode get Point.ts: ', pointedCode);

    if (!pointedCode.accepted) {
        return res.json( { status: message(1), message: message(0), data: message(33), address: message(33) })
    }

    // operationNumber = '00' + operationNumber!.replaceAll(' ', '0')
    //Caso a operação seja 999 fará baixa no estoque
    var comprimento = 1
    var largura = 1
    var peso = 1
    console.log('variables.cookies.NUMERO_OPERACAO', '00', + variables.cookies.NUMERO_OPERACAO.replaceAll(' ', ''));
    if ('00' + String(variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', '')) === '00999') {
        const partCodeCase = `= '${variables.cookies.CODIGO_PECA}'`
        console.log('partCodeCase', partCodeCase);
        const isNullCase = `IS NULL`
        var add: any;
        await callAddress()
        async function callAddress() {
            if (variables.cookies.CODIGO_MAQUINA !== 'EX002') {
                add = await selectAddress(partCodeCase, 5, comprimento, largura, peso)
                if (add === message(17)) {
                    add = await selectAddress(isNullCase, 5, comprimento, largura, peso)
                }
            } else if (variables.cookies.CODIGO_MAQUINA === 'EX002') {
                add = await selectAddress(partCodeCase, 7, comprimento, largura, peso)
                if (add === message(17)) {
                    add = await selectAddress(isNullCase, 7, comprimento, largura, peso)
                }
            }
            // const stringSelectOperacao = `SELECT TOP 1 NUMPEC, QUANT, REVISAO, COMPRIMENTO, LARGURA, AREA, EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND NUMITE IS NOT NULL`

            // o select de cad_endreços tras a composição deste local no estoque
            // const stringSelectCad = `SELECT * FROM  CST_CAD_ENDERECOS CE WHERE 1 = 1  AND ENDERECO = '${add[0].ENDERECO}'`

            const pecas = await select(3)
            const composicaoDeEstoque = await select(4)

            if (composicaoDeEstoque.length <= 0 || pecas.length <= 0) {
                 console.log('ou auqiiiiiiiiiiiiiiiiiiiiiiii');
                await cstStorageUp(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)
                return add[0].ENDERECO = message(46)
                // return res.json({ status: message(1), message: message(1), data: message(46), address: message(46) })
            }
            const alturaDoEndereco = composicaoDeEstoque[0].ALTURA

            const maxTotalWeightParts = pecas[0].EXECUT * resultSelectPcpProg[0].QTD_BOAS!
            const maxWeightStorage = composicaoDeEstoque[0].PESO

            const comprimentoPeca = pecas[0].COMPRIMENTO //* resultSelectPcpProg[0].QTD_BOAS!
            const comprimentoDoEndereco = composicaoDeEstoque[0].COMPRIMENTO

            const larguraPeca = pecas[0].LARGURA //* resultSelectPcpProg[0].QTD_BOAS!
            const larguraDoEndereco = composicaoDeEstoque[0].LARGURA

            const areaDaPeca = comprimentoPeca * larguraPeca
            const maxArea = composicaoDeEstoque[0].COMPRIMENTO * composicaoDeEstoque[0].LARGURA

            const dimesaoCubicaEstoque = comprimentoDoEndereco * larguraDoEndereco * alturaDoEndereco;
            const dimensaoCubicaPeca = comprimentoPeca * larguraPeca * variables.cookies.QTDE_LIB!;

            const dimensaoLinearEstoque = comprimentoDoEndereco + composicaoDeEstoque[0].LARGURA
            const dimensaoLinearPeca = comprimentoPeca + larguraPeca

            const array = []
            // console.log('TA AQUI PESADAO', maxTotalWeightParts);

            if (maxTotalWeightParts > maxWeightStorage) {
                console.log('TA AQUI PESADAO');
                peso = maxWeightStorage
                array.push(false)

            }
            if (comprimentoPeca > comprimentoDoEndereco) {
                console.log('comprimento errado');
                comprimento = comprimentoDoEndereco
                array.push(false)

            }
            if (larguraPeca > larguraDoEndereco) {
                console.log('larguraPeca errado');

                largura = larguraDoEndereco
                array.push(false)

            }
            if (dimensaoLinearPeca > dimensaoLinearEstoque) {
                console.log('dimensaoLinearPeca errado');

                array.push(false)

            }
            if (dimensaoCubicaPeca > dimesaoCubicaEstoque) {
                console.log('dimensaoCubicaPeca errado');

                array.push(false)

            }
            if (maxArea < areaDaPeca) {
                console.log('maxArea errado');

                array.push(false)
            }

            let casesFiltered = array.filter((element: boolean) => element === false)
            if (casesFiltered[0] === false) {
                callAddress()
            }
        }
        await cstStorageUp(variables.cookies.QTDE_LIB, add[0].ENDERECO, variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)

        if (add[0].ENDERECO) {
            console.log('chamando endereço')
            return res.json({ status: message(1), message: message(1), data: add[0].ENDERECO, address: add[0].ENDERECO })
        }
    } else {
        await cstStorageUp(variables.cookies.QTDE_LIB, add = message(46), variables.cookies.CODIGO_PECA, variables.cookies.NUMERO_ODF, resultSelectPcpProg[0].QTD_BOAS, variables.cookies.FUNCIONARIO, hostname, ip)
        return res.json({ status: message(1), message: message(32), data: message(33), address: message(46) })
    }
}
