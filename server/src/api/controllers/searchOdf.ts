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
    const dados: any = unravelBarcode(req.body.barcode) || null
    // Descriptografa o funcionario dos cookies
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`

    // Barcode inválido
    if (dados.message === 'Código de barras inválido' || !dados) {
        return res.json({ message: 'Código de barras inválido' })
    } else if (dados.message === 'Código de barras está vazio') {
        return res.json({ message: 'Código de barras está vazio' })
    } else if (!funcionario) {
        return res.json({ message: 'Funcionário inválido' })
    }

    // Seleciona todos os itens da Odf
    const odf = await select(lookForOdfData)

    // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
    let i: number = await odfIndex(odf, dados.numOper)


    if (i <= 0) {
        if (!odf[i].QTDE_APONTADA) {
            odf[i].QTDE_LIB = odf[i].QTDE_ODF;
        } else {
            odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        }
    } else if (i > 0) {

        if (!odf[i].QTD_BOAS) {
            odf[i].QTD_BOAS = 0
        }

        if (!odf[i].QTD_REFUGO) {
            odf[i].QTD_REFUGO = 0
        }

        if (!odf[i].QTD_RETRABALHADA) {
            odf[i].QTD_RETRABALHADA = 0
        }

        if (!odf[i].QTD_FALTANTE) {
            odf[i].QTD_FALTANTE = 0
        }

        let x; 

        let allValue = odf[i].QTD_BOAS + odf[i].QTD_REFUGO + odf[i].QTD_FALTANTE + odf[i].QTD_RETRABALHADA

        if (allValue >= odf[i].QTDE_APONTADA) {
            console.log('quantidade excede');
            odf[i].QTDE_LIB = null
        }

        odf[i].QTDE_LIB = odf[i - 1].QTD_BOAS - odf[i].QTD_BOAS
        console.log('linha 73 ', odf[i].QTDE_LIB);

    } else {
        return odf[i].QTDE_LIB = null;
    }

    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ message: 'Não há limite na ODF' })
    }

    // console.log('linha 50 ', odf[i].QTDE_LIB);

    // Generate cookie that is gonna be used later;
    let lookForChildComponents = await selectToKnowIfHasP(dados, odf[i].QTDE_LIB, funcionario, odf[i].NUMERO_OPERACAO, odf[i].CODIGO_PECA, odf[i].REVISAO)

    if (lookForChildComponents.message === 'Valores Reservados') {
        if (lookForChildComponents.quantidade < odf[i].QTDE_LIB) {
            odf[i].QTDE_LIB = lookForChildComponents.quantidade

        }
        const queryUpdateQtdLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(queryUpdateQtdLib)
    } else if (lookForChildComponents === 'Quantidade para reserva inválida') {
        await cookieCleaner(res)
        return res.json({ message: 'Não há limite na ODF' })
    } else if (lookForChildComponents === 'Não há item para reservar') {
        const queryUpdateQtdeLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(queryUpdateQtdeLib)
    }

    console.log('linha 47 /SearchOdf/', lookForChildComponents);

    odf[i].condic = lookForChildComponents.condic
    odf[i].execut = lookForChildComponents.execut
    odf[i].codigoFilho = lookForChildComponents.codigoFilho
    odf[i].startProd = new Date().getTime()
    await cookieGenerator(res, odf[i])
    res.cookie('encodedOdfNumber', encoded(String(odf[i].NUMERO_ODF)), { httpOnly: true })
    res.cookie('encodedOperationNuber', encoded(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true })
    res.cookie('encodedMachineCode', encoded(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true })
    const pointCode = await codeNote(dados.numOdf, dados.numOper, dados.codMaq, funcionario)

    if (pointCode.funcionario !== '') {
        if (pointCode.funcionario !== funcionario) {
            return res.json({ message: 'Funcionario diferente' })
        }
    }

    return res.json({ message: pointCode.message })
}
