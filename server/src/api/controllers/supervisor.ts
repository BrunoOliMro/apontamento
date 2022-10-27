import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const supervisor:RequestHandler = async (req, res) => {
    let supervisor: string = String(sanitize(req.body['supervisor']))
    const connection = await mssql.connect(sqlConfig);

    if (supervisor === '' || supervisor === undefined || supervisor === null) {
        return res.json({ message: 'supervisor não encontrado' })
    }
    try {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            return res.status(200).json({ message: 'supervisor encontrado' })
        } else {
            return res.json({ message: 'supervisor não encontrado' })
        }
    } catch (error) {
        return res.json({ message: 'supervisor não encontrado' })
    } finally {
        //await connection.close()
    }
}