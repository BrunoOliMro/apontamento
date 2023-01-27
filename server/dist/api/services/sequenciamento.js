"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequenciamentoView = void 0;
const message_1 = require("./message");
const query_1 = require("./query");
const sequenciamentoView = async (variables) => {
    const data = await (0, query_1.selectQuery)(32, variables);
    console.log('variablessss', variables);
    console.log('data', data.data[0].CODIGO_MAQUINA);
    variables.CODIGO_MAQUINA;
    if (variables.CODIGO_MAQUINA !== data.data[0].CODIGO_MAQUINA) {
        return { data, message: (0, message_1.message)(33), machine: data.data[0].CODIGO_MAQUINA };
    }
    else {
        return { data, message: (0, message_1.message)(1) };
    }
};
exports.sequenciamentoView = sequenciamentoView;
//# sourceMappingURL=sequenciamento.js.map