import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
import { codeNote } from "../utils/codeNote";
import { decodedBuffer } from "../utils/decodeOdf";
//import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
//import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const point: RequestHandler = async (req, res) => {
    // console.log('linha 2000', req);
    // let ticket = req
    // console.log('linha 18 /req/', ticket);

    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    let supervisor: string | null = sanitize(req.body["supervisor"]) || null
    const motivorefugo: string | null = sanitize(req.body["value"]) || null
    const badFeed = Number(sanitize(req.body["badFeed"])) || 0;
    const missingFeed = Number(sanitize(req.body["missingFeed"])) || 0;
    const reworkFeed = Number(sanitize(req.body["reworkFeed"])) || 0;
    let condic: string | null;
    if (!req.cookies['condic']) {
        condic = null
    } else {
        condic = decrypted(String(sanitize(req.cookies['condic']))) || null
    }
    const odfNumber: number | null = Number(decrypted(sanitize(req.cookies["NUMERO_ODF"]))) || null
    const operationNumber = Number(decrypted(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    const codigoPeca = String(decrypted(sanitize(req.cookies['CODIGO_PECA']))) || null
    const machineCode = String(decrypted(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    const qtdLibMax: number | null = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || null
    const employee = decrypted(sanitize(req.cookies['FUNCIONARIO'])) || null
    const revisao = decrypted(sanitize(req.cookies['REVISAO'])) || null
    const updateQtyQuery: string[] = [];
    const updateQtyQuery2: string[] = [];
    var response = {
        message: '',
        balance: 0,
        url: '',
    }
    const lookForOdfData = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    const valuesFromBack = await select(lookForOdfData)

    let decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
    let decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
    let decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))

    if (decodedOdfNumber !== odfNumber || decodedOperationNumber !== operationNumber || decodedMachineCode !== machineCode) {
        console.log('cookies alterados');
        return res.json({ message: 'ODF criptografada e decodificada não coincidem' })
    }

    // if (valuesFromBack[0].APONTAMENTO_LIBERADO === 'N') {
    //     const y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`
    //     const x = await update(y)
    //     console.log('linha x', x);
    // } else if (valuesFromBack[0].APONTAMENTO_LIBERADO === 'S') {
    //     console.log('nao pode apontar');
    //     return res.json({ message: 'Algo deu errado' })
    // }

    //Inicia tempo de Rip
    res.cookie("startRip", Number(new Date().getTime()))

    // Variavel que guarda o valor total dos apontamentos
    const valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed))
    // const valorTotalApontado = (Number(qtdBoas) + Number(badFeed)  + Number(reworkFeed))
    let faltante = qtdLibMax! - valorTotalApontado

    // Tempo final de produção
    const finalProdTimer = Number(new Date().getTime() - Number(decrypted(String(req.cookies['startProd']))) / 1000) || 0

    const pointCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
    if (pointCode.message !== 'Ini Prod') {
        return res.json({ message: pointCode.message })
    }

    if (reworkFeed > 0) {

    }

    if (pointCode.funcionario !== employee) {
        return res.json({ message: 'Funcionario diferente' })
    }

    if (!valorTotalApontado) {
        return res.json({ message: 'Algo deu errado' })
    }

    if (!supervisor && valorTotalApontado === qtdLibMax) {
        if (badFeed! > 0) {
            return res.json({ message: 'Supervisor inválido' })
        } else {
            supervisor = '004067'
        }
    }
    if (!qtdLibMax) {
        console.log("linha 68 /point.ts/ qtdLibMax /", qtdLibMax);
        return res.json({ message: 'Quantidade inválida' })
    }

    if (!machineCode || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000') {
        return res.json({ message: 'Código máquina inválido' })
    }

    if (!operationNumber) {
        return res.json({ message: 'Número operação inválido' })
    }

    if (!codigoPeca || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' })
    }

    if (!odfNumber) {
        console.log('linha 99 /searchOdf/');
        return res.json({ message: 'Número odf inválido' })
    }

    if (!employee || employee === '0') {
        console.log('linha 103 /searchOdf/');
        return res.json({ message: 'Funcionário Inválido' })
    }

    if (qtdBoas! > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed! > qtdLibMax || missingFeed! > qtdLibMax || reworkFeed! > qtdLibMax) {
        console.log('linha 107 /searchOdf/');
        return res.json({ message: 'Quantidade excedida' })
    }

    console.log('faltante', faltante);
    if (!missingFeed) {
        faltante = qtdLibMax - valorTotalApontado
    }

    if (valorTotalApontado > qtdLibMax) {
        response.balance = qtdLibMax
        console.log('lina 118 /searchOdf/');
        return res.json({ message: 'valor apontado maior que a quantidade liberada' })
    }

    // Se houver refugo, verifica se o supervisor esta correto
    if (badFeed! > 0) {
        if (!motivorefugo) {
            console.log("Não foi dado motivo para o refugo");
            return res.json({ message: 'Algo deu errado' })
        }
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`
        const findSupervisor = await select(lookForSupervisor)
        if (!findSupervisor) {
            return res.json({ message: 'Supervisor não encontrado' })
        }
    }

    // Caso haja "P" faz update na quantidade de peças dos filhos
    if (condic === 'P') {
        if (!req.cookies['execut']) {
            return res.json({ message: 'Algo deu errado' })
        }
        let execut = Number(decrypted(sanitize(req.cookies['execut'])))
        let codigoFilho: string[];
        if (!req.cookies['codigoFilho']) {
            return res.json({ message: 'Algo deu errado' })
        } else {
            codigoFilho = decrypted(String(sanitize(req.cookies['codigoFilho']))).split(",") || null // VER DEPOIS !!!!!!!!!!!!!!
            if (!codigoFilho) {
                console.log(["Sem dados dos filhos"]);
                return res.json({ message: 'Algo deu errado' })
            }
        }
        try {
            let diferenceBetween = execut * qtdLibMax - valorTotalApontado * execut
            console.log('diference', diferenceBetween);
            const connection = await mssql.connect(sqlConfig);
            // Loop para atualizar o estoque
            if (valorTotalApontado < qtdLibMax!) {
                try {
                    codigoFilho.forEach((codigoFilho: string) => {
                        updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`)
                    });
                    await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected)
                } catch (error) {
                    console.log("linha 159 /point.ts/", error);
                    return res.json({ message: 'Algo deu errado' })
                }
            }

            // Loop para desconstar o saldo alocado
            try {
                let a: any = []
                codigoFilho.forEach((element: string) => {
                    const updateQuery: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${element}' `
                    const s = `UPDATE OPERACAO SET STATUS_RESERVA = NULL WHERE 1 = 1 AND NUMPEC =  TRIM('${codigoPeca}') AND NUMITE = '${element}' AND REVISAO = ${revisao}`
                    a.push(s)
                    updateQtyQuery2.push(updateQuery)
                });
                await connection.query(updateQtyQuery2.join("\n")).then(result => result.rowsAffected)
                await connection.query(a.join("\n")).then(result => result.rowsAffected)
            } catch (error) {
                console.log("linha 185 /Point.ts/", error);
                return res.json({ message: 'Algo deu errado' })
            } finally {
                await connection.close()
            }
        } catch (err) {
            console.log("linha 175  -Point.ts-", err);
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' })
        }
    }
    //let lib = valorTotalApontado -
    if(reworkFeed > 0){
        if(reworkFeed > valuesFromBack[0].QTD_REFUGO){
            console.log('Limite pra refugo inválido');
        }
    } 
    console.log('linha 218 /Point.ts/', valuesFromBack[0].QTD_FALTANTE );
    console.log('linha 219 /Point.ts/', valuesFromBack[0].QTD_REFUGO );

    // valuesFromBack[0].QTD_FALTANTE
    if(missingFeed > 0){
        faltante = missingFeed
    }

    const lib = qtdLibMax - valorTotalApontado
    console.log('badFeed', badFeed);
    console.log('missing', faltante);
    console.log('missing', reworkFeed);

    try {
        console.log("linha 228 /point.ts/ Alterando quantidade apontada...");
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${valorTotalApontado}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${badFeed}, QTDE_LIB = ${lib}, QTD_FALTANTE = ${faltante}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${qtdBoas}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${reworkFeed} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`
        await update(updateCol)
    } catch (error) {
        console.log("linha 209 - error - /point.ts/", error);
        return res.json({ message: 'Algo deu errado' })
    }

    // Insere codigo de apontamento 4 final de producao
    try {
        console.log("linha 238 /point.ts/ Inserindo dados de apontamento...");
        const codAponta = 4
        const descricaoCodigoAponta = 'Fin Prod'
        await insertInto(employee, odfNumber, codigoPeca, revisao, String(operationNumber), machineCode, qtdLibMax, qtdBoas!, badFeed!, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed!, finalProdTimer)
    } catch (error) {
        console.log("erro ao fazer insert linha 220 /point.ts/", error);
        return res.json({ message: 'Algo deu errado' })
    }

    qtdBoas = encrypted(String(qtdBoas))
    res.cookie('qtdBoas', qtdBoas)

    return res.json({ message: 'Sucesso ao apontar' })
}