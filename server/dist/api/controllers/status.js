"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const status = async (req, res) => {
    let numpec = req.cookies['CODIGO_PECA'];
    let maquina = req.cookies['CODIGO_MAQUINA'];
    let tempoAgora = new Date().getTime();
    let startTime = req.cookies['starterBarcode'];
    let startTimeNow = Number(new Date(startTime).getTime());
    let tempoDecorrido = Number(tempoAgora - startTimeNow);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
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
        let qtdProd = req.cookies["qtdProduzir"][0];
        let tempoExecut = Number(resource[0].EXECUT);
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000;
        let tempoRestante = (tempoTotalExecução - tempoDecorrido);
        if (tempoRestante <= 0) {
            tempoRestante = 0;
        }
        if (tempoRestante <= 0) {
            return res.json({ message: 'erro no tempo' });
        }
        else {
            console.log('linha 407: /status/ : ', tempoRestante);
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