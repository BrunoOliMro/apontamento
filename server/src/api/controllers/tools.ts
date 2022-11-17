import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { pictures } from "../pictures";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

//Ferramenta
export const tools: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let numeroOdf: string = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let numeroOperacao: string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let codigoMaq: string = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    let funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    let revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let start: string = decrypted(String(sanitize(req.cookies["starterBarcode"]))) || null
    let qtdLibMax: string = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    let startTime: number
    startTime = Number(start)
    let ferramenta: string = String("_ferr")

    try {
        const toolsImg = await connection.query(`
            SELECT
                [CODIGO],
                [IMAGEM]
            FROM VIEW_APTO_FERRAMENTAL 
            WHERE 1 = 1 
                AND IMAGEM IS NOT NULL
                AND CODIGO = '${codigoPeca}'
        `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of toolsImg.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }

        const verifyInsert = await connection.query(`SELECT * FROM HISAPONTA WHERE 1 = 1 AND ODF = '${numeroOdf}' AND NUMOPE = '${numeroOperacao}' AND ITEM = '${codigoMaq}' ORDER BY CODAPONTA DESC
        `).then(record => record.rowsAffected)

        //Cria o primeiro registro em Hisaponta e insere o CODAPONTA 1 e o primeiro tempo em APT_TEMPO_OPERACAO
        if (verifyInsert.length <= 0) {
            try {
                await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
                VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, 0, 0, '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', 0, 0 )`).then(record => record.rowsAffected)
            } catch (error) {
                console.log(error);
                return res.json({ message: "Erro ao inserir codapontamento 1" })
            }
        }

        if (toolsImg.length <= 0) {
            return res.json({ message: "/images/sem_imagem.gif" });
        }

        if (toolsImg.length > 0) {
            res.cookie('tools', 'true')
            return res.json(result)
        } else {
            return res.json({ message: 'Erro ao tentar acessar as fotos de ferramentas' })
        }

    } catch (error) {
        return res.json({ error: true, message: "Erro ao tentar acessar as fotos de ferramentas" });
    } finally {
        // await connection.close()
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    const numero_odf: string = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    const numeroOperacao: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const qtdLibMax: string = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    const start: string = decrypted(String(sanitize(req.cookies['starterBarcode']))) || null

    //Encerra o primeiro tempo de setup
    const end = Number(new Date().getTime()) || 0;
    let startTime: number
    startTime = Number(start)
    const tempoDecorrido = Number(end - startTime) || 0

    //Inicia a produção
    const startProd = Number(new Date().getTime()) || 0;
    res.cookie("startProd", startProd)
    const connection = await mssql.connect(sqlConfig);

    try {
        //INSERE EM CODAPONTA 2
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record)

        //INSERE EM CODAPONTA 3
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record)

        return res.json({ message: 'ferramentas selecionadas com successo' })
    } catch (error) {
        console.log('linha 104 /selected Tools/: ', error)
        return res.redirect("/#/ferramenta")
    } finally {
        // await connection.close()
    }
}