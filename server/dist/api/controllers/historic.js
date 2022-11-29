"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const historic = async (req, res) => {
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])));
    const lookForDetail = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY DATAHORA DESC`;
    const lookforGeneric = `SELECT * FROM VW_APP_APONTAMENTO_HISTORICO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' ORDER BY OP ASC`;
    let obj = [];
    try {
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
    catch (error) {
        console.log(error);
        return res.json({ message: 'Error ao localizar o histórico' });
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map