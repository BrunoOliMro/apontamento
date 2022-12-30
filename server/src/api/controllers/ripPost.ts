import { RequestHandler } from 'express';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config';
import { insertInto } from '../services/insert';
import { update } from '../services/update';
import { cookieCleaner } from '../utils/clearCookie';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const ripPost: RequestHandler = async (req, res) => {
    try {
        console.log('req.body', req.body);
        var setup = (req.body['values']) || null
        var keySan: any
        var valueSan: any;
        var odfNumber = Number(decrypted(sanitize(req.cookies['NUMERO_ODF']))) || null
        var operationNumber = String(decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        var machineCode = String(decrypted(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var partCode = String(decrypted(sanitize(req.cookies['CODIGO_PECA']))) || null
        var employee = String(decrypted(sanitize(req.cookies['FUNCIONARIO']))) || null
        var revision = String(decrypted(sanitize(req.cookies['REVISAO']))) || null
        var maxQuantityReleased = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || null
        // var tempoDecorridoRip = new Date().getTime() - Number(decrypted(sanitize(req.cookies['startRip']))) || null
        var updateQtyQuery: string[] = [];
        var specification: string[] = (req.cookies['especif']) || null
        var numCar: string[] = (req.cookies['numCar']) || null
        var lie: string[] = (req.cookies['lie']) || null
        var lse: string[] = (req.cookies['lse']) || null
        var instruments: string[] = (req.cookies['instrumento']) || null
        var description = [(req.cookies['descricao'])] || null
        var objectSanitized: { [k: string]: any; } = {}
        var goodFeed = null
        var badFeed = null
        var pointCode = [6]
        var pointCodeDescriptionRipEnded = ['Rip Fin.']
        var motives = null
        var missingFeed = null
        var reworkFeed = null
        var stringUpdatePcp = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`
    } catch (error) {
        console.log('Error on Rip Post ', error);
        return res.json({ message: '' })
    }

    try {
        const pointedCode = await codeNote(odfNumber, Number(operationNumber), machineCode, employee)
        var oldTimer = new Date(pointedCode.time).getTime()
        var tempoDecorridoRip = Number(new Date().getTime() - oldTimer) || null

        if (pointedCode.message !== 'Rip iniciated') {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        console.log('Error on Rip Post ', error);
        return res.json({ message: '' })
    }

    if (Object.keys(setup).length <= 0) {
        const insertedRipCode = await insertInto(employee, odfNumber, partCode, revision, operationNumber!.replaceAll(' ', ''), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionRipEnded, motives, missingFeed, reworkFeed, tempoDecorridoRip)
        if (insertedRipCode) {
            const updatePcpProgResult = await update(stringUpdatePcp)
            if (updatePcpProgResult === 'Success') {
                await cookieCleaner(res)
                return res.json({ message: 'Success' })
            } else {
                return res.json({ message: '' })
            }
        } else {
            return res.json({ message: '' })
        }
    } else {
        for (const [key, value] of Object.entries(setup)) {
            keySan = sanitize(key as string)
            valueSan = sanitize(value as string)
            objectSanitized[keySan as string] = valueSan
        }
    }

    //Insere O CODAPONTA 6, Tempo da rip e atualizada o tempo em PCP
    try {
        const insertedRipCode = await insertInto(employee, odfNumber, partCode, revision, operationNumber!.replaceAll(' ', ''), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionRipEnded, motives, missingFeed, reworkFeed, tempoDecorridoRip)
        if (!insertedRipCode) {
            return res.json({ message: '' })
        } else if (insertedRipCode) {
            try {
                const resultUpdatePcpProg = await update(stringUpdatePcp)
                if (resultUpdatePcpProg !== 'Success') {
                    return res.json({ message: '' })
                } else {
                    const resultSplitLines: { [k: string]: any; } = Object.keys(objectSanitized).reduce((acc: any, iterator: any) => {
                        const [col, lin] = iterator.split('-')
                        if (acc[lin] === undefined) acc[lin] = {}
                        acc[lin][col] = objectSanitized[iterator];
                        return acc
                    }, <{ [k: string]: any; }>{})

                    try {
                        Object.entries(resultSplitLines).forEach(([row], i) => {
                            if (resultSplitLines[row].SETUP === 'ok' && lie![i] === null && lse![i] === null) {
                                resultSplitLines[row] = 0
                            }
                            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, FUNCIONARIO, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                                VALUES('${odfNumber}', '${employee}'  ,'1', '${revision}' , '${numCar![i]}', '${description![i]}',  '${specification![i]}',${lie![i]}, ${lse![i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instruments![i]}','${machineCode}','${operationNumber!.replaceAll(' ', '')}')`)
                        })
                        try {
                            const connection = await mssql.connect(sqlConfig);
                            await connection.query(updateQtyQuery.join('\n'))
                        } catch (error) {
                            console.log('error - linha 103 /ripPost.ts/ - ', error)
                            return res.json({ message: '' })
                        }
                        await cookieCleaner(res)
                        return res.json({ message: 'Success' })
                    } catch (error) {
                        console.log('linha 110 /ripPost/', error)
                        return res.json({ message: '' })
                    }
                }
            } catch (error) {
                console.log('error linha 115', error);
                return res.json({ message: '' })
            }
        } else {
            return res.json({ message: '' })
        }
    } catch (error) {
        console.log('linha 126 - ripPost -', error);
        return res.json({ message: '' })
    }
}