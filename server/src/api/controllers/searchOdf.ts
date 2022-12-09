import { RequestHandler } from 'express';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
import { selectedItensFromOdf } from '../utils/queryGroup';
import { update } from '../services/update';
import { cookieGenerator } from '../utils/cookieGenerator';
import { sanitize } from '../utils/sanitize';
import { cookieCleaner } from '../utils/clearCookie';
import { codeNote } from '../utils/codeNote';
import { encoded } from '../utils/encodedOdf';

export const searchOdf: RequestHandler = async (req, res) => {
    const dados: any = unravelBarcode(req.body.barcode) || null
    console.log('dados', dados);
    // Descriptografa o funcionario dos cookies
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`

    // Barcode inválido
    if (dados.message === 'Código de barras inválido') {
        return res.json({ message: 'Código de barras inválido' })
    } else if (dados.message === 'Código de barras está vazio') {
        return res.json({ message: 'Código de barras está vazio' })
    } else if (!funcionario) {
        return res.json({ message: 'Funcionario inválido' })
    }

    // Seleciona todos os itens da Odf
    const groupOdf = await select(lookForOdfData)
    //console.log('linha 33 /group/', groupOdf);
    if (!groupOdf || groupOdf.length <= 0) {
        return res.json({ message: 'ODF não encontrada' })
    }

    // Não pode pegar o 0 como erro pois, temos o index = 0 na ODF
    let indexOdf: number = await odfIndex(groupOdf, dados.numOper)
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' })
    }

    // Seleciona a ODF anterior e a ODF do processo presente
    const selectedItens: any = await selectedItensFromOdf(groupOdf, indexOdf)
    //console.log('linha 45', selectedItens.odf);
    if (selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA === 0) {
        return res.json({ message: 'Não há limite na ODF' })
    } else if (indexOdf === 0) {
        selectedItens.odf.QTDE_LIB = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTD_BOAS
    } else {
        if (selectedItens.beforeOdf.QTD_BOAS - selectedItens.odf.QTD_BOAS === 0) {
            return res.json({ message: 'Não há limite na ODF' })
        } else {
            selectedItens.odf.QTDE_LIB = selectedItens.beforeOdf.QTD_BOAS - selectedItens.odf.QTD_BOAS
        }
    }

    // Generate cookie that is gonna be used later;
    let lookForChildComponents = await selectToKnowIfHasP(dados, selectedItens.odf.QTDE_LIB, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA, selectedItens.odf.REVISAO)
    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        await cookieCleaner(res)
        return res.json({ message: 'Quantidade para reserva inválida' })
    }

    selectedItens.odf.QTDE_LIB = selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTD_BOAS

    if (!selectedItens.odf.QTDE_APONTADA && !selectedItens.odf.QTD_BOAS) {
        console.log('Caso as quantidade estejam vazias ou seja na primeira vez que passar');
        selectedItens.odf.QTDE_LIB = selectedItens.odf.QTDE_ODF
    }

    if (indexOdf === 0) {
        console.log('Se for a primeira odf ele mira na propria quantidade e a quantidade apontada dela mesmo');
        selectedItens.odf.QTDE_LIB = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA
    }

    if (lookForChildComponents.quantidade < selectedItens.odf.QTDE_LIB) {
        console.log('executando update com base na reserva...');

        selectedItens.odf.QTDE_LIB = lookForChildComponents.quantidade
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(y)
    } else {
        console.log('executando update...');
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${selectedItens.odf.QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
        await update(y)
    }

    selectedItens.odf.condic = lookForChildComponents.condic
    selectedItens.odf.execut = lookForChildComponents.execut
    selectedItens.odf.codigoFilho = lookForChildComponents.codigoFilho
    selectedItens.odf.startProd = new Date().getTime()
    await cookieGenerator(res, selectedItens.odf)
    res.cookie('encodedOdfNumber', encoded(String(selectedItens.odf.NUMERO_ODF)), { httpOnly: true })
    const pointCode = await codeNote(dados.numOdf, dados.numOper, dados.codMaq)
    return res.json({ message: pointCode })
}
