import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
//import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const point: RequestHandler = async (req, res) => {
    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    let supervisor: string = sanitize(req.body["supervisor"]) || null
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
    const odfNumber: number = Number(decrypted(sanitize(req.cookies["NUMERO_ODF"]))) || 0
    const operationNumber = decrypted(sanitize(req.cookies["NUMERO_OPERACAO"])) || null
    const codigoPeca = decrypted(sanitize(req.cookies['CODIGO_PECA'])) || null
    const machineCode = decrypted(sanitize(req.cookies["CODIGO_MAQUINA"])) || null
    const qtdLibMax: number = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || 0
    //const nextMachineProcess = decrypted(sanitize(req.cookies['MAQUINA_PROXIMA'])) || null
    //const nextOperationProcess = decrypted(sanitize(req.cookies['OPERACAO_PROXIMA'])) || null
    const employee = decrypted(sanitize(req.cookies['FUNCIONARIO'])) || null
    const revisao = decrypted(sanitize(req.cookies['REVISAO'])) || null
    const updateQtyQuery: string[] = [];
    const updateQtyQuery2: string[] = [];
    var response = {
        message: '',
        balance: 0,
        url: '',
    }
    //Inicia tempo de Rip
    res.cookie("startRip", Number(new Date().getTime()))

    // Tempo final de produção
    const finalProdTimer = Number(new Date().getTime() - Number(decrypted(String(req.cookies['startProd']))) / 1000) || 0

    // Varial que guarda o valor total dos apontamentos
    const valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed)) //+ Number(parcialFeed))
    let faltante = qtdLibMax - valorTotalApontado

    console.log("linha 56 /point.ts/");

    const lookForHisaponta = `SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${operationNumber} AND ITEM = '${machineCode}' ORDER BY DATAHORA DESC`
    const x = await select(lookForHisaponta)
    console.log('x', x);
    if (x[0].CODAPONTA === 4 || x[0].CODAPONTA === 5 || x[0].CODAPONTA === 6) {
        return res.json({ message: 'Already pointed' })
    } else if (x[0].CODAPONTA === 7) {
        return res.json({ message: 'Machine stopped' })
    } else if (x[0].CODAPONTA === 1 || x[0].CODAPONTA === 2) {
        return res.json({ message: 'Jumping steps' })
    } else if (x[0].CODAPONTA !== 3) {
        return res.json({ message: 'Algo deu errado' })
    }

    if (!valorTotalApontado) {
        return res.json({ message: 'Algo deu errado' })
    }

    if (!supervisor || supervisor === '' && valorTotalApontado === qtdLibMax) {
        if (badFeed > 0) {
            return res.json({ message: 'Supervisor inválido' })
        } else {
            supervisor = '004067'
        }
    }

    console.log("linha 62 Supervisor /point.ts/", supervisor);

    if (!supervisor || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000') {
        console.log("linha 64");
        return res.json({ message: 'Supervisor inválido' })
    }

    console.log("linha 68", qtdLibMax);

    if (!qtdLibMax) {
        console.log("linha 68 /point.ts/ qtdLibMax /", qtdLibMax);
        return res.json({ message: 'Quantidade inválida' })
    }

    console.log("linha 73 /point.ts/");

    if (!machineCode || machineCode === '' || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000') {
        return res.json({ message: 'Código máquina inválido' })
    }

    if (!operationNumber || operationNumber === '' || operationNumber === '0' || operationNumber === '00' || operationNumber === '000' || operationNumber === '0000' || operationNumber === '00000') {
        return res.json({ message: 'Número operação inválido' })
    }

    if (!codigoPeca || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' })
    }

    console.log("linha 87 /point.ts/");

    if (!odfNumber) {
        console.log('linha 99 /searchOdf/');
        return res.json({ message: 'Número odf inválido' })
    }

    if (!employee || employee === '0') {
        console.log('linha 103 /searchOdf/');
        return res.json({ message: 'Funcionário Inválido' })
    }

    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        console.log('linha 107 /searchOdf/');
        return res.json({ message: 'Quantidade excedida' })
    }

    console.log('faltante', faltante);
    if (!missingFeed) {
        faltante = qtdLibMax - valorTotalApontado
    }

    if (valorTotalApontado > qtdLibMax) {
        console.log('lina 118 /searchOdf/');
        return res.json({ message: 'valor apontado maior que a quantidade liberada' })
    }

    // Se houver refugo, verifica se o supervisor esta correto
    if (badFeed > 0) {
        if (!motivorefugo) {
            console.log(["Não foi dado motivo para o refugo"]);
            return res.json({ message: 'Algo deu errado' })
        }
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`
        const findSupervisor = await select(lookForSupervisor)

        if (findSupervisor === 'Algo deu errado' || findSupervisor === 'Data not found') {
            return res.json({ message: 'Supervisor não encontrado' })
        }
    }

    //let qtdLibMax = Number(String(decrypted(sanitize(req.cookies['QTDE_LIB']))));

    if (valorTotalApontado > qtdLibMax!) {
        console.log('linha 145 /não da pra fazer essa operação/');
        response.message = 'Saldo menor que o apontado'
        response.balance = qtdLibMax
        console.log('linha 148/response/', response);
        return res.json(response)
    }

    console.log('linha 147 /searchOdf/', condic);
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
            const connection = await mssql.connect(sqlConfig);
            let diferenceBetween = execut * qtdLibMax - valorTotalApontado * execut

            // Loop para atualizar o estoque
            if (valorTotalApontado < qtdLibMax!) {
                //console.log("linha 156 /point.ts/");
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
                codigoFilho.forEach((element: string) => {
                    const updateQuery: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${element}' `
                    updateQtyQuery2.push(updateQuery)
                });
                await connection.query(updateQtyQuery2.join("\n")).then(result => result.rowsAffected)
            } catch (error) {
                console.log("linha 185 /selectHasP/", error);
                return res.json({ message: 'Algo deu errado' })
            } finally {
                await connection.close()
            }
        } catch (err) {
            console.log("linha 175  -Point.ts-", err);
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' })
        }
    }

    // Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
    // try {
    //     if (valorTotalApontado < qtdLibMax) {
    //         const updateNextProcess = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${nextOperationProcess}' AND CODIGO_MAQUINA = '${nextMachineProcess}'`
    //         await update(updateNextProcess)
    //     }
    // } catch (error) {
    //     console.log('linha 198 - error - //point.ts', error);
    //     return res.json({ message: 'Algo deu errado' })
    // }

    // Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
    // if (valorTotalApontado === qtdLibMax) {
    //     try {
    //         const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`
    //         await update(updateQtdpointed)
    //     } catch (error) {
    //         console.log('linha 212 - error - //point.ts', error);
    //         return res.json({ message: 'Algo deu errado' })
    //     }
    // }


    // Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
    try {
        console.log("linha 228 /point.ts/ Alterando quantidade apontada...");
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}', QTDE_LIB = QTDE_LIB + ${valorTotalApontado}, QTD_FALTANTE = ${faltante} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`
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
        await insertInto(employee, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer)
    } catch (error) {
        console.log("erro ao fazer insert linha 220 /point.ts/", error);
        return res.json({ message: 'Algo deu errado' })
    }

    qtdBoas = encrypted(String(qtdBoas))
    res.cookie('qtdBoas', qtdBoas)

    return res.json({ message: 'Sucesso ao apontar' })
}