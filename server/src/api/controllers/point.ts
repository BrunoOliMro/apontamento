import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const point: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    let supervisor: string = sanitize(req.body["supervisor"]) || null
    const motivorefugo: string | null = sanitize(req.body["value"]) || null
    const badFeed = Number(sanitize(req.body["badFeed"])) || 0;
    const missingFeed = Number(sanitize(req.body["missingFeed"])) || 0;
    const reworkFeed = Number(sanitize(req.body["reworkFeed"])) || 0;
    var codigoFilho: string[] = (decrypted(sanitize(req.cookies['codigoFilho']))) || null // VER DEPOIS !!!!!!!!!!!!!!
    console.log("linha 20 /point.ts/", codigoFilho);
    //var reservedItens: number[] = (req.cookies['reservedItens']) || null // VER DEPOIS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const condic: string | null = String(sanitize(req.cookies['condic'])) || null
    const odfNumberDecrypted: number = Number(decrypted(sanitize(req.cookies["NUMERO_ODF"]))) || 0
    const operationNumber = decrypted(sanitize(req.cookies["NUMERO_OPERACAO"])) || null
    const codigoPeca = decrypted(sanitize(req.cookies['CODIGO_PECA'])) || null
    const machineCode = decrypted(sanitize(req.cookies["CODIGO_MAQUINA"])) || null
    const qtdLibMax: number = Number(decrypted(sanitize(req.cookies['qtdLibMax']))) || 0
    const nextMachineProcess = decrypted(sanitize(req.cookies['MAQUINA_PROXIMA'])) || null
    const nextOperationProcess = decrypted(sanitize(req.cookies['OPERACAO_PROXIMA'])) || null
    const employee = decrypted(sanitize(req.cookies['employee'])) || null
    const revisao = decrypted(sanitize(req.cookies['REVISAO'])) || null
    const quantidade = req.cookies['quantidade']
    const updateQtyQuery: string[] = [];
    const updateQtyQuery2: string[] = [];

    //Inicia tempo de Rip
    res.cookie("startRip", Number(new Date()))

    // Tempo final de produção
    const finalProdTimer = Number(new Date().getTime() - Number(decodedBuffer(req.cookies['startProd'])) / 1000) || 0

    // Varial que guarda o valor total dos apontamentos
    const valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed)) //+ Number(parcialFeed))
    let faltante = qtdLibMax - valorTotalApontado

    console.log("linha 56 /point.ts/");

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

    if (!odfNumberDecrypted) {
        return res.json({ message: 'Número odf inválido' })
    }

    if (!employee || employee === '0') {
        return res.json({ message: 'Funcionário Inválido' })
    }

    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        return res.json({ message: 'Quantidade excedida' })
    }

    console.log("linha 99 Boas /point.ts/", qtdBoas);

    // if (!qtdBoas || !missingFeed || !valorTotalApontado) {
    //     return res.json({ message: 'Quantidade inválida' })
    // }

    if (!missingFeed) {
        faltante = qtdLibMax - valorTotalApontado
    }

    console.log("linha 113 Faltante  /point.ts/", faltante);

    if (valorTotalApontado > qtdLibMax) {
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

    const quantidadePossivelProduzir = Number(req.cookies['quantidade'])

    if (valorTotalApontado > quantidadePossivelProduzir) {
        return res.json({ message: 'Algo deu errado' })
    }

    // Caso haja "P" faz update na quantidade de peças dos filhos
    if (condic === 'P') {
        if (!codigoFilho) {
            console.log(["Sem dados dos filhos"]);
            return res.json({ message: 'Algo deu errado' })
        }
        try {
            //const min = Math.min(...reservedItens)
            const diference = qtdLibMax - valorTotalApontado
            const returnValueToStorage = diference / 2

            console.log("diference", returnValueToStorage);
            console.log("qtdLibMax", qtdLibMax);
            console.log("valorTotalApontado", valorTotalApontado);

            // Loop para atualizar o estoque
            if (valorTotalApontado < quantidade) {
                try {
                    codigoFilho.forEach((codigoFilho: string) => {
                        updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${returnValueToStorage} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`)
                    });
                    await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected)

                    // for (const [i] of quantidade.length.entries()) {
                    // }
                } catch (error) {
                    console.log("linha 159 /point.ts/", error);
                    return res.json({ message: 'Algo deu errado' })
                }
            }

            // Loop para deconstar o saldo alocado
            try {
                codigoFilho.forEach((element: string) => {
                    const updateQuery: string = `UPDATE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumberDecrypted}' AND CODIGO_FILHO = '${element}' `
                    updateQtyQuery2.push(updateQuery)
                });
                await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected)

                // for (const [i] of quantidade.length.entries()) {
                // }
            } catch (error) {
                console.log("linha 185 /selectHasP/", error);
                return res.json({ message: 'Algo deu errado' })
            }
        } catch (err) {
            console.log("linha 175  -Point.ts-", err);
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' })
        }
    }

    try {
        // Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
        try {
            if (valorTotalApontado < qtdLibMax) {
                const updateNextProcess = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${nextOperationProcess}' AND CODIGO_MAQUINA = '${nextMachineProcess}'`
                await update(updateNextProcess)
            }
        } catch (error) {
            console.log('linha 198 - error - //point.ts', error);
            return res.json({ message: 'Algo deu errado' })
        }

        // Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
        if (valorTotalApontado === quantidadePossivelProduzir) {
            try {
                const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`
                await update(updateQtdpointed)
            } catch (error) {
                if (error) {
                    console.log('cadeeeeeee');
                }
                console.log('linha 212 - error - //point.ts', error);
                return res.json({ message: 'Algo deu errado' })
            }
        }


        // Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
        try {
            const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`
            await update(updateCol)
        } catch (error) {
            console.log("linha 209 - error - /point.ts/", error);
            return res.json({ message: 'Algo deu errado' })
        }

        // Insere codigo de apontamento 4 final de producao
        try {
            console.log("linha 215 /point.ts/ Inserindo dados de apontamento...");
            const codAponta = 4
            const descricaoCodigoAponta = 'Fin Prod'
            await insertInto(employee, odfNumberDecrypted, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer)
        } catch (error) {
            console.log("erro ao fazer insert linha 220 /point.ts/", error);
            return res.json({ message: 'Algo deu errado' })
        }

        qtdBoas = encrypted(String(qtdBoas))
        res.cookie('qtdBoas', qtdBoas)

        console.log("linha 227 - chegou ao fim /point.ts/", qtdBoas);

        return res.json({ message: 'Sucesso ao apontar' })
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Erro ao apontar' })
    } finally {
        await connection.close()
    }
}