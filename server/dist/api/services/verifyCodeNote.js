"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeNote = void 0;
const message_1 = require("./message");
const select_1 = require("./select");
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
        message: '',
        time: 0,
        accepted: (0, message_1.message)(33),
    };
    let resultCodes = await (0, select_1.select)(23, values);
    console.log('resultCodes', resultCodes);
    if (resultCodes === (0, message_1.message)(0)) {
        return resultCodes = (0, message_1.message)(0);
    }
    if (!resultCodes) {
        response.code = codes[6];
        response.message = (0, message_1.message)(0);
        response.accepted = (0, message_1.message)(1);
        return response;
    }
    if (resultCodes.length > 0) {
        response.time = resultCodes[0].DATAHORA;
        response.employee = values.FUNCIONARIO;
        if (values.FUNCIONARIO !== resultCodes[0].USUARIO && resultCodes[0].CODAPONTA === 4) {
            response.employee = resultCodes[0].USUARIO;
        }
        Object.entries(codes).forEach(element => {
            if (Number(element[0]) === resultCodes[0].CODAPONTA) {
                response.code = element[1];
            }
        });
        acceptableStrings?.forEach(acc => {
            if (Number(resultCodes[0].CODAPONTA) === acc) {
                response.accepted = (0, message_1.message)(1);
            }
        });
        return response;
    }
    else {
        response.accepted = (0, message_1.message)(33);
        return response;
    }
};
exports.verifyCodeNote = verifyCodeNote;
//# sourceMappingURL=verifyCodeNote.js.map