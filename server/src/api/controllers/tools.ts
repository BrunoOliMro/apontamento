import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";


export const tools: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let codigoPeca: string = String(req.cookies["CODIGO_PECA"])
    let numero_odf: string = String(req.cookies["NUMERO_ODF"])
    let numeroOperacao: string = String(req.cookies["NUMERO_OPERACAO"])
    let codigoMaq: string = String(req.cookies["CODIGO_MAQUINA"])
    let funcionario: string = String(req.cookies['FUNCIONARIO'])
    let revisao: number = Number(req.cookies['REVISAO'])
    let ferramenta: string = String("_ferr")
    let start: string = String(req.cookies["starterBarcode"])
    let qtdLibMax: number = Number(req.cookies['qtdLibMax'])
    let startTime: number = Number(new Date(start).getTime());

    try {
        const resource = await connection.query(`
            SELECT
                [CODIGO],
                [IMAGEM]
            FROM VIEW_APTO_FERRAMENTAL 
            WHERE 1 = 1 
                AND IMAGEM IS NOT NULL
                AND CODIGO = '${codigoPeca}'
        `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }

        // if(codigoMaq === 'RET001'){
        //     codigoMaq = 'RET01'
        // }
        // //console.log('codigoMaq:',codigoMaq);
        // console.log("revisao", revisao);
        // console.log("numero_odf", numero_odf);
        // console.log("funcionario", funcionario);
        // console.log("codigoPeca", codigoPeca);
        // console.log("numeroOperacao", numeroOperacao);
        // console.log("qtdLibMax", qtdLibMax);
        // console.log("startTime", startTime);
        // console.log("codigoMaq", codigoMaq);

        // //Cria o primeiro registro em Hisaponta e insere o CODAPONTA 1 e o primeiro tempo em APT_TEMPO_OPERACAO
        const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', '0', '0' )`).then(record => record.recordsets)
        console.log("query linha 515: ", query);

        // console.log('queryInser0t linha 509 ', queryInsertCod);
        // console.log('queryInsert linha 510 ', queryInsertCod.length);
        if (query === undefined) {
            return res.json({ message: "Erro nas ferramentas." });
        } else {
            return res.status(200).json(result);
        }
        // }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    } finally {
        // await connection.close()
    }
}