import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const stopMotives: RequestHandler = async (_req, res) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT CODIGO,DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO)
        if (!resource) {
            return res.json({ message: 'erro motivos de parada de maquina' })
        } else {
            return res.status(200).json(resoc)
        }
    } catch (error) {
        return res.json({ message: 'erro motivos de parada de maquina' })
    } finally {
        //await connection.close()
    }
}