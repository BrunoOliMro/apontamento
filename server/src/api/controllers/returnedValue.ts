import { RequestHandler } from 'express';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { update } from '../services/update';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { odfIndex } from '../utils/odfIndex';
//import { groupOdf[i]FromOdf } from '../utils/queryGroup';
import { sanitize } from '../utils/sanitize';
import { unravelBarcode } from '../utils/unravelBarcode';

export const returnedValue: RequestHandler = async (req, res) => {
    try {
        var motive = String(sanitize(req.body['motive'])) || null
        var quantityPointedBack = Number(sanitize(req.body['quantity'])) || null;
        var supervisor = sanitize(req.body['supervisor']) || null;
        var optionChoosed = String(sanitize(req.body['valueStorage'])) || null;
        if (!optionChoosed) {
            return res.json({ message: 'Não foi indicado boas e ruins' })
        }
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null;
        var data = unravelBarcode(sanitize(req.body['barcodeReturn'])) || null;
        var lookForOdfData = `SELECT NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${data.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
        var goodFeed = null;
        var badFeed = null;
        var pointCode = [8]
        var pointCodeDescription = null
        var timeSpend = null
    } catch (error) {
        console.log('Error on returning values --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    var response = {
        message: '',
    }
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
        return res.json({ message: 'Finalize o processo para estornar' })
    }

    let valorTotal = goodFeed + badFeed
    const groupOdf = await select(lookForOdfData)
    let i: number = await odfIndex(groupOdf, data.numOper)
    let x: number = groupOdf.findIndex((element: any) => element.QTDE_APONTADA === 0);

    if (x <= 0) {
        groupOdf[x - 1] = groupOdf[groupOdf.length - 1]
    }

    console.log('groupOdf[x - 1]', groupOdf[x - 1]);

    if (data.numOper === '00999') {
        data.numOper.replaceAll('00', '')
    } else if (groupOdf[x - 1].NUMERO_OPERACAO.replaceAll(' ', '') !== data.numOper.replaceAll('0', '') + '0') {
        return res.json({ message: 'ODF não pode ser estornada' })
    }

    // const groupOdf[i]: any = await groupOdf[i]FromOdf(groupOdf, indexOdf)
    if (groupOdf[i].QTDE_APONTADA < valorTotal || groupOdf[i].QTDE_APONTADA <= 0 || !groupOdf[i].QTD_REFUGO && badFeed > 0) {
        return res.json({ message: 'Sem limite para estorno' })
    } else if (!groupOdf[i] || '00' + groupOdf[i].NUMERO_OPERACAO.replaceAll(' ', '0') !== data.numOper) {
        response.message = 'Invalid ODF'
        return res.json(response)
    }
    else {
        var qtdLibMax;
        if (i <= 0) {
            qtdLibMax = groupOdf[i].QTDE_APONTADA - groupOdf[i].QTDE_ODF
        } else if (i > 0) {
            let diferenceBetweenGood = groupOdf[i - 1].QTD_BOAS - groupOdf[i].QTD_BOAS
            !groupOdf[i].QTD_BOAS ? groupOdf[i].QTD_BOAS = 0 : groupOdf[i].QTD_BOAS
            if (groupOdf[i].QTDE_APONTADA > groupOdf[i].QTD_BOAS) {
                qtdLibMax = groupOdf[i - 1].QTD_BOAS - groupOdf[i].QTDE_APONTADA
                groupOdf[i].QTDE_LIB = groupOdf[i - 1].QTD_BOAS - groupOdf[i].QTDE_APONTADA
            } else {
                qtdLibMax = diferenceBetweenGood
                groupOdf[i].QTDE_LIB = diferenceBetweenGood
            }
        } else {
            qtdLibMax = 0
        }



        let retrabalhada = null
        let valorApontado = groupOdf[i].QTDE_APONTADA - valorTotal
        let faltante = groupOdf[i].QTD_FALTANTE + valorTotal
        let qtdLib = groupOdf[i].QTDE_LIB + valorTotal

        console.log('faltante', faltante);
        console.log('qtdLibMax', qtdLibMax);
        console.log('motive', motive);
        console.log('goodFeed', goodFeed);
        console.log('badFeed', badFeed);
        console.log('valorTotal', valorTotal);
        console.log('qtdLib', qtdLib);

        const selectSuper: any = await select(lookForSupervisor)
        if (selectSuper.length > 0) {
            try {
                // const insertHisCodReturned = await insertInto(employee, data.numOdf, String(groupOdf[i].CODIGO_PECA), String(groupOdf[i].REVISAO), groupOdf[i].NUMERO_OPERACAO.replaceAll(' ', ''), data.codMaq, qtdLibMax || null, goodFeed, badFeed, pointCode, pointCodeDescription, motive, faltante, retrabalhada, timeSpend)
                const insertHisCodReturned = await insertInto(employee, data.numOdf, '5884', '1', '000', data.codMaq, qtdLibMax || null, goodFeed, badFeed, pointCode, pointCodeDescription, motive, faltante, retrabalhada, timeSpend)
                if (insertHisCodReturned) {
                    const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = ${valorApontado}, QTD_BOAS = QTD_BOAS - ${goodFeed}, QTD_FALTANTE = ${faltante}, QTDE_LIB = ${qtdLib}, QTD_REFUGO = QTD_REFUGO - ${badFeed}, QTD_ESTORNADA = COALESCE(QTD_ESTORNADA, 0 ) + ${valorTotal} WHERE 1 = 1 AND NUMERO_ODF = '${data.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${data.numOper}' AND CODIGO_MAQUINA = '${data.codMaq}'`
                    const updateValuesOnPcp = await update(updateQuery)
                    if (updateValuesOnPcp === 'Success') {
                        return res.status(200).json({ message: 'Estornado' })
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