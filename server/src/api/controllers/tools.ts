import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";
import { sanitize } from "../utils/sanitize";

//Ferramenta
export const tools: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let codigoPeca = String(sanitize(req.cookies["CODIGO_PECA"])) || null
    let numero_odf = String(sanitize(req.cookies["NUMERO_ODF"])) || null
    let numeroOperacao = String(sanitize(req.cookies["NUMERO_OPERACAO"])) || null
    let codigoMaq = String(sanitize(req.cookies["CODIGO_MAQUINA"])) || null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO'])) || null
    let revisao = Number(sanitize(req.cookies['REVISAO'])) || 0
    let ferramenta = String("_ferr")
    let start = Number(sanitize(req.cookies["starterBarcode"])) || 0
    let qtdLibMax = Number(sanitize(req.cookies['qtdLibMax'])) || 0
    let startTime = Number(new Date(start).getTime()) || 0

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

        // //Cria o primeiro registro em Hisaponta e insere o CODAPONTA 1 e o primeiro tempo em APT_TEMPO_OPERACAO
        const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', '0', '0' )`).then(record => record.recordsets)
        console.log("query linha 515: ", query);

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

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    const numero_odf = String(sanitize(req.cookies['NUMERO_ODF'])) || null
    const numeroOperacao = String(sanitize(req.cookies['NUMERO_OPERACAO'])) || null
    const codigoMaq = String(sanitize(req.cookies['CODIGO_MAQUINA'])) || null
    const codigoPeca = String(sanitize(req.cookies["CODIGO_PECA"])) || null
    const funcionario = String(sanitize(req.cookies['FUNCIONARIO'])) || null
    const revisao = Number(sanitize(req.cookies['REVISAO'])) || 0
    const qtdLibMax = Number(sanitize(req.cookies['qtdLibMax'])) || 0

    //Encerra o primeiro tempo de setup
    const end = Number(new Date().getTime()) || 0;
    const start = Number(req.cookies['starterBarcode']) || 0
    const startTime = Number(new Date(start).getTime()) || 0;
    const tempoDecorrido = Number(end - startTime) || 0

    //Inicia a produção
    const startProd = Number(new Date().getTime()) || 0;
    res.cookie("startProd", startProd)
    const connection = await mssql.connect(sqlConfig);
    try {

        // console.log('startProd linha: ', startProd);
        // console.log('tempoDecorrido linha: ', tempoDecorrido);
        // console.log('funcionario linha: ', funcionario);
        // console.log('numero_odf linha: ', numero_odf);
        // console.log('codigoPeca linha: ', codigoPeca);
        // console.log('revisao linha: ', revisao);
        // console.log('numeroOperacao linha: ', numeroOperacao);
        // console.log('codigoMaq linha: ', codigoMaq);

        //INSERE EM CODAPONTA 2
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.recordset)
        //console.log("query linha 572 : ", query);

        // //INSERE EM CODAPONTA 3
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.recordset)
        //console.log("InsertCodTwo linha 577 : ", InsertCodTwo);

        // if (!query) {
        //     return res.json({ message: "erro em ferselecionadas" })
        // } else {
        return res.status(200).json({ message: 'ferramentas selecionadas com successo' })
        // }
    } catch (error) {
        console.log(error)
        return res.redirect("/#/ferramenta")
    } finally {
        // await connection.close()
    }
}