import { sqlConfig } from '../../global.config'
import { message } from './message';
import mssql from 'mssql';

export const selectQuery = async (chosenOption: number, values?: any) => {
    if (!values) {
        values = ""
    }
    const codes: { [key: string]: string } = {
        0: `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`,
        1: `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`,
        2: `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${values.CODIGO_PECA}' AND REVISAO = ${values.REVISAO} AND IMAGEM IS NOT NULL`,
        3: `SELECT TOP 1 NUMPEC, QUANT, REVISAO, COMPRIMENTO, LARGURA, AREA, EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${values.CODIGO_PECA}' AND REVISAO = ${values.REVISAO} AND NUMITE IS NOT NULL`,
        4: `SELECT * FROM  CST_CAD_ENDERECOS CE WHERE 1 = 1  AND ENDERECO = '${values.ENDERECO}'`,
        5: `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${values.NUMERO_ODF}' ORDER BY DATAHORA DESC`,
        6: `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${values.NUMERO_ODF}' ORDER BY OP ASC`,
        7: `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`,
        8: `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND NUMERO_OPERACAO = ${values.NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`,
        9: `SELECT TOP 1 USUARIO FROM HISAPONTA WHERE 1 = 1 AND ODF = '${values.NUMERO_ODF}'  ORDER BY DATAHORA DESC`,
        10: `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${values.supervisor}'`,
        13: `SELECT DESCRICAO FROM MOTIVO_DEVOLUCAO`,
        14: `SELECT DISTINCT PROCESSO.NUMPEC, PROCESSO.REVISAO, QA_CARACTERISTICA.NUMCAR AS NUMCAR, QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE, QA_CARACTERISTICA.DESCRICAO, ESPECIFICACAO  AS ESPECIF, LIE, LSE, QA_CARACTERISTICA.INSTRUMENTO FROM PROCESSO INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA  AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO  LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA   FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE WHERE PROCESSO.NUMPEC = '${values.CODIGO_PECA}'  AND PROCESSO.REVISAO = '${values.REVISAO}'  AND CST_NUMOPE = '${values.CODIGO_MAQUINA}' AND NUMCAR < '2999' ORDER BY NUMPEC ASC`,
        16: `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${values.badge}' ORDER BY FUNCIONARIO`,
        19: `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${values.CODIGO_PECA}' AND REVISAO = ${values.REVISAO} AND IMAGEM IS NOT NULL`,
        20: `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND MAQUIN = '${values.CODIGO_MAQUINA}' AND NUMOPE = ${values.NUMERO_OPERACAO} AND IMAGEM IS NOT NULL AND CODIGO = '${values.CODIGO_PECA}'`,
        21: `SELECT  ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ALOCADO  FROM CST_ALOCACAO WHERE 1 = 1 AND ODF = ${values.NUMERO_ODF} ORDER BY CODIGO ASC`,
        22: `SELECT DISTINCT PCP.NUMERO_ODF, OP.NUMITE, OP.NUMSEQ, CAST(LTRIM(OP.NUMOPE) AS INT) AS NUMOPE, CAST(OP.EXECUT AS INT) AS EXECUT, CONDIC, CAST(E.SALDOREAL AS INT) AS SALDOREAL, CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR, ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as RESERVADO FROM PROCESSO PRO (NOLOCK) INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_ INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC WHERE 1 = 1 AND PRO.ATIVO ='S' AND PRO.CONCLUIDO ='T' AND OP.CONDIC ='P' AND PCP.NUMERO_ODF = '${values.NUMERO_ODF}' AND OP.NUMSEQ = ${Number(values.NUMERO_OPERACAO)}`,
        23: `SELECT TOP 1 CODAPONTA, USUARIO, DATAHORA FROM HISAPONTA WHERE 1 = 1 AND ODF = '${values.NUMERO_ODF}' AND NUMOPE = ${Number(values.numeroOperNew) || Number(values.NUMERO_OPERACAO)} AND ITEM = '${values.CODIGO_MAQUINA}' ORDER BY DATAHORA DESC`,
        24: `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`,
        25: `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${values.CODIGO_PECA}' AND NUMOPE = ${values.NUMERO_OPERACAO} AND MAQUIN = '${values.CODIGO_MAQUINA}' AND REVISAO = ${values.REVISAO} ORDER BY REVISAO DESC`,
        26: `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${values.CODIGO_PECA}' AND REVISAO = '${values.REVISAO}' AND IMAGEM IS NOT NULL`,
        27: `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`,
        28: `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`,
        29: `SELECT TOP 1  SALDO FROM HISREAL WHERE 1 = 1 AND CODIGO = '${values.partCode}' ORDER BY DATA DESC`,
        30: `SELECT TOP 1 QTDE_LIB FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = '${values.NUMERO_ODF}' AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}' AND NUMERO_OPERACAO = '${values.NUMERO_OPERACAO}'  `
    }

    try {
        const connection = await mssql.connect(sqlConfig);
        const data = await connection.query(`${codes[String(chosenOption)]}`).then((result) => result.recordset)
        await connection.close()
        if (data.length > 0) {
            return { message: message(1), data: data }
        } else {
            return { message: message(1), data: message(33) }
        }
    } catch (error) {
        console.log('Error on selectQuery ', error)
        return { message: message(33), data: message(33) }
    }
}