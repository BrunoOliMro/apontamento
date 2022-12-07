import { RequestHandler } from 'express';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
//import { encoded } from '../utils/encodedOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
import { selectedItensFromOdf } from '../utils/queryGroup';
import { update } from '../services/update';
import { cookieGenerator } from '../utils/cookieGenerator';
import { sanitize } from '../utils/sanitize';
import { cookieCleaner } from '../utils/clearCookie';
import { codeNote } from '../utils/codeNote';

export const searchOdf: RequestHandler = async (req, res) => {
    const dados: any = unravelBarcode(req.body.barcode)
    let qtdLibMax: number;
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA  FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`

    // Descriptografa o funcionario dos cookies
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' })
    }

    // Seleciona todos os itens da Odf
    const groupOdf = await select(lookForOdfData)

    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' })
    }

    let indexOdf: number = await odfIndex(groupOdf, dados.numOper)

    // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' })
    }

    const selectedItens: any = await selectedItensFromOdf(groupOdf, indexOdf)

    if (indexOdf === 0) {
        qtdLibMax = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA
    } else {
        qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA
    }

    if (qtdLibMax === 0) {
        return res.json({ message: 'Não há limite na ODF' })
    }
    selectedItens.odf.QTDE_LIB = qtdLibMax

    // Generate cookie that is gonna be used later;
    let lookForChildComponents = await selectToKnowIfHasP(dados, qtdLibMax, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA, selectedItens.odf.REVISAO)

    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        await cookieCleaner(res)
        return res.json({ message: 'Quantidade para reserva inválida' })
    }

    console.log('linha 60 /quantidade/', lookForChildComponents.quantidade);
    console.log('linha 60 /qtdLibMax/', qtdLibMax);


    if (lookForChildComponents.quantidade < qtdLibMax) {
        selectedItens.odf.QTDE_LIB = lookForChildComponents.quantidade
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(y)
    } else {
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${qtdLibMax} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(y)
    }

    selectedItens.odf.condic = lookForChildComponents.condic
    selectedItens.odf.execut = lookForChildComponents.execut
    selectedItens.odf.codigoFilho = lookForChildComponents.codigoFilho
    selectedItens.odf.startProd = new Date().getTime()
    await cookieGenerator(res, selectedItens.odf)

    const x = await codeNote(dados.numOdf, dados.numOper, dados.codMaq)
    return res.json({ message: x })

    // if (lookForChildComponents.message === 'Não há item para reservar') {
    //     return res.json({ message: 'Não há item para reservar' })
    // 
}
