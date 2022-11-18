"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const historic = async (req, res) => {
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])));
    let resultPeçasBoas;
    let table = `VW_APP_APONTAMENTO_HISTORICO_DETALHADO`;
    let top = ``;
    let column = `*`;
    let where = `AND ODF = '${NUMERO_ODF}'`;
    let orderBy = `ORDER BY DATAHORA DESC`;
    let generalTable = `VW_APP_APONTAMENTO_HISTORICO`;
    let generalOrderBy = ``;
    try {
        const detailHistoric = await (0, select_1.select)(table, top, column, where, orderBy);
        const generalHistoric = await (0, select_1.select)(generalTable, top, column, where, generalOrderBy);
        let obj = [];
        for (const iterator of detailHistoric) {
            if (iterator.BOAS > 0) {
                obj.push(iterator);
            }
            if (iterator.REFUGO > 0) {
                obj.push(iterator);
            }
        }
        resultPeçasBoas = detailHistoric.reduce((acc, iterator) => {
            return acc + iterator.BOAS + iterator.REFUGO;
        }, 0);
        if (resultPeçasBoas > 0) {
            let objRes = {
                resourceDetail: generalHistoric,
                resource: obj,
                message: 'Exibir histórico'
            };
            return res.json(objRes);
        }
        if (resultPeçasBoas <= 0) {
            return res.json({ message: 'Não há histórico a exibir' });
        }
        else {
            return res.json({ message: 'Error ao localizar o histórico' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Error ao localizar o histórico' });
    }
    finally {
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map