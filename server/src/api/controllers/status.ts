import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const status: RequestHandler = async (req, res) => {
    let numpec = req.cookies['CODIGO_PECA']
    let maquina = req.cookies['CODIGO_MAQUINA']
    let tempoAgora = new Date().getTime()
    let startTime = req.cookies['starterBarcode']
    let startTimeNow: number = Number(new Date(startTime).getTime());
    let tempoDecorrido: number = Number(tempoAgora - startTimeNow);
    const connection = await mssql.connect(sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT 
        TOP 1 
        EXECUT 
        FROM 
        OPERACAO 
        WHERE NUMPEC = '${numpec}' 
        AND MAQUIN = '${maquina}' 
        ORDER BY REVISAO DESC
        `).then(record => record.recordset)
        //res.cookie("Tempo Execucao", resource[0].EXECUT) 
        let qtdProd = req.cookies["qtdProduzir"][0]
        //valor em segundos
        let tempoExecut: number = Number(resource[0].EXECUT)
        //valor vezes a quantidade de peças
        let tempoTotalExecução: number = Number(tempoExecut * qtdProd) * 1000
        let tempoRestante = (tempoTotalExecução - tempoDecorrido)
        if (tempoRestante <= 0) {
            tempoRestante = 0
        }
        if (tempoRestante <= 0) {
            return res.json({ message: 'erro no tempo' })
        } else {
            console.log('linha 407: /status/ : ', tempoRestante);
            return res.status(200).json(tempoRestante)
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}