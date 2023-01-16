"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripPost = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const clearCookie_1 = require("../utils/clearCookie");
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const sanitize_1 = require("../utils/sanitize");
const update_1 = require("../services/update");
const mssql_1 = __importDefault(require("mssql"));
const ripPost = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables.cookies) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(47), data: (0, message_1.message)(47), code: (0, message_1.message)(33) });
    }
    var keySan;
    var valueSan;
    var updateQtyQuery = [];
    var objectSanitized = {};
    const pointCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [5]);
    console.log('pointCode', pointCode);
    var oldTimer = new Date(pointCode.time).getTime();
    var timeSpendRip = Number(new Date().getTime() - oldTimer) || null;
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.pointedCode = [6];
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.pointedCodeDescription = ['Rip Fin.'];
    variables.cookies.motives = null;
    variables.cookies.tempoDecorrido = timeSpendRip;
    if (!pointCode.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33), code: pointCode.code });
    }
    if (Object.keys(variables.body).length <= 0) {
        console.log('insert into 6');
        const insertedRipCode = await (0, insert_1.insertInto)(variables.cookies);
        if (insertedRipCode) {
            const pointCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [6]);
            const updatePcpProgResult = await (0, update_1.update)(0, variables.cookies);
            if (updatePcpProgResult === (0, message_1.message)(1)) {
                await (0, clearCookie_1.cookieCleaner)(res);
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: pointCode.code });
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33), code: pointCode.code });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0), code: pointCode.code });
        }
    }
    else {
        for (const [key, value] of Object.entries(variables.body.values)) {
            keySan = (0, sanitize_1.sanitize)(key);
            valueSan = (0, sanitize_1.sanitize)(value);
            objectSanitized[keySan] = valueSan;
        }
    }
    try {
        console.log('insert into 6');
        const insertedRipCode = await (0, insert_1.insertInto)(variables.cookies);
        console.log('insertedRipCode', insertedRipCode);
        if (!insertedRipCode) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33) });
        }
        else if (insertedRipCode) {
            try {
                const resultUpdatePcpProg = await (0, update_1.update)(0, variables.cookies);
                if (resultUpdatePcpProg !== (0, message_1.message)(1)) {
                    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33), code: pointCode.code });
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
                            if (resultSplitLines[row].SETUP === 'ok' && variables.cookies.lie.split(',')[i] === null && variables.cookies.lse.split(',')[i] === null) {
                                resultSplitLines[row] = 0;
                            }
                            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, FUNCIONARIO, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                                VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.FUNCIONARIO}'  ,'1', '${variables.cookies.REVISAO}' , '${variables.cookies.numCar[i] || null}', '${variables.cookies.description.split(',')[i] || null}',  '${variables.cookies.specification[i] || null}',${variables.cookies.lie.split(',')[i] || null}, ${variables.cookies.lse.split(',')[i] || null},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${variables.cookies.instruments.split(',')[i] || null}','${variables.cookies.CODIGO_MAQUINA}','${variables.cookies.NUMERO_OPERACAO.replaceAll(' ', (0, message_1.message)(33))}')`);
                        });
                        try {
                            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
                            await connection.query(updateQtyQuery.join('\n'));
                            console.log('cade o update');
                            await (0, clearCookie_1.cookieCleaner)(res);
                            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(1), code: pointCode.code });
                        }
                        catch (error) {
                            console.log('error - linha 103 /ripPost.ts/ - ', error);
                            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
                        }
                    }
                    catch (error) {
                        console.log('linha 110 /ripPost/', error);
                        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
                    }
                }
            }
            catch (error) {
                console.log('error linha 115', error);
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
    catch (error) {
        console.log('linha 126 - ripPost -', error);
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map