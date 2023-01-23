"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const pictures_1 = require("../pictures");
const query_1 = require("../services/query");
const tools = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const toolString = String("_ferr");
    const result = [];
    var toolsImg;
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.pointedCode = [1];
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.pointedCodeDescription = ['Ini Setup.'];
    variables.cookies.motives = null;
    variables.cookies.tempoDecorrido = null;
    const codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [6, 8, 9]);
    if (codeNoteResult.code === (0, message_1.message)(38)) {
        toolsImg = await (0, query_1.selectQuery)(20, variables.cookies);
        if (!toolsImg.data) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(16), data: (0, message_1.message)(33) });
        }
        else if (toolsImg.data) {
            for await (const [i, record] of toolsImg.data.entries()) {
                const rec = await record;
                const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                result.push(path);
            }
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: result || (0, message_1.message)(33) });
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(16) });
        }
    }
    if (codeNoteResult.accepted || codeNoteResult.code === (0, message_1.message)(17)) {
        const inserted = await (0, insert_1.insertInto)(variables.cookies);
        if (inserted === (0, message_1.message)(1)) {
            toolsImg = await (0, query_1.selectQuery)(20, variables.cookies);
            if (!toolsImg.data) {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(16), data: (0, message_1.message)(33) });
            }
            else if (toolsImg.data) {
                for await (const [i, record] of toolsImg.data.entries()) {
                    const rec = await record;
                    const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                    result.push(path);
                }
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: result });
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(16) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(45), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.motives = null;
    const codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [1]);
    const startSetupTime = new Date(codeNoteResult.time).getTime();
    const timeSpend = Number(new Date().getTime() - startSetupTime) || null;
    variables.cookies.tempoDecorrido = timeSpend;
    if (codeNoteResult.accepted) {
        variables.cookies.pointedCodeDescription = ['Fin Setup'];
        variables.cookies.pointedCode = [2];
        const codApontamentoFinalSetup = await (0, insert_1.insertInto)(variables.cookies);
        if (codApontamentoFinalSetup !== (0, message_1.message)(0)) {
            variables.cookies.pointedCode = [3];
            variables.cookies.pointedCodeDescription = ['Ini Prod.'];
            const codApontamentoInicioSetup = await (0, insert_1.insertInto)(variables.cookies);
            if (codApontamentoInicioSetup !== (0, message_1.message)(0)) {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
        }
    }
    else {
        const codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [2]);
        if (codeNoteResult.accepted) {
            variables.cookies.pointedCodeDescription = ['Ini Prod.'];
            variables.cookies.pointedCode = [3];
            const codApontamentoInicioSetup = await (0, insert_1.insertInto)(variables.cookies);
            if (codApontamentoInicioSetup) {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code || (0, message_1.message)(33) });
        }
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map