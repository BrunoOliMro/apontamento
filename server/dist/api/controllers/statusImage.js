"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const pictures_1 = require("../pictures");
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const statusImage = async (req, res) => {
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"]))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    const statusImg = String("_status");
    const lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`;
    try {
        const resource = await (0, select_1.select)(lookOnProcess);
        let imgResult = [];
        if (typeof resource !== 'string') {
            for await (let [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                imgResult.push(path);
            }
        }
        if (!imgResult) {
            return res.json({ message: 'Erro no servidor' });
        }
        else {
            return res.status(200).json(imgResult);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map