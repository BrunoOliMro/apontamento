"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supervisor = void 0;
const select_1 = require("../services/select");
const sanitize_1 = require("../utils/sanitize");
const supervisor = async (req, res) => {
    let supervisor = String((0, sanitize_1.sanitize)(req.body['supervisor']));
    let lookForBadge = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    if (!supervisor ||
        supervisor === '' ||
        supervisor === '0' ||
        supervisor === '00' ||
        supervisor === '000' ||
        supervisor === '0000' ||
        supervisor === '00000' ||
        supervisor === '000000') {
        return res.json({ message: 'Supervisor não encontrado' });
    }
    try {
        const resource = await (0, select_1.select)(lookForBadge);
        if (resource) {
            return res.json({ message: 'Supervisor encontrado' });
        }
        else {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
    catch (error) {
        return res.json({ message: 'Erro ao localizar supervisor' });
    }
};
exports.supervisor = supervisor;
//# sourceMappingURL=supervisor.js.map