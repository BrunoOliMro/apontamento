"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const pictures_1 = require("../pictures");
const statusImage = async (req, res) => {
    let t0 = performance.now();
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const statuString = String('_status');
    const valuesResult = [];
    if (!variables.cookies) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (resultVerifyCodeNote.accepted) {
        const lookOnProcess = await (0, query_1.selectQuery)(26, variables.cookies);
        if (lookOnProcess) {
            for await (const [i, record] of lookOnProcess.entries()) {
                const rec = await record;
                const path = await pictures_1.pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], statuString, String(i));
                valuesResult.push(path);
            }
            var t1 = performance.now();
            console.log('SIMAGE: ', t1 - t0);
            if (valuesResult) {
                return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: valuesResult });
            }
            else {
                return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(17), data: (0, message_1.message)(33) });
        }
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map