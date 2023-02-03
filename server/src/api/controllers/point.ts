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
// import { decodedBuffer } from '../utils/decodeOdf';
// var decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
// var decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
// var decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))

export const point: RequestHandler = async (req, res) => {
    var t0 = performance.now();
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
            console.log('provalmente aqui');
            return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        }
        const findSupervisor = await selectQuery(10, variables.body)
        if (findSupervisor.length <= 0) {
            return res.json({ status: message(1), message: message(17), data: message(33), code: resultVerifyCodeNote.code, address: message(33), returnValueAddress: message(33) })
        }
    }

    let t3 = performance.now();
    console.log("Call Variables in point.ts took: " + (t3 - t0) + " milliseconds.");


    var t4 = performance.now();

    const valuesFromHisaponta = await selectQuery(9, variables.cookies)
    // Verificar os usuarios
    if (variables.cookies.FUNCIONARIO !== valuesFromHisaponta![0].USUARIO) {
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

    var t5 = performance.now();
    console.log("Call t5 and t4 took: ", (t5 - t4));


    // A PRINCIPIO O MAIS LENTO É AQUI
    var t6 = performance.now();
    // Caso haja 'P' faz update na quantidade de peças dos filhos
    if (variables.cookies.condic === 'P') {
        // Insert loop to log every address in odf
        variables.cookies.totalValue = totalValue
        await getChildrenValuesBack(variables, req) || '';
    }
    var t9 = performance.now();
    console.log('t6 e t9', t9 - t6);
    // ATE AQUI  


    var t11 = performance.now()
    // Caso tenha retrabalhas apontados ou faltantes, faz insert em NOVA_ORDEM
    if (variables.body.reworkFeed! > 0 || variables.body.missingFeed! > 0) {
        const resultSelectPcpProg = await selectQuery(8, variables.cookies)
        await createNewOrder(variables.cookies.NUMERO_ODF, variables.cookies.NUMERO_OPERACAO, variables.cookies.CODIGO_MAQUINA, variables.body.reworkFeed, variables.body.missingFeed, variables.body.valorFeed, variables.body.badFeed, totalValue, resultSelectPcpProg![0].QTDE_ODF, resultSelectPcpProg![0].CODIGO_CLIENTE, variables.cookies.CODIGO_PECA)
        await insertIntoNewOrder(variables, 0)
    }
    var t12 = performance.now()
    console.log('t12 e t11', t12 - t11);

    var t15 = performance.now()
    var address: any;
    if ('00' + String(variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', '')) === '00999') {
        address = await getAddress(totalValue, variables, req)
    }

    var resFromChildren: any = ''
    if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)) {
        resFromChildren = await getAddress(variables.cookies.totalValue - Number(variables.cookies.QTDE_LIB), variables, req)
    }

    var t16 = performance.now()
    console.log('ADDREESS: ', t16 - t15);

    console.log('address', address);
    console.log('resFromChildren', resFromChildren);

    //  A SEGUNDA PARTE MAIS LENTA DA ROTA
    var t7 = performance.now()
    await update(3, variables.body)
    await insertInto(variables.cookies)
    var t8 = performance.now()
    console.log('T7 e T8 took: ', t8 - t7);
    // ATE AQUI

    var t1 = performance.now();
    console.log("Call Point.ts took: ", t1 - t0);
    return res.json({ status: message(1), message: message(1), data: message(33), code: message(49), address: !address ? message(33) : address, returnValueAddress: !resFromChildren.returnValueAddress ? message(33) : resFromChildren.returnValueAddress.address[0].ENDERECO })
}