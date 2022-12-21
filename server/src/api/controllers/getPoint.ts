import { RequestHandler } from 'express';
// import mssql from 'mssql';
// import { sqlConfig } from '../../global.config';
// import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { selectAddress } from '../services/selectAddress';
// import { update } from '../services/update';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';
import { cstStorageUp } from '../utils/updateQuantityCstStorage';

export const getPoint: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var goodFeed = Number(decrypted(String(sanitize(req.cookies['qtdBoas'])))) || null;
        var operationNumber = String(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var quantityToProduce = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${goodFeed}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${partCode}'`
        var address;
        var response = {
            message: '',
            address: '',
        }
        var hostname = req.get('host')
        var { networkInterfaces } = require('os');
        var nets = networkInterfaces();
        var results: any = {}; // Or just '{}', an empty object
    } catch (error) {
        console.log('Error on GetPoint', error);
        return res.json({ message: 'Algo deu errado' })
    }
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

    const pointedCode = await codeNote(odfNumber, Number(operationNumber), machineCode, employee)
    if (pointedCode.message !== 'Pointed') {
        return res.json({ message: pointedCode })
    }

    try {
        // operationNumber = '00' + operationNumber!.replaceAll(' ', '0')
        //Caso a operação seja 999 fará baixa no estoque
        var comprimento = 1
        var largura = 1
        var peso = 1
        if ('00' + operationNumber!.replaceAll(' ', '') === '00999') {
            const partCodeCase = `= '${partCode}'`
            const isNullCase = `IS NULL`
            var add: any;
            await callAddress()

            async function callAddress() {
                console.log('comprimento linha 70', comprimento);
                console.log('largura linha 70', largura);
                console.log('peso linha 70', peso);

                if (machineCode !== 'EX002') {
                    add = await selectAddress(partCodeCase, 5, comprimento, largura, peso)
                    if (add === 'Not found') {
                        add = await selectAddress(isNullCase, 5, comprimento, largura, peso)
                    }
                } else if (machineCode === 'EX002') {
                    add = await selectAddress(partCodeCase, 7, comprimento, largura, peso)
                    if (add === 'NotFound') {
                        add = await selectAddress(isNullCase, 7, comprimento, largura, peso)
                    }
                }
                const stringSelectOperacao = `SELECT TOP 1 NUMPEC,  QUANT, REVISAO, COMPRIMENTO, LARGURA, AREA EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND NUMITE IS NOT NULL`

                // o select de cad_endreços tras a composição deste local no estoque
                const stringSelectCad = `SELECT * FROM  CST_CAD_ENDERECOS CE WHERE 1 = 1  AND ENDERECO = '${add[0].ENDERECO}'`

                const composicaoDeEstoque = await select(stringSelectCad)
                const pecas = await select(stringSelectOperacao)

                if (composicaoDeEstoque.length <= 0 || pecas.length <= 0) {
                    console.log('ta aquiiiiiiiiiiiiii');
                    await cstStorageUp(quantityToProduce, add[0].ENDERECO, partCode, odfNumber, goodFeed, employee, hostname, ip)
                    return res.json({ message: 'Success', address: '5A01A01-11' })
                }
                const alturaDoEndereco = composicaoDeEstoque[0].ALTURA

                const maxTotalWeightParts = pecas[0].EXECUT * goodFeed!
                const maxWeightStorage = composicaoDeEstoque[0].PESO

                const comprimentoPeca = pecas[0].COMPRIMENTO //* goodFeed!
                const comprimentoDoEndereco = composicaoDeEstoque[0].COMPRIMENTO

                const larguraPeca = pecas[0].LARGURA //* goodFeed!
                const larguraDoEndereco = composicaoDeEstoque[0].LARGURA

                const areaDaPeca = comprimentoPeca * larguraPeca
                const maxArea = composicaoDeEstoque[0].COMPRIMENTO * composicaoDeEstoque[0].LARGURA

                const dimesaoCubicaEstoque = comprimentoDoEndereco * larguraDoEndereco * alturaDoEndereco;
                const dimensaoCubicaPeca = comprimentoPeca * larguraPeca * quantityToProduce!;

                const dimensaoLinearEstoque = comprimentoDoEndereco + composicaoDeEstoque[0].LARGURA
                const dimensaoLinearPeca = comprimentoPeca + larguraPeca

                const array = []
                if (maxTotalWeightParts > maxWeightStorage) {
                    peso = maxWeightStorage
                    array.push(false)

                }
                if (comprimentoPeca > comprimentoDoEndereco) {
                    comprimento = comprimentoDoEndereco
                    array.push(false)

                }
                if (larguraPeca > larguraDoEndereco) {
                    largura = larguraDoEndereco
                    array.push(false)

                }
                if (dimensaoLinearPeca > dimensaoLinearEstoque) {
                    array.push(false)

                }
                if (dimensaoCubicaPeca > dimesaoCubicaEstoque) {
                    array.push(false)

                }
                if (maxArea < areaDaPeca) {
                    array.push(false)
                }

                let casesFiltered = array.filter((element: boolean) => element === false)
                if (casesFiltered[0] === false) {
                    callAddress()
                }
            }

            await cstStorageUp(quantityToProduce, response.address, partCode, odfNumber, goodFeed, employee, hostname, ip)

            if (add[0].ENDERECO) {
                return res.json({ message: 'Success', address: add[0].ENDERECO })
            }
        } else {
            response.message = 'No address'
            return res.json(response)
        }
    } catch (error) {
        console.log('linha 160', error);
        return res.json({ message: 'Algo deu errado' })
    }
}
