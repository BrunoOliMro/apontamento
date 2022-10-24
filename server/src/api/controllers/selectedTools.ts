import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const selectedTools: RequestHandler = async (req, res) => {
    let numero_odf: string = String(req.cookies['NUMERO_ODF'])
    let numeroOperacao: string = String(req.cookies['NUMERO_OPERACAO'])
    let codigoMaq: string = String(req.cookies['CODIGO_MAQUINA'])
    let codigoPeca: string = String(req.cookies["CODIGO_PECA"])
    let funcionario: string = String(req.cookies['FUNCIONARIO'])
    let revisao: number = Number(req.cookies['REVISAO'])
    let qtdLibMax: number = Number(req.cookies['qtdLibMax'])

    //Encerra o primeiro tempo de setup
    let end: number = Number(new Date().getTime());
    let start: string = String(req.cookies['starterBarcode'])
    const startTime: number = Number(new Date(start).getTime());
    let tempoDecorrido: number = Number(end - startTime)

    //Inicia a produção
    let startProd = new Date().getTime();
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
        const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected)
        console.log("query linha 572 : ", query);

        // //INSERE EM CODAPONTA 3
        const InsertCodTwo = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected)
        console.log("InsertCodTwo linha 577 : ", InsertCodTwo);

        if (!query) {
            return res.json({ message: "erro em ferselecionadas" })
        } else {
            return res.status(200).json({ message: 'ferramentas selecionadas com successo' })
        }
    } catch (error) {
        console.log(error)
        return res.redirect("/#/ferramenta")
    } finally {
        // await connection.close()
    }
}