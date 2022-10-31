"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const pictures_1 = require("../pictures");
const statusImage = async (req, res) => {
    const numpec = String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"])) || null;
    const revisao = String((0, sanitize_html_1.default)(req.cookies['REVISAO'])) || null;
    const statusImg = String("_status");
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
        if (!imgResult) {
            return res.json({ message: 'Erro no servidor' });
        }
        else {
            let obj = {
                key: imgResult,
                message: 'img found'
            };
            return res.status(200).json(obj);
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