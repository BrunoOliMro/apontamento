"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMotives = void 0;
const select_1 = require("../services/select");
const stopMotives = async (_req, res) => {
    try {
        const response = {
            message: '',
            motives: ''
        };
        const queryStr = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`;
        let resource = await (0, select_1.select)(queryStr);
        if (!resource) {
            return res.json({ message: 'Algo deu errado' });
        }
        else if (resource) {
            let resultMap = resource.map((e) => e.DESCRICAO);
            if (resultMap) {
                response.message = 'Success';
                response.motives = resultMap;
                return res.status(200).json(response);
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.stopMotives = stopMotives;
//# sourceMappingURL=stopMotives.js.map