import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const returnedValue: RequestHandler = async (req, res) => {
    console.log(req.body)
    const connection = await mssql.connect(sqlConfig);
    let choosenOption = Number(sanitize(req.body["quantity"])) || 0
    let supervisor = String(sanitize(req.body["supervisor"])) || null
    let someC = String(sanitize(req.body['returnValueStorage'])) || null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO'])) || null
    let barcode = String(sanitize(req.body["codigoBarrasReturn"])) || null
    let boas;
    let ruins;
    let codigoPeca: string
    let revisao: number
    let qtdLibMax: number
    let faltante: number
    let retrabalhada: number
    let obj: any = {}
    let qtdApontOdf: number;
    let qtdOdf: number;
    //barcode = sanitize(barcode)
    // console.log("supervisor: ", supervisor);
    // console.log("choosenOption: ", choosenOption);
    // console.log("barcode: ", barcode);´
    if (barcode === null && choosenOption === 0 && supervisor === "undefined") {
        return res.json({ message: "odf não encontrada" })
    }

    if (barcode === undefined || barcode === null || barcode === 'undefined' || barcode === '') {
        return res.json({ message: "codigo de barras vazio" })
    }

    if (supervisor === "undefined" || supervisor === undefined || supervisor === null || supervisor === '') {
        return res.json({ message: "supervisor esta vazio" })
    }

    if (choosenOption === undefined || choosenOption === null || choosenOption === 0) {
        return res.json({ message: "quantidade esta vazio" })
    }
    if (someC === 'BOAS') {
        boas = choosenOption
    }

    if (someC === 'RUINS') {
        ruins = choosenOption
    }

    if (boas === undefined) {
        boas = 0
    }

    if (ruins === undefined) {
        ruins = 0
    }

    //Divide o Codigo de barras em 3 partes para a verificação na proxima etapa
    const dados = {
        numOdf: String(barcode!.slice(10)),
        numOper: String(barcode!.slice(0, 5)),
        codMaq: String(barcode!.slice(5, 10)),
    }
    //Reatribuiu o codigo caso o cado de barras seja maior
    if (barcode!.length > 17) {
        dados.numOdf = barcode!.slice(11)
        dados.numOper = barcode!.slice(0, 5)
        dados.codMaq = barcode!.slice(5, 11)
    }

    const resourceOdfData = await connection.query(`
    SELECT TOP 1
            [NUMERO_ODF],
            [NUMERO_OPERACAO],
            [CODIGO_MAQUINA],
            [CODIGO_CLIENTE],
            [QTDE_ODF],
            [CODIGO_PECA],
            [DT_INICIO_OP],
            [DT_FIM_OP],
            [QTDE_ODF],
            [QTDE_APONTADA],
            [DT_ENTREGA_ODF],
            [QTD_REFUGO],
            [HORA_INICIO],
            [HORA_FIM],
            [REVISAO]
            FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO
            WHERE 1 = 1
            AND [NUMERO_ODF] = ${dados.numOdf}
            AND [CODIGO_MAQUINA] = '${dados.codMaq}'
            AND [NUMERO_OPERACAO] = ${dados.numOper}
            ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
    if (resourceOdfData.length > 0) {
        codigoPeca = String(resourceOdfData[0].CODIGO_PECA)
        revisao = Number(resourceOdfData[0].REVISAO) || 0
        qtdOdf = Number(resourceOdfData[0].QTDE_ODF[0]) || 0
        qtdApontOdf = Number(resourceOdfData[0].QTDE_APONTADA) || 0
        faltante = Number(0)
        retrabalhada = Number(0)

        // console.log("qtdOdf, qtdOdf", resourceOdfData[0]);
        // console.log("qtdApontOdf, qtdApontOdf", qtdApontOdf);
        qtdLibMax = qtdOdf - qtdApontOdf

        if (resourceOdfData[0].QTDE_APONTADA <= 0) {
            qtdLibMax = 0
        }

        if (qtdLibMax <= 0) {
            return res.json({ message: "não ha valor que possa ser devolvido" })
        }

        if (boas > qtdLibMax) {
            console.log("obj linha 113 /returned/: ", obj);
            let objRes: any = {
                qtdLibMax: qtdLibMax,
                String: 'valor devolvido maior que o permitido'
            }
            return res.json(objRes)
        }

        const selectSuper = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`).then(result => result.recordset);
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await connection.query(`
                INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA) 
                VALUES (GETDATE(), '${funcionario}', '${dados.numOdf}', '${codigoPeca}', ${revisao}, ${dados.numOper}, ${dados.numOper}, 'D', '${dados.codMaq}', ${qtdLibMax} , '0', '0', '${funcionario}', '0', '7', '7', 'Valor Estorn.', '0', '0', '1', ${faltante},${retrabalhada})`)
                    .then(record => record.rowsAffected)

                // console.log("boas: ", boas);
                // console.log("ruins: ", ruins);
                // console.log('object', dados.numOdf);
                // console.log('object', dados.numOper);
                // console.log('object', dados.codMaq);
                const insertValuesBack = await connection.query(`
                UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - '${boas}', QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`)
                    .then(record => record.rowsAffected)


                // console.log("linha 114", insertHisCodReturned.length);
                // console.log("linha 114", insertValuesBack.length);
                if (insertHisCodReturned.length > 0 && insertValuesBack.length > 0) {
                    return res.status(200).json({ message: 'estorno feito' })
                } else if (insertHisCodReturned.length <= 0 || insertValuesBack.length <= 0) {

                    return res.json({ message: 'erro de estorno' })
                }
            } catch (error) {
                console.log(error)
            } finally {
                await connection.close()
            }
            return res.json({ message: 'erro de estorno' })
        }
    } else {
        return res.json({ message: 'erro de estorno' })
    }
}