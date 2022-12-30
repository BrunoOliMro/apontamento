import { RequestHandler } from 'express';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config';
import { insertInto } from '../services/insert';
import { insertIntoNewOrder } from '../services/insertNewOrder';
import { select } from '../services/select';
import { update } from '../services/update';
import { codeNote } from '../utils/codeNote';
import { decodedBuffer } from '../utils/decodeOdf';
//import { decodedBuffer } from '../utils/decodeOdf';
import { decrypted } from '../utils/decryptedOdf';
// import { encrypted } from '../utils/encryptOdf';
//import { encrypted } from '../utils/encryptOdf';
import { sanitize } from '../utils/sanitize';
import { createNewOrder } from '../utils/sendEmail';

export const point: RequestHandler = async (req, res) => {
    try {
        console.log('Body', req.body);
        var goodFeed = Number(sanitize(req.body['valorFeed'])) || null;
        var supervisor = String(sanitize(req.body['supervisor'])) || null
        var motives = sanitize(req.body['value']) || null
        var badFeed = Number(sanitize(req.body['badFeed'])) || null;
        var reworkFeed = Number(sanitize(req.body['reworkFeed'])) || null;
        var condic;
        if (!req.cookies['condic']) {
            condic = null
        } else {
            condic = String(decrypted(String(sanitize(req.cookies['condic'])))) || null
        }
        var odfNumber = Number(decrypted(sanitize(req.cookies['NUMERO_ODF']))) || null
        var operationNumber = Number(decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))!.replaceAll(' ', '')) || null
        var partCode = String(decrypted(sanitize(req.cookies['CODIGO_PECA']))) || null
        var machineCode = String(decrypted(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var maxQuantityReleased = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || null
        var employee = String(decrypted(sanitize(req.cookies['FUNCIONARIO']))) || null
        var revision = String(decrypted(sanitize(req.cookies['REVISAO']))) || null
        var updateSaldoReal: string[] = [];
        var deleteCstAlocacao: string[] = [];
        var decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
        var decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
        var decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))
        var childCode: string[] | null = decrypted(String(sanitize(req.cookies['codigoFilho']))).split(',') || null // VER DEPOIS !!!!!!!!!!!!!!
        var missingFeed: any = Number(sanitize(req.body['missingFeed'])) || null;
        var valorTotalApontado = Number(goodFeed) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed)
        missingFeed = missingFeed + maxQuantityReleased! - valorTotalApontado
        var released = maxQuantityReleased! - valorTotalApontado
        var execut = Number(decrypted(sanitize(req.cookies['execut']))) || null
        var diferenceBetween = execut! * maxQuantityReleased! - valorTotalApontado * execut!
        var pointCode = [4]
        var pointCodeDescriptionFinProd = ['Fin Prod.']
        var stringPcpProg = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
        var stringFromHisaponta = `SELECT TOP 1 USUARIO FROM HISAPONTA WHERE 1 = 1 AND ODF = '${odfNumber}'  ORDER BY DATAHORA DESC`
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`
        var updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${valorTotalApontado}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${badFeed}, QTDE_LIB = ${released}, QTD_FALTANTE = ${missingFeed}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${goodFeed}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${reworkFeed} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`
        var valuesFromHisaponta = await select(stringFromHisaponta)
        var resultSelectPcpProg = await select(stringPcpProg)
    } catch (error) {
        console.log('Error on point.ts --cookies--', error);
        return res.json({ message: '' })
    }

    var response: any = {
        message: '',
        balance: 0,
    }

    try {
        var pointedCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        const startProd = new Date(pointedCode.time).getTime()
        var finalProdTimer = Number(new Date().getTime() - startProd) || null
        if (!valorTotalApontado || decodedOdfNumber !== odfNumber || decodedOperationNumber !== operationNumber || decodedMachineCode !== machineCode || !machineCode || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000' || !operationNumber || !partCode || partCode === '0' || partCode === '00' || partCode === '000' || partCode === '0000' || partCode === '00000' || !odfNumber || !employee || employee === '0' || employee === '00' || employee === '000' || employee === '0000' || employee === '00000' || employee === '000000') {
            return res.json({ message: '' })
        }
        else if (pointedCode.message !== 'Ini Prod') {
            return res.json({ message: pointedCode.message })
        } else if (!supervisor && valorTotalApontado === maxQuantityReleased) {
            if (badFeed! > 0) {
                return res.json({ message: 'Supervisor inválido' })
            } else {
                supervisor = '004067'
            }
        } else if (!maxQuantityReleased || goodFeed! > maxQuantityReleased || valorTotalApontado > maxQuantityReleased || badFeed! > maxQuantityReleased || missingFeed! > maxQuantityReleased || reworkFeed! > maxQuantityReleased) {
            response.balance = maxQuantityReleased;
            return res.json({ message: 'Quantidade apontada excede o limite' })
        } else if (!missingFeed) {
            missingFeed = maxQuantityReleased - valorTotalApontado
        } else if (badFeed! > 0) {
            // Se houver refugo, verifica se o supervisor esta correto
            if (!motives) {
                return res.json({ message: '' })
            }
            const findSupervisor = await select(lookForSupervisor)
            if (!findSupervisor) {
                return res.json({ message: 'Supervisor não encontrado' })
            }
        }
        // else if (missingFeed > 0) {
        //     faltante = missingFeed
        // }
    } catch (error) {
        console.log('linha 100 - Error on Point.ts -', error);
        return res.json({ message: '' })
    }

    console.log('motives', motives);
    // Verificar os usuarios
    if (employee !== valuesFromHisaponta[0].USUARIO) {
        const arrayDeCodAponta = [4, 5, 6];
        const descriptionArrat = ['Fin Prod.', 'Rip Ini.', 'Rip Fin.']
        const goodEnd = null;
        const badEnd = null;
        const missingEnd = null;
        const reworkEnd = null;
        // Insere os codigos faltantes no processo com o usuario antigo e inicia um novo processo
        try {
            const resultEndingProcess = await insertInto(valuesFromHisaponta[0].USUARIO, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodEnd, badEnd, arrayDeCodAponta, descriptionArrat, motives, missingEnd, reworkEnd, finalProdTimer)
            if (resultEndingProcess === 'Success') {
                // Insere o codigo do novo usuario
                const codeArray = [1, 2, 3]
                const descriptionArray = ['Ini Setup.', 'Fin Setup.', 'Ini Prod.']
                const resultNewProcess = await insertInto(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodEnd, badEnd, codeArray, descriptionArray, motives, missingEnd, reworkEnd, finalProdTimer)
                if (resultNewProcess !== 'Success') {
                    return res.json({ message: '' })
                }
            } else {
                return res.json({ message: '' })
            }
        } catch (error) {
            console.log('Error on point.ts --inserting diferent users --', error);
        }
    }

    // Caso haja 'P' faz update na quantidade de peças dos filhos
    if (condic === 'P') {
        try {
            if (!childCode) {
                return res.json({ message: '' })
            }
            // Loop para atualizar o estoque
            const connection = await mssql.connect(sqlConfig);
            if (valorTotalApontado < maxQuantityReleased!) {
                try {
                    childCode.forEach((codigoFilho: string) => {
                        const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`
                        updateSaldoReal.push(stringUpdate)
                    });
                    await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected)
                } catch (error) {
                    console.log('linha 140  - Point.ts - ', error);
                    return res.json({ message: '' })
                }
            }
            try {
                // Loop para desconstar o saldo alocado
                childCode.forEach((codigoFilho: string) => {
                    const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${codigoFilho}'`
                    deleteCstAlocacao.push(stringUpdate)
                });
                await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected)
            } catch (error) {
                console.log('linha 159  - Point.ts - ', error);
                return res.json({ message: '' })
            } finally {
                await connection.close()
            }
        } catch (error) {
            console.log('linha 165  - Point.ts - ', error);
            return res.json({ message: '' })
        }
    }

    // Caso tenha retrabalhas apontados ou faltantes, faz insert em NOVA_ORDEM
    try {
        if (reworkFeed! > 0 || missingFeed! > 0) {
            const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE) VALUES('${odfNumber}', '${operationNumber}', '${machineCode}', ${resultSelectPcpProg[0].QTDE_ODF}, ${released},${valorTotalApontado}, ${badFeed}, ${goodFeed},  ${reworkFeed}, ${missingFeed}, '${partCode}', '${resultSelectPcpProg[0].CODIGO_CLIENTE}')`
            await createNewOrder(odfNumber, operationNumber, machineCode, reworkFeed, missingFeed, goodFeed, badFeed, valorTotalApontado, resultSelectPcpProg[0].QTDE_ODF, resultSelectPcpProg[0].CODIGO_CLIENTE, partCode)
            await insertIntoNewOrder(newOrderString)
        }
    } catch (error) {
        console.log('Error on Point.ts -', error);
        return res.json({ message: '' })
    }
    try {
        // Update quantidade apontada, quantidade de refugo, quantidade liberada, quantidade faltante, quantidade de boas, quantidades de retrabalhadas.
        // Insere codigo de apontamento 4 final de producao
        await update(updateCol)
        await insertInto(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed!, badFeed!, pointCode, pointCodeDescriptionFinProd, motives, missingFeed, reworkFeed!, finalProdTimer)
        return res.json({ message: 'Success' })
    } catch (error) {
        console.log('linha 194 - error - /point.ts/', error);
        return res.json({ message: '' })
    }
}