import { sqlConfig } from "../../global.config"
import { message } from "../services/message";
import { update } from "../services/update"
import mssql from 'mssql';
import { selectQuery } from "../services/query";


export const cstStorageUp = async (QTDE_LIB: any, address: any, CODIGO_PEÇA: any, NUMERO_ODF: any, goodFeed: any, FUNCIONARIO: any, hostname: any, ip: any) => {
    const response = {
        message: '',
        address: ''
    }
    try {
        const values = {
            address : address,
            partCode: CODIGO_PEÇA,
            quantityToProduce : QTDE_LIB,
        }
        // const updateStringCadEnderecos = `UPDATE CST_ESTOQUE_ENDERECOS SET QUANTIDADE = QUANTIDADE + ${quantityToProduce} WHERE 1 = 1 AND ENDERECO = '${address}'`
        const resUpdate = await update(4, values )
        if (resUpdate !== message(1)) {
            // const y = `INSERT INTO CST_ESTOQUE_ENDERECOS(ENDERECO, CODIGO ,QUANTIDADE) VALUES ('${address}','${CODIGO_PEÇA}' , ${QTDE_LIB})`
            // INSERT INTO!!!!!!!!!!!
            await update(6, values )
        }
        // const lookForHisReal = `SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${partCode}' ORDER BY DATA DESC`
        const resultQuery = await selectQuery(29, values)
        if (!resultQuery.data) {
            return message(0)
        }
        try {
            const connection = await mssql.connect(sqlConfig);
            await connection.query(`
        INSERT INTO HISREAL
            (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
        SELECT 
            CODIGO, '${NUMERO_ODF}/${CODIGO_PEÇA}', GETDATE(), ${goodFeed}, 0 , 'E', ${resultQuery.data[0].SALDO || 0} + ${goodFeed}, GETDATE(), '0', '${FUNCIONARIO}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
        FROM ESTOQUE(NOLOCK)
        WHERE 1 = 1 
        AND CODIGO = '${CODIGO_PEÇA}' 
        GROUP BY CODIGO`).then(result => result.rowsAffected)
        await connection.close()
        } catch (error) {
            console.log('linha 194', error);
            return response.message = 'erro inserir em hisreal'
        }
    } catch (error) {
        console.log('Error on updating ', error);
        return message(0)
    }
}