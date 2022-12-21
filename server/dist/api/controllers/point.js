"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const insertNewOrder_1 = require("../services/insertNewOrder");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const codeNote_1 = require("../utils/codeNote");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const sendEmail_1 = require("../utils/sendEmail");
const point = async (req, res) => {
    try {
        var goodFeed = Number((0, sanitize_1.sanitize)(req.body['valorFeed'])) || null;
        var supervisor = String((0, sanitize_1.sanitize)(req.body['supervisor'])) || null;
        var motives = String((0, sanitize_1.sanitize)(req.body['value'])) || null;
        var badFeed = Number((0, sanitize_1.sanitize)(req.body['badFeed'])) || null;
        var missingFeed = Number((0, sanitize_1.sanitize)(req.body['missingFeed'])) || null;
        var reworkFeed = Number((0, sanitize_1.sanitize)(req.body['reworkFeed'])) || null;
        var condic;
        if (!req.cookies['condic']) {
            condic = null;
        }
        else {
            condic = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['condic'])))) || null;
        }
        var odfNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var updateSaldoReal = [];
        var deleteCstAlocacao = [];
        var decodedOdfNumber = Number((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedOdfNumber'])));
        var decodedOperationNumber = Number((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedOperationNuber'])));
        var decodedMachineCode = String((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedMachineCode'])));
        var childCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['codigoFilho']))).split(',') || null;
        var valorTotalApontado = Number(goodFeed) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed);
        var released = maxQuantityReleased - valorTotalApontado;
        var faltante = maxQuantityReleased - valorTotalApontado;
        var startProd = Number((0, decryptedOdf_1.decrypted)(String(req.cookies['startProd']))) || null;
        var finalProdTimer = Number(new Date().getTime() - startProd / 1000) || null;
        var execut = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['execut']))) || null;
        var diferenceBetween = execut * maxQuantityReleased - valorTotalApontado * execut;
        res.cookie('startRip', Number(new Date().getTime()));
        res.cookie('qtdBoas', (0, encryptOdf_1.encrypted)(String(goodFeed)));
        var pointCode = [4];
        var pointCodeDescriptionFinProd = 'Fin Prod';
        var lookForOdfData = `SELECT TOP 1 CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS, APONTAMENTO_LIBERADO FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND NUMERO_OPERACAO = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}' AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
        var stringFromHisaponta = `SELECT TOP 1 USUARIO FROM HISAPONTA WHERE 1 = 1 AND ODF = '${odfNumber}'  ORDER BY DATAHORA DESC`;
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        var updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${valorTotalApontado}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${badFeed}, QTDE_LIB = ${released}, QTD_FALTANTE = ${faltante}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${goodFeed}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${reworkFeed} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`;
        var valuesFromHisaponta = await (0, select_1.select)(stringFromHisaponta);
        var valuesFromBack = await (0, select_1.select)(lookForOdfData);
    }
    catch (error) {
        console.log('Error on point.ts --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    var response = {
        message: '',
        balance: 0,
    };
    try {
        var pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (!valorTotalApontado || decodedOdfNumber !== odfNumber || decodedOperationNumber !== operationNumber || decodedMachineCode !== machineCode || !machineCode || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000' || !operationNumber || !partCode || partCode === '0' || partCode === '00' || partCode === '000' || partCode === '0000' || partCode === '00000' || !odfNumber || !employee || employee === '0' || employee === '00' || employee === '000' || employee === '0000' || employee === '00000' || employee === '000000') {
            return res.json({ message: 'Algo deu errado' });
        }
        else if (pointedCode.message !== 'Ini Prod') {
            return res.json({ message: pointedCode.message });
        }
        else if (!supervisor && valorTotalApontado === maxQuantityReleased) {
            if (badFeed > 0) {
                return res.json({ message: 'Supervisor inválido' });
            }
            else {
                supervisor = '004067';
            }
        }
        else if (!maxQuantityReleased || goodFeed > maxQuantityReleased || valorTotalApontado > maxQuantityReleased || badFeed > maxQuantityReleased || missingFeed > maxQuantityReleased || reworkFeed > maxQuantityReleased) {
            response.balance = maxQuantityReleased;
            return res.json({ message: 'Quantidade apontada excede o limite' });
        }
        else if (!missingFeed) {
            faltante = maxQuantityReleased - valorTotalApontado;
        }
        else if (badFeed > 0) {
            if (!motives) {
                return res.json({ message: 'Algo deu errado' });
            }
            const findSupervisor = await (0, select_1.select)(lookForSupervisor);
            if (!findSupervisor) {
                return res.json({ message: 'Supervisor não encontrado' });
            }
        }
        else if (missingFeed > 0) {
            faltante = missingFeed;
        }
    }
    catch (error) {
        console.log('linha 100 - Error on Point.ts -', error);
        return res.json({ message: 'Algo deu errado' });
    }
    if (employee !== valuesFromHisaponta[0].USUARIO) {
        let arrayDeCodAponta = [4, 5, 6];
        let goodEnd = null;
        let badEnd = null;
        let missingEnd = null;
        let reworkEnd = null;
        try {
            const resultEndingProcess = await (0, insert_1.insertInto)(valuesFromHisaponta[0].USUARIO, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodEnd, badEnd, arrayDeCodAponta, pointCodeDescriptionFinProd, motives, missingEnd, reworkEnd, finalProdTimer);
            if (resultEndingProcess === 'Success') {
                let codeArray = [1, 2, 3];
                const resultNewProcess = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodEnd, badEnd, codeArray, pointCodeDescriptionFinProd, motives, missingEnd, reworkEnd, finalProdTimer);
                if (resultNewProcess !== 'Success') {
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        catch (error) {
            console.log('Error on point.ts --inserting diferent users --', error);
        }
    }
    if (condic === 'P') {
        try {
            if (!childCode) {
                return res.json({ message: 'Algo deu errado' });
            }
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            if (valorTotalApontado < maxQuantityReleased) {
                try {
                    childCode.forEach((codigoFilho) => {
                        const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`;
                        updateSaldoReal.push(stringUpdate);
                    });
                    await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected);
                }
                catch (error) {
                    console.log('linha 140  - Point.ts - ', error);
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            try {
                childCode.forEach((codigoFilho) => {
                    const stringUpdate = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${codigoFilho}'`;
                    deleteCstAlocacao.push(stringUpdate);
                });
                await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log('linha 159  - Point.ts - ', error);
                return res.json({ message: 'Algo deu errado' });
            }
            finally {
                await connection.close();
            }
        }
        catch (error) {
            console.log('linha 165  - Point.ts - ', error);
            return res.json({ message: 'Algo deu errado' });
        }
    }
    try {
        if (reworkFeed > 0 || missingFeed > 0) {
            const newOrderString = `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE) VALUES('${odfNumber}', '${operationNumber}', '${machineCode}', ${valuesFromBack[0].QTDE_ODF}, ${released},${valorTotalApontado}, ${badFeed}, ${goodFeed},  ${reworkFeed}, ${faltante}, '${partCode}', '${valuesFromBack[0].CODIGO_CLIENTE}')`;
            await (0, sendEmail_1.createNewOrder)(odfNumber, operationNumber, machineCode, reworkFeed, missingFeed, goodFeed, badFeed, valorTotalApontado, valuesFromBack[0].QTDE_ODF, valuesFromBack[0].CODIGO_CLIENTE, partCode);
            await (0, insertNewOrder_1.insertIntoNewOrder)(newOrderString);
        }
    }
    catch (error) {
        console.log('Error on Point.ts -', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        await (0, update_1.update)(updateCol);
        await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionFinProd, motives, faltante, reworkFeed, finalProdTimer);
        return res.json({ message: 'Success' });
    }
    catch (error) {
        console.log('linha 194 - error - /point.ts/', error);
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map