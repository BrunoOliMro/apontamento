import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const badFeedMotives: RequestHandler = async (_req, res) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO)
        //console.log('resourc: linha 1145 ', resource);
        if (resource.length > 0) {
            return res.status(200).json(resoc)
        } else {
            return res.json({ message: 'erro em motivos do refugo' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'erro em motivos de refugo' })
    } finally {
        //await connection.close()
    }
}