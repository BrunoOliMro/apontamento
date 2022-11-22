import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const point: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    let supervisor = String(sanitize(req.body["supervisor"])) || null
    let motivorefugo: string = String(sanitize(req.body["value"]))
    let badFeed = Number(sanitize(req.body["badFeed"])) || 0;
    let missingFeed = Number(sanitize(req.body["missingFeed"])) || 0;
    let reworkFeed = Number(sanitize(req.body["reworkFeed"])) || 0;
    //let parcialFeed = Number(sanitize(req.body["parcialFeed"])) || 0;

    console.log("linha 21 /point.ts/", qtdBoas);

    var codigoFilho: string[] = ((req.cookies['codigoFilho']))  || null // VER DEPOIS !!!!!!!!!!!!!!
    var reservedItens: number[] = (req.cookies['reservedItens']) || null // VER DEPOIS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let condic = String(sanitize(req.cookies['CONDIC'])) || null
    
    let NUMERO_ODF: number = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    NUMERO_ODF = Number(NUMERO_ODF)
    let NUMERO_OPERACAO = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    let CODIGO_MAQUINA = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    let qtdLibMax = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    let MAQUINA_PROXIMA = decrypted(String(sanitize(req.cookies['MAQUINA_PROXIMA']))) || null
    let OPERACAO_PROXIMA = decrypted(String(sanitize(req.cookies['OPERACAO_PROXIMA']))) || null
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    let revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    //let retrabalhadas = 0;
    //let qtdProd = Number(sanitize(req.cookies['qtdProduzir'])) || 0
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    res.cookie("startRip", startRip)

    //Encerra o tempo da produção
    let endProdTimer = new Date() || 0;

    //Inicia tempo de Rip
    let startProd = Number(req.cookies["startProd"] / 1000) || 0
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0

    // Varial que guarda o valor total dos apontamentos
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed)) //+ Number(parcialFeed))
    let faltante = qtdLibMax - valorTotalApontado

    qtdLibMax = Number(qtdLibMax)

    console.log("linha 56 /point.ts/");

    if(!supervisor || supervisor === 'undefined' || supervisor === '' && valorTotalApontado === qtdLibMax){
        supervisor = '004067'
    }

    console.log("linha 62 Supervisor /point.ts/", supervisor);

    if(!supervisor || supervisor === 'undefined' || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000'){
        return res.json({message : 'Supervisor inválido'})
    }

    if(!qtdLibMax || qtdLibMax === 0){
        return res.json({message : 'Quantidade inválida'  })
    }

    console.log("linha 73 /point.ts/");

    if (CODIGO_MAQUINA === null || CODIGO_MAQUINA === undefined || CODIGO_MAQUINA === '' || CODIGO_MAQUINA === '0' || CODIGO_MAQUINA === '00' || CODIGO_MAQUINA === '000' || CODIGO_MAQUINA === '0000' || CODIGO_MAQUINA === '00000') {
        return res.json({ message: 'Código máquina inválido' })
    }

    if (NUMERO_OPERACAO === null || NUMERO_OPERACAO === undefined || NUMERO_OPERACAO === '' || NUMERO_OPERACAO === '0' || NUMERO_OPERACAO === '00' || NUMERO_OPERACAO === '000' || NUMERO_OPERACAO === '0000' || NUMERO_OPERACAO === '00000') {
        return res.json({ message: 'Número operação inválido' })
    }

    if(!codigoPeca || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000'){
        return res.json({ message: 'Código de peça inválido' })
    }

    // if (codigoPeca === null || codigoPeca === undefined || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
    // }

    console.log("linha 87 /point.ts/");

    if (NUMERO_ODF === 0 || NUMERO_ODF === null || NUMERO_ODF === undefined) {
        return res.json({ message: 'Número odf inválido' })
    }

    if (funcionario === undefined || funcionario === null || funcionario === '' || funcionario === '0') {
        return res.json({ message: 'Funcionário Inválido' })
    }

    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        return res.json({ message: 'Quantidade excedida' })
    }

    console.log("linha 56 Boas /point.ts/", qtdBoas);

    if(qtdBoas === null || qtdBoas === undefined || missingFeed === null || missingFeed === undefined || valorTotalApontado === null || valorTotalApontado === undefined ){
        return res.json({ message : 'Quantidade inválida'})
    }

    if (missingFeed <= 0) {
        faltante = qtdLibMax - valorTotalApontado
    }

    console.log("linha 113 Faltante  /point.ts/", faltante);

    if (motivorefugo === undefined || motivorefugo === "undefined") {
        motivorefugo =  ''
    }

    console.log("linha 119  - Motivo /point.ts/", motivorefugo);

    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' })
    }

    //Verifica se existe o Supervisor
    if (badFeed > 0) {
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`
        const resource = await select(lookForSupervisor)

        if (resource.length <= 0) {
            return res.json({ message: 'Supervisor não encontrado' })
        }
    }

    console.log("linha 137 BadFeed / point.ts/ ", badFeed);

    if (condic === undefined || condic === null || condic === 'undefined') {
        condic = "D";
        codigoFilho = [];
    }

    console.log("linha 144 Condic /point.ts/", condic);

    //Caso haja "P" faz update na quantidade de peças dos filhos
    try {

        if (condic === 'P') {
            try {
                // Loop para atualizar os dados no DB
                for (const [i, qtdItem] of reservedItens.entries()) {
                    console.log("atualizando a quantidade em itens filhos /linha 153 point.ts/", i);
                    // updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                    let updateQuery = `UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}' `
                    updateQtyQuery.push(update(updateQuery))
                }
                await connection.query(updateQtyQuery.join("\n"))
            } catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' })
            }
        }
        console.log("linha 147", condic);

    } catch (err) {
        console.log(err);
        return res.json({ message: 'erro ao verificar o "P' })
    }

    try {
        //Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
        if (valorTotalApontado < qtdLibMax) {
            const updateNextProcess =`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`
            await update(updateNextProcess)
        }

        //Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
        if (valorTotalApontado >= qtdLibMax) {
           const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'` 
           await update(updateQtdpointed)
        }

        console.log("linha 184 - valor Apontado /point.ts/", valorTotalApontado);

        //Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`
        await update(updateCol)


        try{
            console.log("linha 189 /point.ts/ Inserindo dados de apontamento...");
            let codAponta = 4
            let descricaoCodigoAponta = 'Fin Prod'
            await insertInto(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer)
        } catch (error){
            console.log("erro ao fazer insert linha 188 /point.ts/");
        }

        
        qtdBoas = encrypted(String(qtdBoas))
        res.cookie('qtdBoas', qtdBoas)

        console.log("linha 197 - chegou ao fim /point.ts/", qtdBoas);
        
        return res.json({ message: 'Sucesso ao apontar' })
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Erro ao apontar' })
    } finally {
        //await connection.close()
    }
}