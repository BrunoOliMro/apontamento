import { getChildrenValuesBack } from '../services/valuesFromChildren';
import { insertIntoNewOrder } from '../services/insertNewOrder';
import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { getAddress } from '../services/getAddress';
import { createNewOrder } from '../utils/sendEmail';
import { selectQuery } from '../services/query';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { update } from '../services/update';
import { RequestHandler } from 'express';
import { sqlConfig } from '../../global.config'
import mssql from 'mssql';
// import { decodedBuffer } from '../utils/decodeOdf';
// var decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
// var decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
// var decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))

export const point: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.body) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3])

    if (!resultVerifyCodeNote.accepted) {
        return res.json({ status: message(1), message: message(5), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
    }

    const totalValue = (Number(variables.body.valorFeed) || 0) + (Number(variables.body.badFeed) || 0) + (Number(variables.body.reworkFeed) || 0) + (Number(variables.body.missingFeed) || 0);
    const released = Number(variables.cookies.QTDE_LIB)! - totalValue
    const resultSelectPcpProg = await selectQuery(8, variables.cookies)
    const valuesFromHisaponta = await selectQuery(9, variables.cookies)
    const startProd = new Date(resultVerifyCodeNote.time).getTime()
    const finalProdTimer = Number(new Date().getTime() - startProd) || null
    variables.body.valorApontado = totalValue
    variables.body.released = released
    variables.body.NUMERO_OPERACAO = variables.cookies.NUMERO_OPERACAO
    variables.body.CODIGO_MAQUINA = variables.cookies.CODIGO_MAQUINA
    variables.body.NUMERO_ODF = variables.cookies.NUMERO_ODF
    variables.cookies.QTDE_LIB = Number(variables.cookies.QTDE_LIB)
    variables.cookies.pointedCodeDescription = ['Fin Prod.']
    variables.cookies.tempoDecorrido = finalProdTimer
    variables.cookies.pointedCode = [4]
    variables.cookies.goodFeed = variables.body.valorFeed || 0;
    variables.cookies.badFeed = variables.body.badFeed || 0;
    variables.cookies.missingFeed = variables.body.missingFeed || 0;
    variables.cookies.reworkFeed = variables.body.reworkFeed || 0;

    if (!totalValue) {
        return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
    }
    else if (!variables.body.supervisor && totalValue === variables.cookies.QTDE_LIB) {

        if (variables.body.badFeed! > 0) {
            return res.json({ status: message(1), message: message(21), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        } else {
            variables.body.supervisor = '004067'
        }
    }
    else if (!Number(variables.cookies.QTDE_LIB) || Number(variables.body.valorFeed!) > Number(variables.cookies.QTDE_LIB) || totalValue > Number(variables.cookies.QTDE_LIB) || Number(variables.body.badFeed!) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.missingFeed!) > Number(variables.cookies.QTDE_LIB) || Number(variables.body.reworkFeed!) > Number(variables.cookies.QTDE_LIB)) {
        return res.json({ message: 'Quantidade apontada excede o limite' })
    }
    else if (variables.body.badFeed! > 0) {
        // Se houver refugo, verifica se o supervisor esta correto
        if (!variables.body.supervisor) {
            return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        }
        const findSupervisor = await selectQuery(10, variables.body)
        if (!findSupervisor.message) {
            return res.json({ status: message(1), message: message(17), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        }
    }

    // Verificar os usuarios
    if (variables.cookies.FUNCIONARIO !== valuesFromHisaponta.data![0].USUARIO) {
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
                return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        }
    }

    var resFromChildren: any;
    // Caso haja 'P' faz update na quantidade de peças dos filhos
    if (variables.cookies.condic === 'P') {
        variables.cookies.totalValue = totalValue
        resFromChildren = await getChildrenValuesBack(variables, req)
    }

    // Caso tenha retrabalhas apontados ou faltantes, faz insert em NOVA_ORDEM
    if (variables.body.reworkFeed! > 0 || variables.body.missingFeed! > 0) {
        const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE, USUARIO, REVISAO) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${resultSelectPcpProg.data![0].QTDE_ODF}, ${released},${totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${resultSelectPcpProg.data![0].CODIGO_CLIENTE}', '${variables.cookies.FUNCIONARIO}', '${variables.cookies.REVISAO}')`
        await createNewOrder(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg.data![0].QTDE_ODF, resultSelectPcpProg.data![0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA)
        await insertIntoNewOrder(newOrderString)
    }

    var address: any;
    if ('00' + String(variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', '')) === '00999') {
        address = getAddress(totalValue, variables, req)
    }

    console.log('resFromChildren.returnValueAddress.address[0].ENDERECO', resFromChildren);
    if (variables.cookies.condic === 'P') {
        // Insert loop to log every address in odf
        const insertEveryAddress: string[] = []
        // Insert to HISTORICO_ENDERECO
        console.log('historico linha 126');
        variables.cookies.childCode.split(',').forEach((element: string) => {
            insertEveryAddress.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${Number(variables.cookies.goodFeed)} ,'${variables.cookies.CODIGO_PECA}', '${element}', '${ !resFromChildren ? message(33) : resFromChildren.returnValueAddress.address[0].ENDERECO }', 'APONTADO', '${variables.cookies.NUMERO_OPERACAO}')`)
        });
        const connection = await mssql.connect(sqlConfig);
        await connection.query(insertEveryAddress.join('\n')).then(result => result.rowsAffected)
    }
    
    await update(3, variables.body)
    await insertInto(variables.cookies)
    return res.json({ status: message(1), message: message(1), data: message(33), code: resultVerifyCodeNote.code, address: !address ? message(33) : address, returnValueAddress: !resFromChildren ? message(33) : resFromChildren.returnValueAddress.address[0].ENDERECO })
}