import type { RequestHandler } from 'express';
import sanitize from 'sanitize-html';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
//import { encoded } from '../utils/encodedOdf';
import { encrypted } from '../utils/encryptOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
import { selectedItensFromOdf } from '../utils/queryGroup';
import { update } from '../services/update';
import { cookieGenerator } from '../utils/cookieGenerator';
//import { codeNoteMessage } from '../utils/codeNoteMessage';

export const searchOdf: RequestHandler = async (req, res) => {
    const dados: any = unravelBarcode(req.body.barcode)
    let qtdLibMax: number;
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA  FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    const lookForHisaponta = `SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${dados.numOdf} AND NUMOPE = ${dados.numOper} AND ITEM = '${dados.codMaq}' ORDER BY DATAHORA DESC`

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
        return res.json({ message: 'não há limite na odf' })
    }

    let lookForChildComponents = await selectToKnowIfHasP(dados, qtdLibMax, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA)
    if(lookForChildComponents.quantidade > qtdLibMax){
        selectedItens.odf.QTDE_LIB = qtdLibMax
    } else {
        selectedItens.odf.QTDE_LIB = lookForChildComponents.quantidade
    }

    // Generate cookie that is gonna be used later;
    await cookieGenerator(res, selectedItens.odf)
    await cookieGenerator(res, lookForChildComponents)
    //res.cookie('QTDE_LIB', encrypted(String(qtdLibMax)))
    
    const x = await select(lookForHisaponta)
    if (x.length > 0) {
        if (x[0]!.CODAPONTA === 1 || x[0]!.CODAPONTA === 2 || x[0]!.CODAPONTA === 3) {
            return res.json({ message: 'Proceed with process' })
        } else if (x[0]!.CODAPONTA === 4) {
            return res.json({ message: 'Pointed' })
        } else if (x[0]!.CODAPONTA === 5) {
            return res.json({ message: 'Rip iniciated' })
        } else if (x[0]!.CODAPONTA === 6) {
            return res.json({ message: 'Proceed with process' })
        } else if (x[0].CODAPONTA === 7) {
            return res.json({ message: 'Máquina Parada' })
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    }

    let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`
    await update(y)
}
