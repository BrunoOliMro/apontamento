import { insertIntoNewOrder } from '../services/insertNewOrder';
import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { createNewOrder } from '../utils/sendEmail';
import { sqlConfig } from '../../global.config';
import { selectQuery } from '../services/query';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { update } from '../services/update';
import { RequestHandler } from 'express';
import mssql from 'mssql';
// import { decodedBuffer } from '../utils/decodeOdf';
// var decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
// var decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
// var decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))

export const point: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3])

    console.log('resultVerifyCodeNote', resultVerifyCodeNote);
    console.log('Number(variables.body.valorFeed)', Number(variables.body.valorFeed) || 0);
    console.log('Number(variables.body.badFeed )', Number(variables.body.badFeed) || 0);
    console.log('Number(variables.body.missingFeed )', Number(variables.body.missingFeed) || 0);
    console.log('Number(variables.body.reworkFeed)', Number(variables.body.reworkFeed) || 0);

    const totalValue = (Number(variables.body.valorFeed) || 0) + (Number(variables.body.badFeed) || 0) + (Number(variables.body.reworkFeed) || 0) //+ (Number(variables.body.missingFeed) || 0) ;

    console.log('totalValue', totalValue);

    const diferenceBetween = Number(variables.cookies.execut!) * Number(variables.cookies.QTDE_LIB!) - Number(totalValue) * Number( variables.cookies.execut!)
    const released = Number(variables.cookies.QTDE_LIB)! - totalValue
    const deleteCstAlocacao: string[] = [];
    const updateSaldoReal: string[] = [];
    const resultSelectPcpProg = await selectQuery( 8, variables.cookies)
    const valuesFromHisaponta = await selectQuery( 9, variables.cookies)
    const startProd = new Date(resultVerifyCodeNote.time).getTime()
    const finalProdTimer = Number(new Date().getTime() - startProd) || null
    console.log('Number(variables.body.missingFeed) + Number(variables.cookies.QTDE_LIB!)', (Number(variables.body.missingFeed) || 0) + (Number(variables.cookies.QTDE_LIB!) || 0));
    console.log('a', Number(variables.body.missingFeed) + Number(variables.cookies.QTDE_LIB!) - totalValue);
    // variables.body.missingFeed = Number(variables.body.missingFeed) + Number(variables.cookies.QTDE_LIB!) - totalValue
    variables.body.missingFeed =  variables.cookies.QTDE_LIB - totalValue;

    console.log('missingFeed', variables.body.missingFeed);
    console.log('total value', totalValue);
    console.log('VALOR A ser apontado', variables.body.missingFeed - totalValue);


    variables.cookies.QTDE_LIB = Number(variables.cookies.QTDE_LIB)
    variables.cookies.pointedCodeDescription = ['Fin Prod.']
    variables.cookies.tempoDecorrido = finalProdTimer
    variables.cookies.pointedCode = [4]

    if (!resultVerifyCodeNote.accepted) {
        return res.json({ status: message(1), message: message(5), data: message(33), code: resultVerifyCodeNote.code })
    }

    if (!totalValue) {
        return res.json(message(0))
    } else if (!variables.body.supervisor && totalValue === variables.cookies.QTDE_LIB) {
        if (variables.body.badFeed! > 0) {
            return res.json({ status: message(1), message: message(21), data: message(33) })
        } else {
            variables.body.supervisor = '004067'
        }
    } else if (!Number(variables.cookies.QTDE_LIB) || Number(variables.body.valorFeed!) > Number(variables.cookies.QTDE_LIB) || totalValue > Number(variables.cookies.QTDE_LIB) || Number(variables.body.badFeed!) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.missingFeed!) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.reworkFeed!) > Number(variables.cookies.QTDE_LIB)) {
        return res.json({ message: 'Quantidade apontada excede o limite' })
    } else if (!variables.body.missingFeed) {
        variables.body.missingFeed = variables.cookies.QTDE_LIB - totalValue
    } else if (variables.body.badFeed! > 0) {
        // Se houver refugo, verifica se o supervisor esta correto
        if (!variables.body.value) {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
        const findSupervisor = await selectQuery( 10, variables.body)
        if (!findSupervisor.message) {
            return res.json({ status: message(1), message: message(17), data: message(33) })
        }
    }

    // Verificar os usuarios
    if (variables.cookies.FUNCIONARIO !== valuesFromHisaponta.data[0].USUARIO) {
        variables.cookies.arrayDeCodAponta = [4, 5, 6];
        variables.cookies.descriptionArrat = ['Fin Prod.', 'Rip Ini.', 'Rip Fin.']
        variables.cookies.goodEnd = null
        variables.cookies.badEnd = null
        variables.cookies.missingEnd = null
        variables.cookies.reworkEnd = null


        // Insere os codigos faltantes no processo com o usuario antigo e inicia um novo processo
        const resultEndingProcess = await insertInto(variables.cookies)
        if (resultEndingProcess === message(1)) {
            // Insere o codigo do novo usuario

            variables.cookies.descriptionArray = ['Ini Setup.', 'Fin Setup.', 'Ini Prod.']
            variables.cookies.codeArray = [1, 2, 3]

            const resultNewProcess = await insertInto(variables.cookies)
            if (resultNewProcess !== message(1)) {
                return res.json({ status: message(1), message: message(0), data: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
    }

    // Caso haja 'P' faz update na quantidade de peças dos filhos
    console.log('variables.cookies.condic', variables.cookies);
    if (variables.cookies.condic === 'P') {
        console.log('updating peças filhasss...');
        try {
            if (!variables.cookies.childCode) {
                return res.json({ status: message(1), message: message(0), data: message(33) })
            }
            variables.cookies.childCode = variables.cookies.childCode.split(',')
            console.log('childCode', variables.cookies.childCode );
            console.log('diferenceBetween', diferenceBetween);
            // Loop para atualizar o estoque
            const connection = await mssql.connect(sqlConfig);
            if (totalValue < Number(variables.cookies.QTDE_LIB)!) {
                try {
                    variables.cookies.childCode.forEach((codigoFilho: string) => {
                        console.log('codigoFilho', codigoFilho);
                        const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`
                        updateSaldoReal.push(stringUpdate)
                    });
                    await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected)
                    console.log('update estoque saldoreal ');
                } catch (error) {
                    console.log('linha 140  - Point.ts - ', error);
                    return res.json({ status: message(1), message: message(0), data: message(33) })
                }
            }
            try {
                // Loop para desconstar o saldo alocado
                variables.cookies.childCode.forEach((codigoFilho: string) => {
                    const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`
                    deleteCstAlocacao.push(stringUpdate)
                });
                console.log('delete cst alocacao', deleteCstAlocacao);
                await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected)
            } catch (error) {
                console.log('linha 159  - Point.ts - ', error);
                return res.json({ status: message(1), message: message(0), data: message(33) })
            } finally {
                await connection.close()
            }
        } catch (error) {
            console.log('linha 165  - Point.ts - ', error);
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
    }

    // Caso tenha retrabalhas apontados ou faltantes, faz insert em NOVA_ORDEM
    if (variables.body.reworkFeed! > 0 || variables.body.missingFeed! > 0) {
        console.log('insert into nova ordem');
        const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${resultSelectPcpProg.data[0].QTDE_ODF}, ${released},${totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${resultSelectPcpProg.data[0].CODIGO_CLIENTE}')`
        await createNewOrder(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg.data[0].QTDE_ODF, resultSelectPcpProg.data[0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA)
        await insertIntoNewOrder(newOrderString)
    }
    variables.body.valorApontado = totalValue
    variables.body.released = released
    variables.body.NUMERO_OPERACAO = variables.cookies.NUMERO_OPERACAO
    variables.body.CODIGO_MAQUINA = variables.cookies.CODIGO_MAQUINA
    variables.body.NUMERO_ODF = variables.cookies.NUMERO_ODF
    console.log("missingFeed: ", variables.body.missingFeed)
    console.log('updating 3');
    await update(3, variables.body)
    console.log('insert into 4');
    variables.cookies.goodFeed = variables.body.valorFeed || 0;
    variables.cookies.badFeed = variables.body.badFeed || 0;
    variables.cookies.missingFeed = variables.body.missingFeed || 0;
    variables.cookies.reworkFeed = variables.body.reworkFeed || 0;
    await insertInto(variables.cookies)
    return res.json({ status: message(1), message: message(1), data: message(33) })
}