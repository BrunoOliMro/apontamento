import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectToKnowIfHasP = async (dados: any) => {
    let response: any = {}
    try {
        //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
        const connection = await mssql.connect(sqlConfig);
        const selectKnowHasP = await connection.query(`
                    SELECT DISTINCT                 
                       OP.NUMITE,                 
                       CAST(OP.EXECUT AS INT) AS EXECUT,
                       CONDIC,       
                       CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
                       CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
                       ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado
                       FROM PROCESSO PRO (NOLOCK)                  
                       INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  
                       INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                
                       INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                
                       WHERE 1=1                    
                       AND PRO.ATIVO ='S'                   
                       AND PRO.CONCLUIDO ='T'                
                       AND OP.CONDIC ='P'                 
                       AND PCP.NUMERO_ODF = '${dados.numOdf}'    
                    `.trim()
        ).then(result => result.recordset)
        console.log('RESOURCE: ', selectKnowHasP);

        if (selectKnowHasP.length > 0) {
            let codigoNumite = selectKnowHasP.map(e => e.NUMITE)
            const execut = selectKnowHasP.map(item => item.EXECUT);
            const saldoReal = selectKnowHasP.map(item => item.SALDOREAL);
            const codigoFilho = selectKnowHasP.map(item => item.NUMITE)

            /**
             * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
             */
            function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
                // Quantas peças pai o estoque do componente poderia produzir
                const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
                    return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
                });

                const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
                    return Math.min(qtdMax, pecasPorComp);
                }, Infinity);

                Math.round(qtdMaxProduzivel)
                return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            }

            //Map na quantidade de itens para execução e map do estoque

            let qtdTotal = calMaxQuant(execut, saldoReal);

            //Retorna um array com a quantidade de itens total da execução
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((qtdTotal || 0) * quantItens)
            }, Infinity)

            let qtdProdOdf: Number = Number(selectKnowHasP[0].QTDE_ODF)
            let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))
            if (resultadoFinalProducao <= 0) {
                resultadoFinalProducao = 0
                return resultadoFinalProducao
            }            // Loop para atualizar os dados no DB
            const updateQtyQuery = [];
            const updateQtyRes = [];



            response.reservedItens = reservedItens
            response.codigoFilho = codigoFilho
            response.CONDIC = selectKnowHasP[0].CONDIC
            response.NUMITE = codigoNumite
            response.resultadoFinalProducao = resultadoFinalProducao

            console.log("linha 80 hasP", response);

            // res.cookie('reservedItens', reservedItens)
            // res.cookie('codigoFilho', codigoFilho)
            // res.cookie('CONDIC', selectKnowHasP[0].CONDIC)
            // res.cookie('NUMITE', codigoNumite)
            // res.cookie('resultadoFinalProducao', resultadoFinalProducao)


            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyQuery.join('\n'));


            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyRes.join('\n'));
            return response.message = "valores reservados"
            //return res.json({ message: `valores reservados` })
        }

        if (selectKnowHasP.length <= 0) {
            return response.message = "não foi necessario reservar"
            //return res.json({ message: 'não foi necessario reservar' })
        } else {
            return response.message = "Algo deu errado"
        }

    } catch (error) {
        console.log('linha 214: ', error);
        return response.message = "catch erro no try"
       // return res.json({ message: 'CATCH ERRO NO TRY' })
    } finally {
        // await connection.close()
    }
}