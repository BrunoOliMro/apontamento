import { RequestHandler } from 'express';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
import { update } from '../services/update';
import { cookieGenerator } from '../utils/cookieGenerator';
import { sanitize } from '../utils/sanitize';
import { cookieCleaner } from '../utils/clearCookie';
import { codeNote } from '../utils/codeNote';
import { encoded } from '../utils/encodedOdf';

export const searchOdf: RequestHandler = async (req, res) => {
    const message = {
        barcodePointed: 'ODF apontada',
        barcodeNotFound: 'ODF não encontrada',
        barcodeInvalid: 'Código de barras inválido',
        barcodeEmpty: 'Código de barras está vazio',
        invalidEmployee: 'Funcionário inválido',
        generalError: 'Algo deu errado',
        noLimit: 'Não há limite na ODF',
        invalidQuantity: 'Quantidade para reserva inválida',
        noItensReserved: 'Não há item para reservar',
        valuesReserved: 'Valores Reservados',
        generateCookie: 'Gerar cookies',
    }
    const barcode = unravelBarcode(req.body.values) || null
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${barcode!.data.odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    if (!barcode!.data.odfNumber || !barcode!.data.opNumber || !barcode!.data.machineCod) {
        return res.json({ message: message.barcodeNotFound })
    }
    // Descriptografa o funcionario dos cookies
    if (req.cookies['FUNCIONARIO']) {
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        if (!employee) {
            return res.json({ message: message.invalidEmployee })
        }
    } else {
        return res.json({ message: message.generalError })
    }

    // Barcode inválido
    if (!barcode) {
        return res.json({ message: message.barcodeInvalid })
    } else if (!barcode.message) {
        return res.json({ message: message.barcodeEmpty })
    }

    // Seleciona todos os itens da Odf
    const odf = await select(lookForOdfData)
    const i: number = await odfIndex(odf, barcode.data.opNumber)
    if (odf.length <= 0) {
        return res.json({ message: message.generalError })
    } else if (!odf[i]) {
        // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
        return res.json({ message: message.barcodeNotFound })
    }

    if (i <= 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: message.barcodePointed })
        } else {
            !odf[i].QTDE_APONTADA ? odf[i].QTDE_LIB = odf[i].QTDE_ODF : odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        }
    } else if (i > 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: message.barcodePointed })
        } else {
            !odf[i].QTD_BOAS ? odf[i].QTD_BOAS = 0 : odf[i].QTD_BOAS
        }
        let valuesPointed = odf[i - 1].QTDE_APONTADA - odf[i].QTDE_APONTADA
        let diferenceBetweenGoodAndBad = odf[i - 1].QTD_BOAS - odf[i].QTD_BOAS

        if (diferenceBetweenGoodAndBad <= 0 || valuesPointed <= 0) {
            return res.json({ message: message.noLimit })
        }

        if (odf[i].QTDE_APONTADA >= odf[i - 1].QTD_BOAS) {
            return res.json({ message: message.noLimit })
        }

        if (odf[i].QTDE_APONTADA > odf[i].QTD_BOAS) {
            odf[i].QTDE_LIB = odf[i - 1].QTD_BOAS - odf[i].QTDE_APONTADA
        } else {
            odf[i].QTDE_LIB = diferenceBetweenGoodAndBad
        }
    } else {
        return res.json({ message: message.noLimit })
    }

    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ message: message.noLimit })
    }
    

    // Generate cookie that is gonna be used later;
    let resultComponents = await selectToKnowIfHasP(barcode, odf[i].QTDE_LIB, employee, odf[i].NUMERO_OPERACAO, odf[i].CODIGO_PECA)
    if (resultComponents.message === message.valuesReserved || resultComponents.message === message.generateCookie) {
        if (resultComponents.quantidade < odf[i].QTDE_LIB) {
            odf[i].QTDE_LIB = resultComponents.quantidade
        }
        odf[i].condic = resultComponents.condic
        odf[i].execut = resultComponents.execut
        odf[i].codigoFilho = resultComponents.codigoFilho
        const queryUpdateQtdLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.data.odfNumber} AND NUMERO_OPERACAO = ${barcode.data.opNumber}`
        await update(queryUpdateQtdLib)
    } else if (resultComponents === message.invalidQuantity) {
        await cookieCleaner(res)
        return res.json({ message: message.noLimit })
    } else if (resultComponents === message.noItensReserved) {
        const queryUpdateQtdeLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.data.odfNumber} AND NUMERO_OPERACAO = ${barcode.data.opNumber}`
        await update(queryUpdateQtdeLib)
    }

    await cookieGenerator(res, odf[i])
    res.cookie('encodedOdfNumber', encoded(String(odf[i].NUMERO_ODF)), { httpOnly: true })
    res.cookie('encodedOperationNuber', encoded(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true })
    res.cookie('encodedMachineCode', encoded(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true })
    const pointed = await codeNote(Number(barcode.data.odfNumber), Number(barcode.data.opNumber), barcode.data.machineCod, employee)
    console.log('SearchOdf -- linha 123 --', pointed);
    return res.json({ message: pointed.message })
}