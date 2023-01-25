// const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = ${valorApontado}, QTD_BOAS = QTD_BOAS - ${goodFeed}, QTD_FALTANTE = ${faltante}, QTDE_LIB = ${qtdLib}, QTD_REFUGO = QTD_REFUGO - ${badFeed}, QTD_ESTORNADA = COALESCE(QTD_ESTORNADA, 0 ) + ${valorTotal} WHERE 1 = 1 AND NUMERO_ODF = '${data.data.odfNumber}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${Number(data?.data.opNumber)}' AND CODIGO_MAQUINA = '${data.data.machineCod}'`
import { getChildrenValuesBack } from '../services/valuesFromChildren';
import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { unravelBarcode } from '../utils/unravelBarcode';
import { sqlConfig } from '../../global.config';
import { selectQuery } from '../services/query';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { odfIndex } from '../utils/odfIndex';
import { update } from '../services/update';
import { RequestHandler } from 'express';
import mssql from 'mssql';



export const returnedValue: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.body.supervisor || !variables.body.quantity || !variables.body.barcodeReturn) {
        return res.json({ status: message(1), message: message(48), data: message(33) })
    }

    const body = unravelBarcode(variables.body.barcodeReturn) || null;

    if (!body.data) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    var goodFeed = 0;
    var badFeed = 0;
    var codeNoteResult;
    variables.cookies.goodFeed = variables.body.QTDE_LIB || null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [8]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = ['Estorno']
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = null

    if (!variables.body.valueStorage) {
        return res.json({ status: message(1), message: message(26), data: message(33) })
    }

    if (variables.body.valueStorage === 'BOAS') {
        variables.cookies.goodFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity)
    } else if (variables.body.valueStorage === 'RUINS') {
        variables.cookies.badFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity)
    }


    if (body.data) {
        codeNoteResult = await verifyCodeNote(body.data, [6, 8])
        if (!codeNoteResult.accepted) {
            return res.json({ status: message(1), message: message(25), data: message(33), code: codeNoteResult.code })
        }
    }

    const valorTotal = Number(goodFeed + badFeed)
    const groupOdf: any = await selectQuery(28, body.data)
    const i: number = await odfIndex(groupOdf.data, String(body!.data.NUMERO_OPERACAO))
    const lastIndex: number = groupOdf.data!.findIndex((element: any) => element.QTDE_APONTADA === 0) - 1;

    if (lastIndex !== i) {
        return res.json({ status: message(1), message: message(43), data: message(33), code: codeNoteResult.code })
    }

    let odf = groupOdf.data![i]

    if (i === groupOdf.data!.length - 1) {
        odf = groupOdf.data![groupOdf.data!.length - 1]
    }

    if (lastIndex === groupOdf.data!.length - 1) {
        odf = groupOdf.data![groupOdf.data!.length - 1]
    }

    if (goodFeed) {
        if (!odf.QTD_BOAS || odf.QTD_BOAS <= 0) {
            return res.json({ status: message(1), message: message(27), data: message(33), code: codeNoteResult.code })
        }
    } else if (badFeed) {
        if (!odf.QTD_REFUGO || odf.QTD_REFUGO <= 0) {
            return res.json({ status: message(1), message: message(27), data: message(33), code: codeNoteResult.code })
        }
    }

    if (odf.QTDE_APONTADA < valorTotal || odf.QTDE_APONTADA <= 0 || !odf.QTD_REFUGO && badFeed > 0) {
        return res.json({ status: message(1), message: message(27), data: message(33), code: codeNoteResult.code })
    } else if (!odf || '00' + odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== body?.data.NUMERO_OPERACAO) {
        return res.json({ status: message(1), message: message(29), data: message(33), code: codeNoteResult.code })
    } else {

        if (i <= 0) {
            // ATENÇÃO olhar diferença entre quantidade apontada no processo anterior e no processo atual!!!!!!!!!!
            odf.QTDE_LIB = odf.QTDE_ODF - odf.QTDE_APONTADA - odf.QTD_FALTANTE;
        } else if (i > 0) {
            // ATENÇÃO quantidade liberado é igual qtd_lib = boasProcessoPassado -  boas - ruins - retrabalhadas
            // Quantidade liberada é a diferença qtd_lib =  boasProcesso passado - boas - ruins - retrabalhadas
            odf.QTDE_LIB = (odf.QTD_BOAS || 0) - (odf.QTD_BOAS || 0) - (odf.QTD_REFUGO || 0) - (odf.QTD_RETRABALHADA || 0) - (odf.QTD_FALTANTE || 0)
        }


        const valorApontado = Number(odf.QTDE_APONTADA - valorTotal)
        // const qtdLib = Number(odf.QTDE_LIB + valorTotal)

        variables.cookies.reworkFeed = null
        variables.cookies.valorApontado = valorApontado
        variables.cookies.missingFeed = null
        variables.cookies.qtdLib = odf.QTDE_LIB

        const selectSuper = await selectQuery(10, variables.body)

        variables.cookies.QTDE_APONTADA = valorApontado
        variables.cookies.NUMERO_ODF = body.data.NUMERO_ODF
        variables.cookies.NUMERO_OPERACAO = body.data.NUMERO_OPERACAO.replaceAll(' ', '').replaceAll('000', '')
        variables.cookies.CODIGO_MAQUINA = body.data.CODIGO_MAQUINA
        variables.cookies.REVISAO = groupOdf.data![i].REVISAO
        variables.cookies.QTDE_LIB = groupOdf.data![i].QTDE_LIB
        variables.cookies.valorTotal = valorTotal
        variables.cookies.valorApontado = groupOdf.data![i].QTDE_APONTADA - valorApontado

        if (selectSuper.data!.length > 0) {

            const resultHasP: any = await selectQuery(22, body.data)
            const execut = resultHasP.data!.map((element: any) => element.EXECUT)
            const codigoFilho: string[] = resultHasP.data!.map((item: any) => item.NUMITE)
            const processItens = resultHasP.data!.map((item: any) => item.NUMSEQ).filter((element: string) => element === String(String(body.data['NUMERO_OPERACAO']!).replaceAll(' ', '')).replaceAll('000', ''))

            if (processItens.length > 0) {
                const updateStorageQuery: string[] = [];
                codigoFilho.forEach((element: string, i: number) => {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.body.quantity * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
                });
                const connection = await mssql.connect(sqlConfig);
                await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected)
            }


            const insertHisCodReturned = await insertInto(variables.cookies)
            if (insertHisCodReturned) {
                const updateValuesOnPcp = await update(2, variables.cookies)
                if (updateValuesOnPcp === message(1)) {
                    return res.status(200).json({ status: message(1), message: message(31), data: message(31), code: codeNoteResult.code })
                } else {
                    return res.json({ status: message(1), message: message(0), data: message(33), code: codeNoteResult.code })
                }
            } else {
                return res.json({ status: message(1), message: message(0), data: message(33), code: codeNoteResult.code })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33), code: codeNoteResult.code })
        }
    }
}