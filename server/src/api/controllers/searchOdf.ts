import { RequestHandler } from 'express';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
//import { selectedItensFromOdf } from '../utils/queryGroup';
import { update } from '../services/update';
import { cookieGenerator } from '../utils/cookieGenerator';
import { sanitize } from '../utils/sanitize';
import { cookieCleaner } from '../utils/clearCookie';
import { codeNote } from '../utils/codeNote';
import { encoded } from '../utils/encodedOdf';

export const searchOdf: RequestHandler = async (req, res) => {
    const barcode: any = unravelBarcode(req.body.barcode) || null
    let employee;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    // console.log('dados', dados);
    if (!barcode.numOdf || !barcode.numOper || !barcode.codMaq) {
        return res.json({ message: 'ODF não encontrada' })
    }

    // Descriptografa o funcionario dos cookies
    if (req.cookies['FUNCIONARIO']) {
        employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    } else {
        return res.json({ message: 'Algo deu errado' })
    }

    // Barcode inválido
    if (barcode.message === 'Código de barras inválido' || !barcode) {
        return res.json({ message: 'Código de barras inválido' })
    } else if (barcode.message === 'Código de barras está vazio') {
        return res.json({ message: 'Código de barras está vazio' })
    } else if (!employee) {
        return res.json({ message: 'Funcionário inválido' })
    }

    // Seleciona todos os itens da Odf
    const odf = await select(lookForOdfData)
    if (odf.length <= 0) {
        return res.json({ message: 'Algo deu errado' })
    }
    // console.log('odf', odf);
    // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
    let i: number = await odfIndex(odf, barcode.numOper)

    if (i <= 0) {
        !odf[i].QTDE_APONTADA ? odf[i].QTDE_LIB = odf[i].QTDE_ODF : odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        // if (!odf[i].QTDE_APONTADA) {
        //     odf[i].QTDE_LIB = odf[i].QTDE_ODF;
        // } else {
        //     odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        // }
    } else if (i > 0) {

        !odf[i].QTD_BOAS ? odf[i].QTD_BOAS = 0 : odf[i].QTD_BOAS
        // !odf[i].QTD_REFUGO ? odf[i].QTD_REFUGO = 0 : odf[i].QTD_REFUGO
        // !odf[i].QTD_FALTANTE ? odf[i].QTD_FALTANTE = 0 : odf[i].QTD_FALTANTE
        // !odf[i].QTD_RETRABALHADA ? odf[i].QTD_RETRABALHADA = 0 : odf[i].QTD_RETRABALHADA

        let valuesPointed = odf[i - 1].QTDE_APONTADA - odf[i].QTDE_APONTADA
        let diferenceBetweenGoodAndBad = odf[i - 1].QTD_BOAS - odf[i].QTD_BOAS

        if (diferenceBetweenGoodAndBad <= 0 || valuesPointed <= 0) {
            return res.json({ message: 'Não há limite na ODF' })
        }

        if (odf[i].QTDE_APONTADA >= odf[i - 1].QTD_BOAS) {
            return res.json({ message: 'Não há limite na ODF' })
        }

        if (odf[i].QTDE_APONTADA > odf[i].QTD_BOAS) {
            odf[i].QTDE_LIB = odf[i - 1].QTD_BOAS - odf[i].QTDE_APONTADA
        } else {
            odf[i].QTDE_LIB = diferenceBetweenGoodAndBad
        }
    } else {
        return res.json({ message: 'Não há limite na ODF' })
    }

    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ message: 'Não há limite na ODF' })
    }

    // Generate cookie that is gonna be used later;
    let lookForChildComponents = await selectToKnowIfHasP(barcode, odf[i].QTDE_LIB, employee, odf[i].NUMERO_OPERACAO, odf[i].CODIGO_PECA)

    if (lookForChildComponents.message === 'Valores Reservados') {
        if (lookForChildComponents.quantidade < odf[i].QTDE_LIB) {
            odf[i].QTDE_LIB = lookForChildComponents.quantidade
        }
        const queryUpdateQtdLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND NUMERO_OPERACAO = ${barcode.numOper}`
        await update(queryUpdateQtdLib)
    } else if (lookForChildComponents === 'Quantidade para reserva inválida') {
        await cookieCleaner(res)
        return res.json({ message: 'Não há limite na ODF' })
    } else if (lookForChildComponents === 'Não há item para reservar') {
        const queryUpdateQtdeLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND NUMERO_OPERACAO = ${barcode.numOper}`
        await update(queryUpdateQtdeLib)
    }

    // console.log('linha 47 /SearchOdf/', lookForChildComponents);

    odf[i].condic = lookForChildComponents.condic
    odf[i].execut = lookForChildComponents.execut
    odf[i].codigoFilho = lookForChildComponents.codigoFilho
    odf[i].startProd = new Date().getTime()
    await cookieGenerator(res, odf[i])
    res.cookie('encodedOdfNumber', encoded(String(odf[i].NUMERO_ODF)), { httpOnly: true })
    res.cookie('encodedOperationNuber', encoded(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true })
    res.cookie('encodedMachineCode', encoded(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true })
    const pointCode = await codeNote(barcode.numOdf, barcode.numOper, barcode.codMaq, employee)
    return res.json({ message: pointCode.message })
}
