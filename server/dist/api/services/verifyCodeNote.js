"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeNote = void 0;
const query_1 = require("./query");
const message_1 = require("./message");
const verifyCodeNote = async (values, acceptableStrings) => {
    const codes = {
        0: 'Error',
        1: 'Pointed Iniciated',
        2: 'Fin Setup',
        3: 'Ini Prod',
        4: 'Pointed',
        5: 'Rip iniciated',
        6: 'Begin new process',
        7: 'Machine has stopped',
        8: 'A value was returned',
        9: 'First time acessing ODF',
    };
    const response = {
        employee: '',
        code: '',
        time: 0,
        accepted: (0, message_1.message)(33),
    };
    let resultCodes = await (0, query_1.selectQuery)(23, values);
    if (resultCodes.data.length > 0) {
        response.time = resultCodes.data[0].DATAHORA;
        response.employee = values.FUNCIONARIO;
        if (values.FUNCIONARIO !== resultCodes.data[0].USUARIO && resultCodes.data[0].CODAPONTA === 4) {
            response.employee = resultCodes.data[0].USUARIO;
        }
        response.code = codes[String(resultCodes.data[0].CODAPONTA)];
        acceptableStrings?.forEach(acc => {
            if (Number(resultCodes.data[0].CODAPONTA) === acc) {
                response.accepted = (0, message_1.message)(1);
            }
        });
        return response;
    }
    else {
        response.code = codes[6];
        response.accepted = (0, message_1.message)(1);
        return response;
    }
};
exports.verifyCodeNote = verifyCodeNote;
//# sourceMappingURL=verifyCodeNote.js.map