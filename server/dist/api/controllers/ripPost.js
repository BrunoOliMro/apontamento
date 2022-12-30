"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const update_1 = require("../services/update");
const clearCookie_1 = require("../utils/clearCookie");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const ripPost = async (req, res) => {
    try {
        console.log('req.body', req.body);
        var setup = (req.body['values']) || null;
        var keySan;
        var valueSan;
        var odfNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
        var operationNumber = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
        var updateQtyQuery = [];
        var specification = (req.cookies['especif']) || null;
        var numCar = (req.cookies['numCar']) || null;
        var lie = (req.cookies['lie']) || null;
        var lse = (req.cookies['lse']) || null;
        var instruments = (req.cookies['instrumento']) || null;
        var description = [(req.cookies['descricao'])] || null;
        var objectSanitized = {};
        var goodFeed = null;
        var badFeed = null;
        var pointCode = [6];
        var pointCodeDescriptionRipEnded = ['Rip Fin.'];
        var motives = null;
        var missingFeed = null;
        var reworkFeed = null;
        var stringUpdatePcp = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`;
    }
    catch (error) {
        console.log('Error on Rip Post ', error);
        return res.json({ message: '' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, Number(operationNumber), machineCode, employee);
        var oldTimer = new Date(pointedCode.time).getTime();
        var tempoDecorridoRip = Number(new Date().getTime() - oldTimer) || null;
        if (pointedCode.message !== 'Rip iniciated') {
            return res.json({ message: pointedCode });
        }
    }
    catch (error) {
        console.log('Error on Rip Post ', error);
        return res.json({ message: '' });
    }
    if (Object.keys(setup).length <= 0) {
        const insertedRipCode = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber.replaceAll(' ', ''), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionRipEnded, motives, missingFeed, reworkFeed, tempoDecorridoRip);
        if (insertedRipCode) {
            const updatePcpProgResult = await (0, update_1.update)(stringUpdatePcp);
            if (updatePcpProgResult === 'Success') {
                await (0, clearCookie_1.cookieCleaner)(res);
                return res.json({ message: 'Success' });
            }
            else {
                return res.json({ message: '' });
            }
        }
        else {
            return res.json({ message: '' });
        }
    }
    else {
        for (const [key, value] of Object.entries(setup)) {
            keySan = (0, sanitize_1.sanitize)(key);
            valueSan = (0, sanitize_1.sanitize)(value);
            objectSanitized[keySan] = valueSan;
        }
    }
    try {
        const insertedRipCode = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber.replaceAll(' ', ''), machineCode, maxQuantityReleased, goodFeed, badFeed, pointCode, pointCodeDescriptionRipEnded, motives, missingFeed, reworkFeed, tempoDecorridoRip);
        if (!insertedRipCode) {
            return res.json({ message: '' });
        }
        else if (insertedRipCode) {
            try {
                const resultUpdatePcpProg = await (0, update_1.update)(stringUpdatePcp);
                if (resultUpdatePcpProg !== 'Success') {
                    return res.json({ message: '' });
                }
                else {
                    const resultSplitLines = Object.keys(objectSanitized).reduce((acc, iterator) => {
                        const [col, lin] = iterator.split('-');
                        if (acc[lin] === undefined)
                            acc[lin] = {};
                        acc[lin][col] = objectSanitized[iterator];
                        return acc;
                    }, {});
                    try {
                        Object.entries(resultSplitLines).forEach(([row], i) => {
                            if (resultSplitLines[row].SETUP === 'ok' && lie[i] === null && lse[i] === null) {
                                resultSplitLines[row] = 0;
                            }
                            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, FUNCIONARIO, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                                VALUES('${odfNumber}', '${employee}'  ,'1', '${revision}' , '${numCar[i]}', '${description[i]}',  '${specification[i]}',${lie[i]}, ${lse[i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instruments[i]}','${machineCode}','${operationNumber.replaceAll(' ', '')}')`);
                        });
                        try {
                            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
                            await connection.query(updateQtyQuery.join('\n'));
                        }
                        catch (error) {
                            console.log('error - linha 103 /ripPost.ts/ - ', error);
                            return res.json({ message: '' });
                        }
                        await (0, clearCookie_1.cookieCleaner)(res);
                        return res.json({ message: 'Success' });
                    }
                    catch (error) {
                        console.log('linha 110 /ripPost/', error);
                        return res.json({ message: '' });
                    }
                }
            }
            catch (error) {
                console.log('error linha 115', error);
                return res.json({ message: '' });
            }
        }
        else {
            return res.json({ message: '' });
        }
    }
    catch (error) {
        console.log('linha 126 - ripPost -', error);
        return res.json({ message: '' });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map