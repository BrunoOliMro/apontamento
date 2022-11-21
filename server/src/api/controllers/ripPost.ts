import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { update } from "../services/update";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const ripPost: RequestHandler = async (req, res) => {
    let setup = (req.body['setup']) || null
    let keySan
    let valueSan;

    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF : number= decrypted(String((req.cookies['NUMERO_ODF']))) || null
    let NUMERO_OPERACAO : string= decrypted(String(req.cookies['NUMERO_OPERACAO'])) || null
    let CODIGO_MAQUINA : string= decrypted(String((req.cookies['CODIGO_MAQUINA']))) || null
    let codigoPeca : string= decrypted(String((req.cookies['CODIGO_PECA']))) || null
    let funcionario : string= decrypted(String((req.cookies['FUNCIONARIO']))) || null
    let revisao : string= decrypted(String((req.cookies['REVISAO']))) || null
    let qtdLibMax : number= decrypted(String((req.cookies['qtdLibMax']))) || null
    const updateQtyQuery: string[] = [];
    let especif: string[] = (req.cookies['especif']) || null
    let numCar: string[] = (req.cookies['numCar']) || null
    let lie: string[] = (req.cookies['lie']) || null
    let lse: string[] = (req.cookies['lse']) || null
    let instrumento: string[] = (req.cookies['instrumento']) || null
    let descricao: string[] = (req.cookies['descricao']) || null
    var objectSanitized: { [k: string]: any; } = {}

    //let start = Number(req.cookies["starterBarcode"]) || 0
    //let end = Number(new Date().getTime()) || 0;
    // let tempoDecorrido = Number(new Date(start).getTime()) || 0
    //let final = Number(tempoDecorrido - end) || 0 // Errp em type numeric

    // Encerra ao final da Rip
    const startRip = Number(req.cookies["startRip"]) || 0
    const endProdRip = Number(new Date().getDate()) || 0;
    const tempoDecorridoRip = Number(new Date(startRip).getDate()) || 0
    const finalProdRip = Number(tempoDecorridoRip - endProdRip) || 0

    //Insere os dados no banco
    if (Object.keys(setup).length <= 0) {
        return res.json({ message: "rip vazia" })
    }

    for (const [key, value] of Object.entries(setup)) {
        keySan = sanitize(key as string)
        valueSan = sanitize(value as string)
        objectSanitized[keySan as string] = valueSan
    }

    NUMERO_ODF = Number(NUMERO_ODF)
    qtdLibMax = Number(qtdLibMax)


    let boas = 0
    let ruins = 0
    let codAponta = 8
    let descricaoCodAponta = 'ODF Fin'
    let motivo = ''
    let faltante = 0
    let retrabalhada = 0

    //Insere O CODAPONTA 6 e Tempo da rip
    // await connection.query(`
    // INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
    // VALUES(GETDATE(), '${funcionario}', ${NUMERO_ODF}, '${codigoPeca}', ${revisao}, '${NUMERO_OPERACAO}', '${NUMERO_OPERACAO}', 'D', '${CODIGO_MAQUINA}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '6', '6', 'ODF ENC.', ${finalProdRip}, ${finalProdRip}, '1', '0', '0')`)
    await insertInto(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip)

    //Atualiza o tempo total que a operação levou
    try {
        // await connection.query(`
        //         UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
                const updatePcpProg = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`
                await update(updatePcpProg)
            } catch (error) {
        console.log(error)
        return res.json({ message: 'ocorreu um erro ao enviar os dados da rip' })
    }

    const resultSplitLines: { [k: string]: any; } = Object.keys(objectSanitized).reduce((acc: any, iterator: any) => {
        const [col, lin] = iterator.split("-")
        if (acc[lin] === undefined) acc[lin] = {}
        acc[lin][col] = objectSanitized[iterator];
        return acc
    }, <{ [k: string]: any; }>{})

    try {
        Object.entries(resultSplitLines).forEach(([row], i) => {
            if(resultSplitLines[row].SETUP === "ok" && lie![i] === null && lse![i] === null ){
                resultSplitLines[row] = 0
            }
            updateQtyQuery.push(`
            INSERT INTO
                CST_RIP_ODF_PRODUCAO 
                    (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar![i]}', '${descricao![i]}',  '${especif![i]}',${lie![i]}, ${lse![i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instrumento![i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`)
            })
        await connection.query(updateQtyQuery.join("\n"))
        return res.json({ message: "rip enviada, odf finalizada" })
    } catch (error) {
        console.log("linha 75 /ripPost/", error)
        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" })
    }
}