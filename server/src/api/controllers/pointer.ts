import type { RequestHandler } from 'express';
import mssql from 'mssql';
import sanitize from 'sanitize-html';
import { sqlConfig } from '../../global.config';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
import { encoded } from '../utils/encodedOdf';
import { encrypted } from '../utils/encryptOdf';
import { unravelBarcode } from '../utils/unravelBarcode'

export const pointerPost: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    const dados: any = unravelBarcode(req.body.codigoBarras)
    let message = String(req.body.message) || null
    let qtdLib: number = 0
    let apontLib: string = ''
    let qntdeJaApontada: number = 0
    let qtdLibMax: number = 0
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;

    if(message === 'codeApont 1 setup iniciado'){
        return res.json({message : 'codeApont 1 setup iniciado'})
    }

    if(message === `codeApont 4 prod finalzado`){
        return res.json({message : 'codeApont 4 prod finalzado'})
    }

    if(message === `codeApont 5 maquina parada`){
        return res.json({message : 'codeApont 5 maquina parada'})
    }

    let table = `VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK)`
    let column = `*`
    let top = ``
    let where = `AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL`
    let orderBy = `ORDER BY NUMERO_OPERACAO ASC`

    // Seleciona todos os itens da Odf
    const queryGrupoOdf: any = await select(table, top, column, where, orderBy)

    // Caso não encontre o numero da odf
    if (queryGrupoOdf!.message === 'odf não encontrada') {
        return res.json({ message: 'odf não encontrada' })
    }

    //Map pelo numero da operação e diz o indice de uma odf antes e uma depois
    let codigoOperArray = queryGrupoOdf!.map((e: any) => e.NUMERO_OPERACAO)
    let arrayAfterMap = codigoOperArray.map((e: any) => '00' + e).toString().replaceAll(' ', '0').split(',')
    let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((callback: string) => callback === dados.numOper)

    //Caso indice do array seja o primeiro
    if (indiceDoArrayDeOdfs <= 0) {
        indiceDoArrayDeOdfs = 0
    }

    let objOdfSelecionada = queryGrupoOdf![indiceDoArrayDeOdfs]
    let objOdfSelecProximo = queryGrupoOdf![indiceDoArrayDeOdfs + 1]
    let objOdfSelecAnterior = queryGrupoOdf![indiceDoArrayDeOdfs - 1]
    //console.log('linha 57 /pointer/', objOdfSelecAnterior);

    //Verifica caso o indice seja o primeiro e caso seja seta a quantidade liberada para a quantidade da odf seleciona
    if (indiceDoArrayDeOdfs === 0) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA']
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO']
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA']
        qtdLib = objOdfSelecionada['QTDE_ODF']
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO']
    }


    //Se for o ultimo indice do array
    if (indiceDoArrayDeOdfs === codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecionada['CODIGO_MAQUINA']
        codMaqProxOdf = objOdfSelecionada['NUMERO_OPERACAO']
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA']
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA']
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO']
    }

    //Se o indice for maior que zero essa operação pega a quantidade liberada na odf anterior e pega a letra e a quantidade já apontada da sua propria odf
    if (indiceDoArrayDeOdfs > 0 && indiceDoArrayDeOdfs < codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA']
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO']
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA']
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA']
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO']
    }

    if (qtdLib - qntdeJaApontada === 0) {
        return res.status(400).json({ message: 'não há limite na odf' })
    }

    qtdLibMax = qtdLib - qntdeJaApontada

    // Caso seja a primeira Odf, objOdfSelecAnterior vai vir como undefined
    if (objOdfSelecAnterior === undefined) {
        await connection.query(`
        UPDATE 
        PCP_PROGRAMACAO_PRODUCAO 
        SET 
        APONTAMENTO_LIBERADO = 'S' 
        WHERE 1 = 1 
        AND NUMERO_ODF = '${dados.numOdf}' 
        AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' 
        AND CODIGO_MAQUINA = '${dados.codMaq}'`)
    }

    if (objOdfSelecAnterior === undefined) {
        objOdfSelecAnterior = 0
    }

    let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(' ', '0')

    // Descriptografa o funcionario dos cookies
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))

    if(!funcionario){
        return res.json({message : 'Algo deu errado'})
    }

    //Criptografa os dados da ODF
    let qtdLibString: string = encrypted(String(qtdLibMax))
    let encryptedOdfNumber = encrypted(String(objOdfSelecionada['NUMERO_ODF']))
    const encryptedNextMachine = encrypted(String(codigoMaquinaProxOdf))
    const encryptedNextOperation = encrypted(String(codMaqProxOdf))
    const encryptedCodePart = encrypted(String(objOdfSelecionada['CODIGO_PECA']))
    const encryptedMachineCode = encrypted(String(objOdfSelecionada['CODIGO_MAQUINA']))
    const operationNumber = encrypted(String(numeroOper))
    const encryptedRevision = encrypted(String(objOdfSelecionada['REVISAO']))

    //Codifica os dados da ODF
    const encodedOdfNumber = encoded(String(objOdfSelecionada['NUMERO_ODF']))
    const encodedOperationNumber = encoded(String(numeroOper))
    const encodedMachineCode = encoded(String(objOdfSelecionada['CODIGO_MAQUINA']))

    res.cookie('NUMERO_ODF', encryptedOdfNumber);
    res.cookie('encodedOdfNumber', encodedOdfNumber)
    res.cookie('encodedOperationNumber', encodedOperationNumber)
    res.cookie('encodedMachineCode', encodedMachineCode)
    res.cookie('qtdLibMax', qtdLibString)
    res.cookie('MAQUINA_PROXIMA', encryptedNextMachine)
    res.cookie('OPERACAO_PROXIMA', encryptedNextOperation)
    res.cookie('CODIGO_PECA', encryptedCodePart)
    res.cookie('CODIGO_MAQUINA', encryptedMachineCode)
    res.cookie('NUMERO_OPERACAO', operationNumber)
    res.cookie('REVISAO', encryptedRevision)

    console.log("linha 146 /pointer/");

    if(message === 'codeApont 2 setup finalizado'){
        return res.json({message : 'codeApont 1 setup iniciado'})
    }

    if(message === `codeApont 3 prod iniciado`){
        return res.json({message : 'codeApont 3 prod iniciado'})
    }

    let data: any = await selectToKnowIfHasP(dados)

    if (data === 'valores reservados') {
        res.cookie('reservedItens', data!.reservedItens)
        res.cookie('codigoFilho', data!.codigoFilho)
        res.cookie('CONDIC', data!.selectKnowHasP[0].CONDIC)
        res.cookie('NUMITE', data!.codigoNumite)
        res.cookie('resultadoFinalProducao', data!.resultadoFinalProducao)
    }
    return res.json({message : 'codeApont 1 setup iniciado'})
    // if (message !== 'codeApont 1 setup iniciado') {
    //     await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
    //     VALUES (GETDATE(), '${funcionario}', ${dados.numOdf}, '${codigoPeca}', ${queryGrupoOdf[0].REVISAO},'${dados.numOper}', '${dados.numOper}', 'D', '${dados.codMaq}',0, 0, 0, '${funcionario}', '0', 1, '1', 'Ini Set.', 0, 0, '1', 0, 0 )`)
    //         .then(record => record.rowsAffected)
    //     return res.status(200).json({ message: 'valores reservados' })
    // }

    // if (message === 'insira cod 1' || message === 'codeApont 6 processo finalizado') {
    // }

    // if (message === 'codeApont 1 setup iniciado') {
    //     console.log("linha 128", message);
    //     return res.json({ message: 'codeApont 1 setup iniciado' })
    // }

    // if (message === 'codeApont 2 setup finalizado') {
    //     return res.json({ message: 'codeApont 2 setup finalizado' })
    // }
    // // console.log("linha 135");
    // try {
    //     if (message === 'codeApont 3 prod iniciado') {
    //         console.log("message", message);
    //         return res.json({ message: 'codeApont 3 prod iniciado' })
    //     }
    // } catch (error) {
    //     console.log('linha 141', error);
    // }
    // // console.log("linha 139", message);

    // if (message === 'codeApont 4 prod finalzado') {
    //     return res.json({ message: 'codeApont 4 prod finalzado' })
    // }
    // if (message === 'codeApont 5 maquina parada') {
    //     return res.json({ message: 'codeApont 5 maquina parada' })
    // }
    // // if (message === 'codeApont 6 prod iniciado') {
    // //     return res.json({ message: 'codeApont 6 prod iniciado' })
    // // }
    // if (message === 'qualquer outro codigo') {
    //     return res.json({ message: 'qualquer outro codigo' })
    // }

    //console.log('data', data);
    // if (data! === 'não foi necessario reservar') {
    //     return res.json({ message: 'não foi necessario reservar' })
    // }

    // console.log("linha 80 hasP", response);
    //     try {
    //         //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
    //         const selectKnowHasP = await connection.query(`
    //                     SELECT DISTINCT                 
    //                        OP.NUMITE,                 
    //                        CAST(OP.EXECUT AS INT) AS EXECUT,
    //                        CONDIC,       
    //                        CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
    //                        CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
    //                        ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado
    //                        FROM PROCESSO PRO (NOLOCK)                  
    //                        INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  
    //                        INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                
    //                        INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                
    //                        WHERE 1=1                    
    //                        AND PRO.ATIVO ='S'                   
    //                        AND PRO.CONCLUIDO ='T'                
    //                        AND OP.CONDIC ='P'                 
    //                        AND PCP.NUMERO_ODF = '${dados.numOdf}'    
    //                     `.trim()
    //         ).then(result => result.recordset)
    //         console.log('RESOURCE: ', selectKnowHasP);


    //         if (selectKnowHasP.length > 0) {
    //             res.cookie('CONDIC', selectKnowHasP[0].CONDIC)
    //             let codigoNumite = selectKnowHasP.map(e => e.NUMITE)
    //             res.cookie('NUMITE', codigoNumite)
    //             /**
    //              * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
    //              */
    //             function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
    //                 // Quantas peças pai o estoque do componente poderia produzir
    //                 const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
    //                     return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
    //                 });

    //                 const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
    //                     return Math.min(qtdMax, pecasPorComp);
    //                 }, Infinity);

    //                 Math.round(qtdMaxProduzivel)
    //                 return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
    //             }

    //             //Map na quantidade de itens para execução e map do estoque
    //             const execut = selectKnowHasP.map(item => item.EXECUT);
    //             const saldoReal = selectKnowHasP.map(item => item.SALDOREAL);

    //             let qtdTotal = calMaxQuant(execut, saldoReal);

    //             //Retorna um array com a quantidade de itens total da execução
    //             const reservedItens = execut.map((quantItens) => {
    //                 return Math.floor((qtdTotal || 0) * quantItens)
    //             }, Infinity)
    //             res.cookie('reservedItens', reservedItens)
    //             const codigoFilho = selectKnowHasP.map(item => item.NUMITE)
    //             res.cookie('codigoFilho', codigoFilho)

    //             let qtdProdOdf: Number = Number(selectKnowHasP[0].QTDE_ODF)
    //             let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))
    //             if (resultadoFinalProducao <= 0) {
    //                 resultadoFinalProducao = 0
    //                 return resultadoFinalProducao
    //             }
    //             res.cookie('resultadoFinalProducao', resultadoFinalProducao)
    //             // Loop para atualizar os dados no DB
    //             const updateQtyQuery = [];
    //             const updateQtyRes = [];

    //             for (const [i, qtdItem] of reservedItens.entries()) {
    //                 updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
    //             }
    //             await connection.query(updateQtyQuery.join('\n'));


    //             for (const [i, qtdItem] of reservedItens.entries()) {
    //                 updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
    //             }
    //             await connection.query(updateQtyRes.join('\n'));
    //             return res.json({ message: `valores reservados` })
    //         }

    //         if (selectKnowHasP.length <= 0) {
    //             return res.json({ message: 'não foi necessario reservar' })
    //         }

    //     } catch (error) {
    //         console.log('linha 214: ', error);
    //         return res.json({ message: 'CATCH ERRO NO TRY' })
    //     } finally {
    //         // await connection.close()
    //     }
}