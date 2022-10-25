"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const status = async (req, res) => {
    let numpec = String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA'])) || null;
    let maquina = String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA'])) || null;
    let tempoAgora = new Date().getTime() || 0;
    let startTime = Number((0, sanitize_html_1.default)(req.cookies['starterBarcode'])) || 0;
    let startTimeNow = Number(new Date(startTime).getTime()) || 0;
    let tempoDecorrido = Number(tempoAgora - startTimeNow) || 0;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    console.log("maquina: ", maquina);
    try {
        const resource = await connection.query(`
        SELECT 
        TOP 1 
        EXECUT 
        FROM 
        OPERACAO 
        WHERE NUMPEC = '${numpec}' 
        AND MAQUIN = '${maquina}' 
        ORDER BY REVISAO DESC
        `).then(record => record.recordset);
        let qtdProd = Number(req.cookies["qtdProduzir"][0]) || 0;
        let tempoExecut = Number(resource[0].EXECUT) || 0;
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000 || 0;
        let tempoRestante = (tempoTotalExecução - tempoDecorrido);
        if (tempoRestante <= 0) {
            tempoRestante = 0;
        }
        if (tempoRestante <= 0) {
            return res.json({ message: 'erro no tempo' });
        }
        else {
            return res.status(200).json(tempoRestante);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
    finally {
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map