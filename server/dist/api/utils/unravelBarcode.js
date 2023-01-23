"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unravelBarcode = void 0;
const message_1 = require("../services/message");
function unravelBarcode(obj) {
    let response = {
        message: '',
        data: {
            NUMERO_ODF: '',
            NUMERO_OPERACAO: '',
            CODIGO_MAQUINA: '',
            FUNCIONARIO: '',
            QTDE_LIB: 0,
            CODIGO_PECA: '',
        },
    };
    if (!obj || obj.length <= 16 || obj.length > 18) {
        return response.message = '';
    }
    const dados = {
        numOdf: String(obj.slice(10)),
        numOper: String(obj.slice(0, 5)),
        codMaq: String(obj.slice(5, 10)),
    };
    if (obj.length > 17) {
        dados.numOdf = obj.slice(11);
        dados.numOper = obj.slice(0, 5);
        dados.codMaq = obj.slice(5, 11);
    }
    response.message = (0, message_1.message)(1);
    response.data.NUMERO_ODF = dados.numOdf;
    response.data.NUMERO_OPERACAO = dados.numOper;
    response.data.CODIGO_MAQUINA = dados.codMaq;
    return response;
}
exports.unravelBarcode = unravelBarcode;
//# sourceMappingURL=unravelBarcode.js.map