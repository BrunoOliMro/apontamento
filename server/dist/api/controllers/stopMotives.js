"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMotives = void 0;
const select_1 = require("../services/select");
const stopMotives = async (_req, res) => {
    try {
        const s = `SELECT CODIGO, DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`;
        let resource = await (0, select_1.select)(s);
        let resoc = resource.map((e) => e.DESCRICAO);
        if (!resource) {
            return res.json({ message: 'erro motivos de parada de maquina' });
        }
        else {
            return res.status(200).json(resoc);
        }
    }
    catch (error) {
        return res.json({ message: 'erro motivos de parada de maquina' });
    }
};
exports.stopMotives = stopMotives;
//# sourceMappingURL=stopMotives.js.map