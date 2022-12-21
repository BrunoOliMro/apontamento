import { RequestHandler } from 'express';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { update } from '../services/update';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { odfIndex } from '../utils/odfIndex';
//import { selectedItensFromOdf } from '../utils/queryGroup';
import { sanitize } from '../utils/sanitize';
import { unravelBarcode } from '../utils/unravelBarcode';

export const returnedValue: RequestHandler = async (req, res) => {
    try {
        var quantityPointedBack = Number(sanitize(req.body['quantity'])) || null;
        var supervisor = sanitize(req.body['supervisor']) || null;
        var optionChoosed = String(sanitize(req.body['returnValueStorage'])) || null;
        if (!optionChoosed) {
            return res.json({ message: 'Não foi indicado boas e ruins' })
        }
        var employee = decrypted(String(sanitize(req.cookies['CRACHA']))) || null;
        var data = unravelBarcode(sanitize(req.body['barcodeReturn'])) || null;
        var lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${data.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
        var goodFeed = null;
        var badFeed = null;
        var pointCode = [8]
        var pointCodeDescription = null
        var motives = null
        var timeSpend = null
    } catch (error) {
        console.log('Error on returning values --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    var response = {
        message: '',
    }
    // if (!funcionario) {
    //     return res.json({ message: 'Funcionário inválido' })
    // }

    // if (!data && !choosenOption && !supervisor) {
    //     return res.json({ message: 'ODF não encontrada' })
    // }

    // if (!data) {
    //     return res.json({ message: 'Código de barras vazio' })
    // }

    // if (!supervisor) {
    //     return res.json({ message: 'Crachá de supervisor inválido' })
    // }

    // if (!choosenOption) {
    //     return res.json({ message: 'Categoria de peças não foi apontado' })
    // }
    if (optionChoosed === 'BOAS') {
        goodFeed = quantityPointedBack
    }

    if (optionChoosed === 'RUINS') {
        badFeed = quantityPointedBack
    }

    if (!goodFeed) {
        goodFeed = 0
    }

    if (!badFeed) {
        badFeed = 0
    }

    const codeNoteResult = await codeNote(data.numOdf, data.numOper, data.codMaq, employee)
    if (codeNoteResult.message !== 'Begin new process') {
        return res.json({ message: 'Not possible to return' })
    }

    let valorTotal = goodFeed + badFeed
    const groupOdf = await select(lookForOdfData)
    let indexOdf: number = await odfIndex(groupOdf, data.numOper)
    const selectedItens: any = groupOdf[indexOdf]
    // const selectedItens: any = await selectedItensFromOdf(groupOdf, indexOdf)
    if (selectedItens.odf.QTDE_APONTADA < valorTotal || selectedItens.odf.QTDE_APONTADA <= 0 || selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF === 0 || !selectedItens.odf.QTD_REFUGO && badFeed > 0) {
        return res.json({ message: 'No limit' })
    } else if (!selectedItens.odf || '00' + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== data.numOper) {
        response.message = 'Invalid ODF'
        return res.json(response)
    }
    else {
        let codigoPeca = String(selectedItens.odf.CODIGO_PECA)
        let revisao = String(selectedItens.odf.REVISAO)
        let qtdLib = selectedItens.odf.QTDE_LIB - valorTotal
        let faltante = selectedItens.odf.QTD_FALTANTE - valorTotal
        let retrabalhada = null
        let qtdLibMax = selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF

        const selectSuper: any = await select(lookForSupervisor)
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await insertInto(employee, data.numOdf, codigoPeca, revisao, data.numOper, data.codMaq, qtdLibMax, goodFeed, badFeed, pointCode, pointCodeDescription, motives, faltante, retrabalhada, timeSpend)
                if (insertHisCodReturned) {
                    const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - ${goodFeed}, QTD_FALTANTE = QTD_FALTANTE - ${faltante}, QTDE_LIB = ${qtdLib} ,QTD_REFUGO = QTD_REFUGO - ${badFeed} WHERE 1 = 1 AND NUMERO_ODF = '${data.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${data.numOper}' AND CODIGO_MAQUINA = '${data.codMaq}'`
                    const updateValuesOnPcp = await update(updateQuery)
                    if (updateValuesOnPcp === 'Success') {
                        return res.status(200).json({ message: 'Success' })
                    } else {
                        return res.json({ message: 'Error' })
                    }
                } else {
                    return res.json({ message: 'Error' })
                }
            } catch (error) {
                console.log(error)
                return res.json({ message: 'Error' })
            }
        } else {
            return res.json({ message: 'Error' })
        }
    }
}