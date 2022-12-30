"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const historic = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))).replaceAll(' ', '')) || null;
        var codeMachine = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY DATAHORA DESC`;
        var lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY OP ASC`;
        var obj = [];
    }
    catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: '' });
    }
    try {
        const codePointed = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (codePointed.message === 'Ini Prod' || codePointed.message === 'Pointed' || codePointed.message === 'Rip iniciated' || codePointed.message === 'Machine has stopped') {
            const detailHistoric = await (0, select_1.select)(lookForDetail);
            if (!detailHistoric) {
                return res.json({ message: '' });
            }
            for (const iterator of detailHistoric) {
                if (iterator.BOAS > 0) {
                    obj.push(iterator);
                }
                if (iterator.REFUGO > 0) {
                    obj.push(iterator);
                }
            }
            detailHistoric.reduce((acc, iterator) => {
                return acc + iterator.BOAS + iterator.REFUGO;
            }, 0);
            try {
                const generalHistoric = await (0, select_1.select)(lookforGeneric);
                if (!generalHistoric) {
                    return res.json({ message: '' });
                }
                else {
                    let objRes = {
                        resourceDetail: generalHistoric,
                        resource: obj,
                        message: 'Exibir histórico'
                    };
                    return res.json(objRes);
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: '' });
            }
        }
        else {
            return res.json({ message: codePointed });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: '' });
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map