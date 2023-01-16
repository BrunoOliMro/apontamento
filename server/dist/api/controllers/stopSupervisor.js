"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const select_1 = require("../services/select");
const stopSupervisor = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [7]);
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.pointedCode = [3];
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.pointedCodeDescription = [`Ini Prod.`];
    variables.cookies.motives = null;
    variables.cookies.tempoDecorrido = null;
    if (resultVerifyCodeNote.accepted) {
        const resource = await (0, select_1.select)(10, variables.body.superMaqPar);
        if (resource) {
            const insertPointCode = await (0, insert_1.insertInto)(variables.cookies);
            if (insertPointCode) {
                return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33) });
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(21), data: (0, message_1.message)(33) });
            }
        }
        else if (!resource) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(21), data: (0, message_1.message)(33) });
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(21), data: (0, message_1.message)(33) });
        }
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map