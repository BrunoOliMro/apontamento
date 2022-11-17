import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { decrypted } from "../utils/decryptedOdf";

export const rip: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numpec:string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let revisao:string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let codMaq:string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    let codigoPeca:string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let numeroOdf:string = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let numeroOperacao :string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let funcionario:string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    let start:string = decrypted(String(sanitize(req.cookies["starterBarcode"]))) || null
    let qtdLibMax:string = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    let startTime:number = Number(new Date(start).getTime()) || 0
    try {
        const ripDetails = await connection.query(`
        SELECT  DISTINCT
        PROCESSO.NUMPEC,
        PROCESSO.REVISAO,
        QA_CARACTERISTICA.NUMCAR AS NUMCAR,
        QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
        QA_CARACTERISTICA.DESCRICAO,
        ESPECIFICACAO  AS ESPECIF,
        LIE,
        LSE,
        QA_CARACTERISTICA.INSTRUMENTO
        FROM PROCESSO
        INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
        INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
        AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
        AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
        LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
        FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
        WHERE PROCESSO.NUMPEC = '${numpec}' 
        AND PROCESSO.REVISAO = '${revisao}' 
        AND NUMCAR < '2999'
        ORDER BY NUMPEC ASC
            `.trim()
        ).then(result => result.recordset)

        let arrayNumope = ripDetails.map((acc) => {
            if (acc.CST_NUMOPE === codMaq) {
                return acc
            }
        })

        let numopeFilter = arrayNumope.filter(acc => acc)
        res.cookie('cstNumope', numopeFilter.map(acc => acc.CST_NUMOPE))
        res.cookie('numCar', numopeFilter.map(acc => acc.NUMCAR))
        res.cookie('descricao', numopeFilter.map(acc => acc.DESCRICAO))
        res.cookie('especif', numopeFilter.map(acc => acc.ESPECIF))
        res.cookie('instrumento', numopeFilter.map(acc => acc.INSTRUMENTO))
        res.cookie('lie', numopeFilter.map(acc => acc.LIE))
        res.cookie('lse', numopeFilter.map(acc => acc.LSE))

        if (numopeFilter.length <= 0) {
            await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
            VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codMaq}', ${qtdLibMax}, 0, 0, '${funcionario}', '0', '6', '6', 'ODF Fin.', ${startTime}, ${startTime}, '1', 0, 0 )`).then(record => record.rowsAffected)
        }
        return res.json(numopeFilter)
    } catch (error) {
        console.log(error)
        return res.redirect("/#/codigobarras/apontamento?error=ripnotFound")
    } finally {
        //await connection.close()
    }
}