import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectToKnowIfHasP = async (dados: any) => {
    let response = {}
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
        console.log('RESOURCE: ', !selectKnowHasP);

        if (selectKnowHasP.length > 0) {
            //Map na quantidade de itens para execução e map do estoque
            let codigoNumite = selectKnowHasP.map(e => e.NUMITE)
            const execut = selectKnowHasP.map(item => item.EXECUT);
            //const saldoReal = selectKnowHasP.map(item => item.SALDOREAL);
            const codigoFilho = selectKnowHasP.map(item => item.NUMITE)

            /**
             * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
             */
            // function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
            //     // Quantas peças pai o estoque do componente poderia produzir
            //     const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
            //         return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
            //     });

            //     const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
            //         return Math.min(qtdMax, pecasPorComp);
            //     }, Infinity);

            //     Math.round(qtdMaxProduzivel)
            //     return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            // }

            const qtdLibProd: any = selectKnowHasP.map(e => e.QTD_LIBERADA_PRODUZIR)

            const  numberOfQtd = Math.min(...qtdLibProd)

            
            if(numberOfQtd <= 0){
                return response = 'Quantidade para reserva inválida'
            }
            
            console.log("LINHA 63",numberOfQtd );
            //let qtdTotal = calMaxQuant(execut, saldoReal);


            //let qtdProdOdf: Number = Number(selectKnowHasP[0].QTDE_ODF)

           //let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))
            
            // if (resultadoFinalProducao <= 0) {
            //     resultadoFinalProducao = 0
            //     return resultadoFinalProducao
            // }

            //Retorna um array com a quantidade de itens total da execução
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((numberOfQtd || 0) * quantItens)
            }, Infinity)

            response = {
                message: '',
                reservedItens: reservedItens,
                codigoFilho: codigoFilho,
                condic: selectKnowHasP[0].CONDIC,
                numite: codigoNumite,
                //resultadoFinalProducao: resultadoFinalProducao,
            }

            const updateQtyQuery = [];
            //const updateQtyRes = [];

            // Loop para atualizar os dados no DB
            for (const [i, qtdItem] of reservedItens.entries()) {
                console.log("i", i);
                console.log("codigo", codigoFilho[i]);
                updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${qtdItem} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
            }
            await connection.query(updateQtyQuery.join('\n'));

            console.log("linha 100");

            // for (const [i, qtdItem] of reservedItens.entries()) {
            //     updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE - ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            // }
            // await connection.query(updateQtyRes.join('\n'));

            reservedItens.map((value) => {
                if (value === 0) {
                    console.log("linha 82 /selecthasP/", response);
                    return response = 'Algo deu errado'
                } else {
                    return response = 'Valores Reservados'
                }
            })

            console.log("linha 107", response);
        } else if (selectKnowHasP.length <= 0) {
            return response = "Não há item para reservar"
        } else {
            return response = "Algo deu errado"
        }

    } catch (error) {
        console.log('linha 214: ', error);
        return response = "Algo deu errado"
    } finally {
        // await connection.close()
    }
}