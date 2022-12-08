import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { update } from "../services/update";
import { cookieCleaner } from "../utils/clearCookie";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const ripPost: RequestHandler = async (req, res) => {
    const setup: any = (req.body['setup'])
    let keySan: any
    let valueSan: any;
    const odfNumber: number = Number(decrypted(sanitize(req.cookies['NUMERO_ODF']))) || 0
    const operationNumber = decrypted(sanitize(req.cookies['NUMERO_OPERACAO'])) || null
    const codeMachine: string = decrypted(sanitize(req.cookies['CODIGO_MAQUINA'])) || null
    const codigoPeca: string = decrypted(sanitize(req.cookies['CODIGO_PECA'])) || null
    const funcionario: string = decrypted(sanitize(req.cookies['FUNCIONARIO'])) || null
    const revisao: string = String(decrypted(sanitize(req.cookies['REVISAO'])))
    const qtdLibMax: number = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || 0
    const updateQtyQuery: string[] = [];
    const especif: string[] = (req.cookies['especif']) || null
    const numCar: string[] = (req.cookies['numCar']) || null
    const lie: string[] = (req.cookies['lie']) || null
    const lse: string[] = (req.cookies['lse']) || null
    const instrumento: string[] = (req.cookies['instrumento']) || null
    const descricao: string[] = (req.cookies['descricao']) || null
    var objectSanitized: { [k: string]: any; } = {}
    const boas = 0
    const ruins = 0
    const codAponta = 6
    const descricaoCodAponta = 'Rip Fin'
    const motivo = null
    const faltante = 0
    const retrabalhada = 0

    //const start = Number(req.cookies["starterBarcode"]) || 0
    //const end = Number(new Date().getTime()) || 0;
    // const tempoDecorrido = Number(new Date(start).getTime()) || 0
    //const final = Number(tempoDecorrido - end) || 0 // Errp em type numeric
    // console.log("lirenbierbirebi", new Date().getTime() - req.cookies['startRip']);    // Encerra ao final da Rip
    const x = await codeNote(odfNumber, operationNumber, codeMachine)
    if (x !== 'Rip iniciated') {
        return res.json({ message: x })
    }

    const tempoDecorridoRip = new Date().getTime() - Number(decrypted(sanitize(req.cookies['startRip'])))
    //const finalProdRip = new Date().getTime() - decrypted(req.cookies['startSetupTime'])

    if (Object.keys(setup).length <= 0) {
        const x = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, codeMachine, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip)
        if (x) {
            return res.json({ message: "rip enviada, odf finalizada" })
        } else {
            return res.json({ message: 'Algo deu errado' })
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
        const x = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, codeMachine, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip)
        if (!x) {
            return res.json({ message: 'Algo deu errado' })
        } else if (x) {
            try {
                const updatePcpProg = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${codeMachine}'`
                const y = await update(updatePcpProg)
                if (y !== 'Update sucess') {
                    return res.json({ message: 'Algo deu errado' })
                } else {
                    const resultSplitLines: { [k: string]: any; } = Object.keys(objectSanitized).reduce((acc: any, iterator: any) => {
                        const [col, lin] = iterator.split("-")
                        if (acc[lin] === undefined) acc[lin] = {}
                        acc[lin][col] = objectSanitized[iterator];
                        return acc
                    }, <{ [k: string]: any; }>{})

                    try {
                        Object.entries(resultSplitLines).forEach(([row], i) => {
                            if (resultSplitLines[row].SETUP === "ok" && lie![i] === null && lse![i] === null) {
                                resultSplitLines[row] = 0
                            }
                            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, FUNCIONARIO, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                                VALUES('${odfNumber}', '${funcionario}'  ,'1', '${revisao}' , '${numCar![i]}', '${descricao![i]}',  '${especif![i]}',${lie![i]}, ${lse![i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instrumento![i]}','${codeMachine}','${operationNumber}')`)
                        })
                        try {
                            const connection = await mssql.connect(sqlConfig);
                            await connection.query(updateQtyQuery.join("\n"))
                        } catch (error) {
                            console.log("error - linha 98 /ripPost.ts/ - ", error)
                            return res.json({ message: "ocorreu um erro ao enviar os dados da rip" })
                        }
                        console.log('Apagando cookies');
                        await cookieCleaner(res)
                        return res.json({ message: 'rip enviada, odf finalizada', url: '/#/codigobarras' })
                    } catch (error) {
                        console.log("linha 75 /ripPost/", error)
                        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" })
                    }
                }
            } catch (error) {
                console.log('error linha 72', error);
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        console.log('linha 64 - ripPost -', error);
        return res.json({ message: 'Algo deu errado' })
    }
}