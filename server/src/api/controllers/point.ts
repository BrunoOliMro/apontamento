import { RequestHandler } from "express";
import { Result } from "express-validator";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { insertIntoNewOrder } from "../services/insertNewOrder";
import { select } from "../services/select";
import { update } from "../services/update";
import { codeNote } from "../utils/codeNote";
import { decodedBuffer } from "../utils/decodeOdf";
//import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
//import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";
import { createNewOrder } from "../utils/sendEmail";

export const point: RequestHandler = async (req, res) => {
    try {
        var qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
        var supervisor: string | null = sanitize(req.body["supervisor"]) || null
        var motivorefugo: string | null = sanitize(req.body["value"]) || null
        var badFeed = Number(sanitize(req.body["badFeed"])) || 0;
        var missingFeed = Number(sanitize(req.body["missingFeed"])) || 0;
        var reworkFeed = Number(sanitize(req.body["reworkFeed"])) || 0;
        var condic: string | null;
        if (!req.cookies['condic']) {
            condic = null
        } else {
            condic = decrypted(String(sanitize(req.cookies['condic']))) || null
        }
        var odfNumber: number | null = Number(decrypted(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var operationNumber = Number(decrypted(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
        var codigoPeca = String(decrypted(sanitize(req.cookies['CODIGO_PECA']))) || null
        var machineCode = String(decrypted(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
        var qtdLibMax: number | null = Number(decrypted(sanitize(req.cookies['QTDE_LIB']))) || null
        var employee = decrypted(sanitize(req.cookies['FUNCIONARIO'])) || null
        var revisao = decrypted(sanitize(req.cookies['REVISAO'])) || null
        var updateSaldoReal: string[] = [];
        var deleteCstAlocacao: string[] = [];
        var decodedOdfNumber = Number(decodedBuffer(String(req.cookies['encodedOdfNumber'])))
        var decodedOperationNumber = Number(decodedBuffer(String(req.cookies['encodedOperationNuber'])))
        var decodedMachineCode = String(decodedBuffer(String(req.cookies['encodedMachineCode'])))
        var codigoFilho: string[] = decrypted(String(sanitize(req.cookies['codigoFilho']))).split(",") || null // VER DEPOIS !!!!!!!!!!!!!!
        var lookForOdfData = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
        var valuesFromBack = await select(lookForOdfData)
        var stringFromHisaponta = `SELECT TOP 1 USUARIO FROM HISAPONTA WHERE 1 = 1 AND ODF = '${odfNumber}'  ORDER BY DATAHORA DESC`
        var valuesFromHisaponta = await select(stringFromHisaponta)
        var valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed))
        var lib = qtdLibMax! - valorTotalApontado
        var faltante = qtdLibMax! - valorTotalApontado
        var finalProdTimer = Number(new Date().getTime() - Number(decrypted(String(req.cookies['startProd']))) / 1000) || 0
        var execut = Number(decrypted(sanitize(req.cookies['execut'])))
        var diferenceBetween = execut * qtdLibMax! - valorTotalApontado * execut
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`
        res.cookie('qtdBoas', encrypted(String(qtdBoas)))
        //Inicia tempo de Rip
        res.cookie("startRip", Number(new Date().getTime()))
        var updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${valorTotalApontado}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${badFeed}, QTDE_LIB = ${lib}, QTD_FALTANTE = ${faltante}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${qtdBoas}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${reworkFeed} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`
        var codAponta = [4]
        var descricaoCodigoAponta = 'Fin Prod'
    } catch (error) {
        console.log('Error on point.ts --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    var response: any = {
        message: '',
        balance: 0,
    }

    try {
        var pointCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (!valorTotalApontado || decodedOdfNumber !== odfNumber || decodedOperationNumber !== operationNumber || decodedMachineCode !== machineCode || !machineCode || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000' || !operationNumber || !codigoPeca || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000' || !odfNumber || !employee || employee === '0' || employee === '00' || employee === '000' || employee === '0000' || employee === '00000' || employee === '000000') {
            return res.json({ message: 'Algo deu errado' })
        }
        else if (pointCode.message !== 'Ini Prod') {
            return res.json({ message: pointCode.message })
        }
        // else if (pointCode.funcionario !== employee) {
        //     return res.json({ message: 'Funcionário diferente' })
        // } 
        else if (!supervisor && valorTotalApontado === qtdLibMax) {
            if (badFeed! > 0) {
                return res.json({ message: 'Supervisor inválido' })
            } else {
                supervisor = '004067'
            }
        } else if (!qtdLibMax || qtdBoas! > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed! > qtdLibMax || missingFeed! > qtdLibMax || reworkFeed! > qtdLibMax) {
            response.balance = qtdLibMax;
            return res.json({ message: 'Quantidade apontada excede o limite' })
        } else if (!missingFeed) {
            faltante = qtdLibMax - valorTotalApontado
        } else if (badFeed! > 0) {
            // Se houver refugo, verifica se o supervisor esta correto
            if (!motivorefugo) {
                return res.json({ message: 'Algo deu errado' })
            }
            const findSupervisor = await select(lookForSupervisor)
            if (!findSupervisor) {
                return res.json({ message: 'Supervisor não encontrado' })
            }
        } else if (missingFeed > 0) {
            faltante = missingFeed
        }
    } catch (error) {
        console.log('linha 100 - Error on Point.ts -', error);
        return res.json({ message: 'Algo deu errado' })
    }

    // Verificar os usuarios
    if (employee !== valuesFromBack[0].USUARIO) {
        let arrayDeCodAponta = [4, 5, 6];
        let boasEnd = null;
        let badEnd = null;
        let missingEnd = null;
        let reworkEnd = null;
        // Insere os codigos faltantes no processo com o usuario antigo
        console.log('valuesFromHisaponta[0].USUARIO', valuesFromHisaponta);
        const x = await insertInto(valuesFromHisaponta[0].USUARIO, odfNumber, codigoPeca, revisao, String(operationNumber), machineCode, qtdLibMax, boasEnd, badEnd, arrayDeCodAponta, descricaoCodigoAponta, motivorefugo, missingEnd, reworkEnd, finalProdTimer)

        if (x) {
            // Insere o codigo do novo usuario
            let codeArray = [1, 2, 3]
            await insertInto(employee, odfNumber, codigoPeca, revisao, String(operationNumber), machineCode, qtdLibMax, boasEnd, badEnd, codeArray, descricaoCodigoAponta, motivorefugo, missingEnd, reworkEnd, finalProdTimer)
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    }

    // Caso haja "P" faz update na quantidade de peças dos filhos
    if (condic === 'P') {
        try {
            if (!codigoFilho) {
                return res.json({ message: 'Algo deu errado' })
            }
            // Loop para atualizar o estoque
            const connection = await mssql.connect(sqlConfig);
            if (valorTotalApontado < qtdLibMax!) {
                try {
                    codigoFilho.forEach((codigoFilho: string) => {
                        const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`
                        updateSaldoReal.push(stringUpdate)
                    });
                    await connection.query(updateSaldoReal.join("\n")).then(result => result.rowsAffected)
                } catch (error) {
                    console.log("linha 140  - Point.ts - ", error);
                    return res.json({ message: 'Algo deu errado' })
                }
            }
            try {
                // Loop para desconstar o saldo alocado
                codigoFilho.forEach((codigoFilho: string) => {
                    const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${codigoFilho}'`
                    deleteCstAlocacao.push(stringUpdate)
                });
                await connection.query(deleteCstAlocacao.join("\n")).then(result => result.rowsAffected)
            } catch (error) {
                console.log("linha 132  - Point.ts - ", error);
                return res.json({ message: 'Algo deu errado' })
            } finally {
                await connection.close()
            }
        } catch (error) {
            console.log("linha 158  - Point.ts - ", error);
            return res.json({ message: 'Algo deu errado' })
        }
    }

    // Caso tenha retrabalhas apontados ou faltantes, faz insert em NOVA_ORDEM
    try {
        if (reworkFeed > 0 || missingFeed > 0) {
            const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE) VALUES('${odfNumber}', '${operationNumber}', '${machineCode}', ${valuesFromBack[0].QTDE_ODF}, ${lib},${valorTotalApontado}, ${badFeed}, ${qtdBoas},  ${reworkFeed}, ${faltante}, '${codigoPeca}', '${valuesFromBack[0].CODIGO_CLIENTE}')`
            await createNewOrder(odfNumber, operationNumber, machineCode, reworkFeed, missingFeed, qtdBoas, badFeed, valorTotalApontado, valuesFromBack[0].QTDE_ODF, valuesFromBack[0].CODIGO_CLIENTE, codigoPeca)
            await insertIntoNewOrder(newOrderString)
        }
    } catch (error) {
        console.log('Error on Point.ts -', error);
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        // Update quantidade apontada, quantidade de refugo, quantidade liberada, quantidade faltante, quantidade de boas, quantidades de retrabalhadas.
        // Insere codigo de apontamento 4 final de producao
        await update(updateCol)
        await insertInto(employee, odfNumber, codigoPeca, revisao, String(operationNumber), machineCode, qtdLibMax, qtdBoas!, badFeed!, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed!, finalProdTimer)
        return res.json({ message: 'Sucesso ao apontar' })
    } catch (error) {
        console.log("linha 164 - error - /point.ts/", error);
        return res.json({ message: 'Algo deu errado' })
    }
}