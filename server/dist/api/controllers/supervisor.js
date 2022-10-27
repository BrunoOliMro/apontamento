"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supervisor = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const sanitize_1 = require("../utils/sanitize");
const supervisor = async (req, res) => {
    let supervisor = String((0, sanitize_1.sanitize)(req.body['supervisor']));
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    if (supervisor === '' || supervisor === undefined || supervisor === null) {
        return res.json({ message: 'supervisor não encontrado' });
    }
    try {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            return res.status(200).json({ message: 'supervisor encontrado' });
        }
        else {
            return res.json({ message: 'supervisor não encontrado' });
        }
    }
    catch (error) {
        return res.json({ message: 'supervisor não encontrado' });
    }
    finally {
    }
};
exports.supervisor = supervisor;
//# sourceMappingURL=supervisor.js.map