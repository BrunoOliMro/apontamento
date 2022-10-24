import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const rip: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numpec: string = String(req.cookies["CODIGO_PECA"])
    let revisao: string = String(req.cookies['REVISAO'])
    let codMaq: string = String(req.cookies['CODIGO_MAQUINA'])
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

        let arrayNumope = resource.map((e) => {
            if (e.CST_NUMOPE === codMaq) {
                return e
            }
        })

        let numopeFilter = arrayNumope.filter(e => e)
        res.cookie('cstNumope', numopeFilter.map(e => e.CST_NUMOPE))
        res.cookie('numCar', numopeFilter.map(e => e.NUMCAR))
        res.cookie('descricao', numopeFilter.map(e => e.DESCRICAO))
        res.cookie('especif', numopeFilter.map(e => e.ESPECIF))
        res.cookie('instrumento', numopeFilter.map(e => e.INSTRUMENTO))
        res.cookie('lie', numopeFilter.map(e => e.LIE))
        res.cookie('lse', numopeFilter.map(e => e.LSE))
        return res.json(numopeFilter)
    } catch (error) {
        console.log(error)
        return res.status(400).redirect("/#/codigobarras/apontamento?error=ripnotFound")
    } finally {
        //await connection.close()
    }
}