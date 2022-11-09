import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF = Number(sanitize(req.cookies["NUMERO_ODF"]))
    try {
        const resource = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY OP ASC
        `.trim()).then(result => result.recordset)
        console.log("vakes", resource[0].BOAS);

        let boas = Number(resource[0].BOAS)
        let refugo = Number(resource[0].REFUGO)
        let faltante = Number(resource[0].PC_FALTANTE)
        

        if(boas + refugo + faltante === 0){
            return res.json({message : 'Não há histórico a exibir'})
        }

        console.log("linha 19 /historic/", resource);
        if (resource.length <= 0) {
            return res.json({ message: 'sem historico a exibir' });
        } else {
            let objRes = {
                resource: resource,
                message: 'historico encontrado'
            }
            return res.json(objRes)
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'erro ao localizar o historico' });
    } finally {
        //await connection.close()
    }
}