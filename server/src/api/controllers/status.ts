import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const status: RequestHandler = async (req, res) => {
    let numpec = String(sanitize(req.cookies['CODIGO_PECA'])) || null
    let maquina = String(sanitize(req.cookies['CODIGO_MAQUINA'])) || null
    let tempoAgora = new Date().getTime() || 0
    let startTime = Number(sanitize(req.cookies['starterBarcode'])) || 0;
    let startTimeNow = Number(new Date(startTime).getTime())|| 0;
    let tempoDecorrido = Number(tempoAgora - startTimeNow) || 0;
    const connection = await mssql.connect(sqlConfig);

    console.log("maquina: ", maquina);
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
        let qtdProd = Number(req.cookies["qtdProduzir"][0]) || 0
        //valor em segundos
        let tempoExecut = Number(resource[0].EXECUT) || 0
        //valor vezes a quantidade de peças
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000 || 0
        let tempoRestante = (tempoTotalExecução - tempoDecorrido)
        if (tempoRestante <= 0) {
            tempoRestante = 0
        }
        if (tempoRestante <= 0) {
            return res.json({ message: 'erro no tempo' })
        } else {
            //console.log('linha 407: /status/ : ', tempoRestante);
            return res.status(200).json(tempoRestante)
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}