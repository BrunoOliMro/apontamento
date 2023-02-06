import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { cookieGenerator } from '../utils/cookieGenerator';
import { unravelBarcode } from '../utils/unravelBarcode'
import { cookieCleaner } from '../utils/clearCookie';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { odfIndex } from '../utils/odfIndex';
import { update } from '../services/update';
import { RequestHandler } from 'express';
// import { sequenciamentoView } from '../services/sequenciamento';

export const searchOdf: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    const barcode = unravelBarcode(variables.body.barcode) || null

    if (!barcode) {
        return res.json({ status: message(1), message: message(6), data: message(33) })
    }

    barcode!.data!.FUNCIONARIO! = variables.cookies.FUNCIONARIO

    // Alguma variavel não reconhecida
    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    // Odf nao encontrada
    if (!barcode!.data.NUMERO_ODF || !barcode!.data.NUMERO_OPERACAO || !barcode!.data.CODIGO_MAQUINA) {
        return res.json({ status: message(1), message: message(6), data: message(6) })
    } else if (!barcode?.message) {
        return res.json({ status: message(1), message: message(6), data: message(6) })
    } else if (!barcode.message) {
        return res.json({ status: message(1), message: message(8), data: message(8) })
    }

    // Seleciona todos os itens da Odf
    let odf = await selectQuery(0, barcode.data)
    // let odf = groupOdf

    if (!odf) {
        return res.json({ status: message(1), message: message(6), data: message(8) })
    }

    const i: number = await odfIndex(odf, barcode.data.NUMERO_OPERACAO)

    if (odf.length <= 0) {
        return res.json({ status: message(1), message: message(0), data: message(0) })
    } else if (!odf[i]) {
        // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
        return res.json({ status: message(1), message: message(6), data: message(6) })
    }

    if (i <= 0) {
        // ATENÇÃO olhar diferença entre quantidade apontada no processo anterior e no processo atual!!!!!!!!!!
        odf[i].QTDE_LIB = odf[i].QTDE_ODF - ((odf[i].QTD_BOAS || 0) + (odf[i].QTD_REFUGO || 0) + (odf[i].QTD_RETRABALHADA || 0) + (odf[i].QTD_FALTANTE || 0))
    } else if (i > 0) {
        // ATENÇÃO quantidade liberado é igual qtd_lib = boasProcessoPassado -  boas - ruins - retrabalhadas
        // Quantidade liberada é a diferença qtd_lib =  boasProcesso passado - boas - ruins - retrabalhadas
        odf[i].QTDE_LIB = (odf[i - 1].QTD_BOAS || 0) - (odf[i].QTD_BOAS || 0) - (odf[i].QTD_REFUGO || 0) - (odf[i].QTD_RETRABALHADA || 0) - (odf[i].QTD_FALTANTE || 0)
    }

    const resultVerifyCodeNote = await verifyCodeNote(barcode.data, [1, 3, 6, 9])

    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        await cookieGenerator(res, odf[i])
        return res.json({ status: message(1), message: message(11), data: message(11), code: resultVerifyCodeNote.code || message(33) })
    }

    // Verifica se a maquina correta a produzir na vez e caso nao seja para a máquina pelo connect
    // const verifySequenciamento: any = await sequenciamentoView(barcode!.data!)
    // if(!verifySequenciamento!.message){
    //     return res.json({status: message(1), message: 'Não é a máquina a operar', machine: verifySequenciamento.machine})
    // }

    // Generate cookie that is gonna be used later;
    barcode.data.QTDE_LIB = odf[i].QTDE_LIB
    barcode.data.CODIGO_PECA = odf[i].CODIGO_PECA
    const resultComponents = await selectToKnowIfHasP(barcode)
    console.log('resultComponents', resultComponents);
    if (resultComponents.message === message(13) || resultComponents.message === message(14) || resultComponents.message === message(15)) {
        barcode.data.QTDE_LIB = resultComponents.quantidade < odf[i].QTDE_LIB ? resultComponents.quantidade : odf[i].QTDE_LIB
        odf[i].condic = resultComponents.condic
        odf[i].execut = resultComponents.execut
        odf[i].childCode = resultComponents.childCode
        barcode.data.QTDE_LIB = resultComponents.quantidade
        await update(1, barcode.data)
    } else if (resultComponents === message(12)) {
        await cookieCleaner(res)
        return res.json({ status: message(1), message: message(11), data: message(11) })
    } else if (resultComponents === message(13)) {
        await update(1, barcode.data)
    }

    await cookieGenerator(res, odf[i])
    if (!barcode.data.QTDE_LIB) {
        return res.json({ status: message(1), message: message(11), data: message(33), code: resultVerifyCodeNote.code || message(33) })
    } else {
        return res.json({ status: message(1), message: message(1), data: message(50), code: resultVerifyCodeNote.code || message(33) })
    }
}

// res.cookie('encodedOdfNumber', encoded(String(odf[i].NUMERO_ODF)), { httpOnly: true })
// res.cookie('encodedOperationNuber', encoded(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true })
// res.cookie('encodedMachineCode', encoded(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true })