import { RequestHandler } from "express"
import { sqlConfig } from "../../global.config"
import mssql from 'mssql';

export const returnMotives: RequestHandler = async (_req, res) => {
    const stringCallMotives = `SELECT DESCRICAO FROM MOTIVOS_DEVOLUCAO`
    const connection = await mssql.connect(sqlConfig)
    let data: any = await connection.query(`${stringCallMotives}`).then(record => record.recordsets)
    let response = data[0].map((element: any) => element.DESCRICAO)
    return res.json(response)
}