"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawing = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const pictures_1 = require("../pictures");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const drawing = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    variables.cookies.drawingString = String('_drawing');
    const valuesResult = [];
    if (!variables) {
        return res.status(400).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerify = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (resultVerify.accepted) {
        const result = await (0, query_1.selectQuery)('Select', 19, variables.cookies);
        for await (const [i, record] of result.data.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], variables.drawingString, String(i));
            valuesResult.push(path);
        }
        return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: valuesResult });
    }
    else {
        return res.status(400).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.drawing = drawing;
//# sourceMappingURL=drawing.js.map