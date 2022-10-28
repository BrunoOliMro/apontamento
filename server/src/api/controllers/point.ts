import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const point: RequestHandler = async (req, res, next) => {
    const connection = await mssql.connect(sqlConfig);
    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    let supervisor = String(sanitize(req.body["supervisor"])) || null
    let motivorefugo = String(sanitize(req.body["value"])) || null
    let badFeed = Number(sanitize(req.body["badFeed"])) || 0;
    let missingFeed = Number(sanitize(req.body["missingFeed"])) || 0;
    let reworkFeed = Number(sanitize(req.body["reworkFeed"])) || 0;
    let parcialFeed = Number(sanitize(req.body["parcialFeed"])) || 0;
    var codigoFilho: string[] = ((req.cookies['codigoFilho'])) // VER DEPOIS !!!!!!!!!!!!!!
    var reservedItens: number[] = (req.cookies['reservedItens'])// VER DEPOIS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let NUMERO_ODF = Number(sanitize(req.cookies["NUMERO_ODF"])) || 0
    let NUMERO_OPERACAO = String(sanitize(req.cookies["NUMERO_OPERACAO"])) || null
    let codigoPeca = String(sanitize(req.cookies['CODIGO_PECA'])) || null
    let CODIGO_MAQUINA = String(sanitize(req.cookies["CODIGO_MAQUINA"])) || null
    let qtdLibMax = Number(sanitize(req.cookies['qtdLibMax'])) || 0
    let condic = String(sanitize(req.cookies['CONDIC'])) || null
    let MAQUINA_PROXIMA = String(sanitize(req.cookies['MAQUINA_PROXIMA'])) || null
    let OPERACAO_PROXIMA = String(sanitize(req.cookies['OPERACAO_PROXIMA'])) || null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO'])) || null
    let revisao = Number(sanitize(req.cookies['REVISAO'])) || 0
    let qtdProd = Number(sanitize(req.cookies['qtdProduzir'])) || 0
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    let state = Number(0)
    res.cookie("startRip", startRip)

    //Encerra o tempo da produção
    let endProdTimer = new Date() || 0;
    //Inicia tempo de Rip
    let startProd = Number(req.cookies["startProd"] / 1000) || 0
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0

    let refugoQEstaNoSistema = Number(sanitize(req.cookies['QTD_REFUGO'])) || 0
    let retrabalhadas = reworkFeed - refugoQEstaNoSistema
    console.log('retrabalhadas ', retrabalhadas);
    
    
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed))
    valorTotalApontado = Number(valorTotalApontado)
    qtdLibMax = Number(qtdLibMax)
    let faltante = qtdLibMax - valorTotalApontado

    if (motivorefugo === undefined || motivorefugo === "undefined" || motivorefugo === null) {
        motivorefugo = null
    }

    //Verifica se a quantidade apontada mão é maior que a quantidade maxima liberada
    if (valorTotalApontado > qtdLibMax || valorTotalApontado > qtdProd) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' })
    }

    if(retrabalhadas + qtdBoas + badFeed > qtdLibMax ||retrabalhadas + qtdBoas + badFeed > qtdProd ){
        return res.json({ message: 'valor apontado maior que a quantidade liberada' })
    }

    if(retrabalhadas <= 0){
        console.log("quantidade de retrabalhadas maior que o que foi apontando");
        return res.json({ message: 'valor apontado excede o valor do sistema' })
    }

    //Verifica se existe o Supervisor
    if (badFeed > 0) {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'
        `).then(result => result.recordset);
        if (resource.length <= 0) {
            return res.json({ message: 'supervisor não encontrado' })
        }
    }

    if (condic === undefined || condic === null) {
        condic = "D";
        codigoFilho = [];
    }

    //Caso haja "P" faz update na quantidade de peças dos filhos
    try {
        state = 0
        if (condic === 'P') {
            try {
                // Loop para atualizar os dados no DB
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                }
                await connection.query(updateQtyQuery.join("\n"))
            } catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' })
            }
        }
        state = 1
    } catch (err) {
        state = 0
        console.log(err);
        return res.json({ message: 'erro ao verificar o "P' })
    }

    try {
        state = 9
        //Verifica caso a quantidade seja menor que o valor(assim a produção foi menor que o desejado), e deixa um "S" em apontamento liberado para um possivel apontamento futuro
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
        }
        //Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`)
        }

        //Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
        if (valorTotalApontado >= qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
        }

        //Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
        await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)


        // Insere o CODAPONTA 4, O tempo de produção e as quantidades boas, ruins, retrabalhadas e faltantes(HISAPONTA) 
        await connection.query(` INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        VALUES(GETDATE(),'${funcionario}',${NUMERO_ODF},'${codigoPeca}','${revisao}','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','${CODIGO_MAQUINA}','1',${qtdBoas},${badFeed},'${funcionario}','0','4', '4', 'Fin Prod.',${finalProdTimer},${finalProdTimer}, '1',  UPPER('${motivorefugo}') , ${faltante},${retrabalhadas})`)
        state = 10
        return res.json({ message: 'valores apontados com sucesso' })
    } catch (error) {
        state = 9
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' })
    } finally {
        //await connection.close()
    }
}