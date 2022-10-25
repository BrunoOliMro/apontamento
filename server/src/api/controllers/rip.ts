import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const rip: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numpec = String(sanitize(req.cookies["CODIGO_PECA"])) || null
    let revisao = String(sanitize(req.cookies['REVISAO'])) || null
    let codMaq = String(sanitize(req.cookies['CODIGO_MAQUINA'])) || null
    try {
        const resource = await connection.query(`
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

        let arrayNumope = resource.map((acc) => {
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
        return res.json(numopeFilter)
    } catch (error) {
        console.log(error)
        return res.redirect("/#/codigobarras/apontamento?error=ripnotFound")
    } finally {
        //await connection.close()
    }
}