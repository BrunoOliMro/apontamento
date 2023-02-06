"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const odfIndex_1 = require("../utils/odfIndex");
const odfData = async (req, res) => {
    var t0 = performance.now();
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const response = {
        odfSelecionada: '',
    };
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (resultVerifyCodeNote.accepted) {
        const resultQuery = await (0, query_1.selectQuery)(24, variables.cookies);
        if (!resultQuery) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0), code: resultVerifyCodeNote.code });
        }
        const i = await (0, odfIndex_1.odfIndex)(resultQuery, '00' + variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '0'));
        if (i === null || i === undefined) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0), code: resultVerifyCodeNote.code });
        }
        response.odfSelecionada = resultQuery[i];
        response.odfSelecionada.FUNCIONARIO = variables.cookies.FUNCIONARIO;
        var t1 = performance.now();
        console.log("Call ODFDATA.TS took: ", t1 - t0);
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: response.odfSelecionada, code: resultVerifyCodeNote.code });
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code });
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map