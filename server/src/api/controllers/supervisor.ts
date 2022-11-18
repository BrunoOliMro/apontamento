import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { select } from "../services/select";
import { sanitize } from "../utils/sanitize";

export const supervisor: RequestHandler = async (req, res) => {
    let supervisor: string = String(sanitize(req.body['supervisor']))
    const connection = await mssql.connect(sqlConfig);

    if (
        supervisor === ''||
        supervisor === '0'||
        supervisor === '00'||
        supervisor === '000'||
        supervisor === '0000'||
        supervisor === '00000'||
        supervisor === '000000') {
        return res.json({ message: 'supervisor inválido' })
    }

    if (supervisor === '' || supervisor === undefined || supervisor === null) {
        return res.json({ message: 'supervisor não encontrado' })
    }

    try {
        // const resource = await connection.query(`
        // SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        
        let table = `VIEW_GRUPO_APT`
        let top = `TOP 1`
        let column = `CRACHA`
        let where = `AND CRACHA = '${supervisor}'`
        let orderBy = ``

        const resource = await select(table, top, column, where, orderBy)

        if (resource.length > 0) {
            return res.json({ message: 'Supervisor encontrado' })
        } else {
            return res.json({ message: 'Supervisor não encontrado' })
        }
    } catch (error) {
        return res.json({ message: 'Erro ao localizar supervisor' })
    } finally {
        //await connection.close()
    }
}