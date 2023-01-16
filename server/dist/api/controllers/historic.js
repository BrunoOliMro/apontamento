"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const historic = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const obj = [];
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (resultVerifyCodeNote.accepted) {
        const detailHistoric = await (0, query_1.selectQuery)('Select', 5, variables.cookies);
        const generalHistoric = await (0, query_1.selectQuery)('Select', 6, variables.cookies);
        for (const iterator of detailHistoric.data) {
            if (iterator.BOAS > 0) {
                obj.push(iterator);
            }
            if (iterator.REFUGO > 0) {
                obj.push(iterator);
            }
        }
        detailHistoric.data.reduce((acc, iterator) => {
            return acc + iterator.BOAS + iterator.REFUGO;
        }, 0);
        let objRes = {
            resourceDetail: generalHistoric,
            resource: obj,
            message: (0, message_1.message)(34)
        };
        console.log('letRes', objRes);
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: objRes });
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map