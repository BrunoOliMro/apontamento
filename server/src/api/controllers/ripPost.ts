import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { cookieCleaner } from '../utils/clearCookie';
import { sqlConfig } from '../../global.config';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { sanitize } from '../utils/sanitize';
import { update } from '../services/update';
import { RequestHandler } from 'express';
import mssql from 'mssql';
import { selectQuery } from '../services/query';
// var stringUpdatePcp = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`

export const ripPost: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(47), data: message(47), code: message(33) })
    }

    var keySan: any
    var valueSan: any;
    var updateQtyQuery: string[] = [];
    var objectSanitized: { [key: string]: any; } = {}
    const pointCode = await verifyCodeNote(variables.cookies, [5])
    console.log('pointCode', pointCode);

    var oldTimer = new Date(pointCode.time).getTime()
    var timeSpendRip = Number(new Date().getTime() - oldTimer) || null
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [6]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = ['Rip Fin.']
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = timeSpendRip

    if (!pointCode.accepted) {
        return res.json({ status: message(1), message: message(33), data: message(33), code: pointCode.code })
    }

    const resultSelect=  await selectQuery(30, variables.cookies)

    if (Object.keys(variables.body).length <= 0) {
        console.log('insert into 6');
        const insertedRipCode = await insertInto(variables.cookies)
        if (insertedRipCode) {
            const pointCode = await verifyCodeNote(variables.cookies, [5])
            const updatePcpProgResult = await update(0, variables.cookies)
            if (updatePcpProgResult === message(1)) {
                await cookieCleaner(res)
                return res.json({ status: message(1), message: message(1), data: message(33), code: pointCode.code, qtdelib: resultSelect.data[0].QTDE_LIB })
            } else {
                return res.json({ status: message(1), message: message(33), data: message(33), code: pointCode.code, qtdelib: resultSelect.data[0].QTDE_LIB })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(0), code: pointCode.code, qtdelib: resultSelect.data[0].QTDE_LIB })
        }
    } else {
        for (const [key, value] of Object.entries(variables.body.values)) {
            keySan = sanitize(key as string)
            valueSan = sanitize(value as string)
            objectSanitized[keySan as string] = valueSan
        }
    }

    //Insere O CODAPONTA 6, Tempo da rip e atualizada o tempo em PCP
    try {
        console.log('insert into 6');
        const insertedRipCode = await insertInto(variables.cookies)
        console.log('insertedRipCode', insertedRipCode);
        if (!insertedRipCode) {
            return res.json({ status: message(1), message: message(33), data: message(33) })
        } else if (insertedRipCode) {
            try {
                const resultUpdatePcpProg = await update(0, variables.cookies)
                if (resultUpdatePcpProg !== message(1)) {
                    return res.json({ status: message(1), message: message(33), data: message(33), code: pointCode.code, qtdelib: resultSelect.data[0].QTDE_LIB })
                } else {
                    const resultSplitLines: { [k: string]: any; } = Object.keys(objectSanitized).reduce((acc: any, iterator: any) => {
                        const [col, lin] = iterator.split('-')
                        if (acc[lin] === undefined) acc[lin] = {}
                        acc[lin][col] = objectSanitized[iterator];
                        return acc
                    }, <{ [k: string]: any; }>{})

                    try {
                        Object.entries(resultSplitLines).forEach(([row], i) => {
                            if (resultSplitLines[row].SETUP === 'ok' && variables.cookies.lie.split(',')![i] === null && variables.cookies.lse.split(',')![i] === null) {
                                resultSplitLines[row] = 0
                            }
                            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, FUNCIONARIO, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                                VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.FUNCIONARIO}'  ,'1', '${variables.cookies.REVISAO}' , '${variables.cookies.numCar![i] || null}', '${variables.cookies.description.split(',')![i] || null}',  '${variables.cookies.specification![i] || null}',${variables.cookies.lie.split(',')![i] || null}, ${variables.cookies.lse.split(',')![i] || null},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${variables.cookies.instruments.split(',')![i] || null}','${variables.cookies.CODIGO_MAQUINA}','${variables.cookies.NUMERO_OPERACAO!.replaceAll(' ', message(33))}')`)
                        })
                        try {
                            const connection = await mssql.connect(sqlConfig);
                            await connection.query(updateQtyQuery.join('\n'))
                            console.log('cade o update');
                            await cookieCleaner(res)
                            return res.json({status: message(1), message: message(1), data: message(1), code: pointCode.code, qtdelib: resultSelect})
                        } catch (error) {
                            console.log('error - linha 103 /ripPost.ts/ - ', error)
                            return res.json({ status: message(1), message: message(0), data: message(33) })
                        }
                    } catch (error) {
                        console.log('linha 110 /ripPost/', error)
                        return res.json({ status: message(1), message: message(0), data: message(33) })
                    }
                }
            } catch (error) {
                console.log('error linha 115', error);
                return res.json({ status: message(1), message: message(0), data: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
    } catch (error) {
        console.log('linha 126 - ripPost -', error);
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }
}