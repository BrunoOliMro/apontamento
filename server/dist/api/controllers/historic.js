"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const historic = async (req, res) => {
    try {
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
        var codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    }
    catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' });
    }
    const lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY DATAHORA DESC`;
    const lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${odfNumber}' ORDER BY OP ASC`;
    let obj = [];
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const detailHistoric = await (0, select_1.select)(lookForDetail);
            if (!detailHistoric) {
                return res.json({ message: 'Error ao localizar o histórico' });
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
                    return res.json({ message: 'Error ao localizar o histórico' });
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
                return res.json({ message: 'Error ao localizar o histórico' });
            }
        }
        else {
            return res.json({ message: x });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Error ao localizar o histórico' });
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map