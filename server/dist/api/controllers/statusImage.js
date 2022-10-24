"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const pictures_1 = require("../pictures");
const statusImage = async (req, res) => {
    const numpec = req.cookies["CODIGO_PECA"];
    const revisao = req.cookies['REVISAO'];
    let statusImg = "_status";
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT TOP 1
        [NUMPEC],
        [IMAGEM]
        FROM PROCESSO (NOLOCK)
        WHERE 1 = 1
        AND NUMPEC = '${numpec}'
        AND REVISAO = '${revisao}'
        AND IMAGEM IS NOT NULL
        `).then(record => record.recordset);
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
            imgResult.push(path);
        }
        console.log("img", imgResult);
        if (!imgResult) {
            return res.json({ message: 'Erro no servidor' });
        }
        else {
            console.log('linha 378 ok');
            return res.status(200).json(imgResult);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
    finally {
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map