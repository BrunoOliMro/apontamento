"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const odfData = async (req, res) => {
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    numeroOdf = Number(numeroOdf);
    const numOper = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))) || null;
    const numOpeNew = String(numOper.toString().replaceAll(' ', "0")) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let table = `VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK)`;
    let column = `*`;
    let top = ``;
    let where = `AND NUMERO_ODF = ${numeroOdf} AND CODIGO_PECA IS NOT NULL`;
    let orderBy = `ORDER BY NUMERO_OPERACAO ASC`;
    try {
        const data = await (0, select_1.select)(table, top, column, where, orderBy);
        res.cookie("qtdProduzir", (0, encryptOdf_1.encrypted)(String(data[0].QTDE_ODF)));
        res.cookie("QTD_REFUGO", (0, encryptOdf_1.encrypted)(String(data[0].QTD_REFUGO)));
        let codigoOperArray = data.map((e) => e.NUMERO_OPERACAO);
        let arrayAfterMap = codigoOperArray.map((e) => "00" + e).toString().replaceAll(' ', "0").split(",");
        let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === numOpeNew);
        let odfSelecionada = data[indiceDoArrayDeOdfs];
        let qtdeApontadaArray = data.map((e) => e.QTDE_APONTADA);
        let qtdOdfArray = data.map((e) => e.QTDE_ODF);
        let valorQtdOdf;
        let valorQtdeApontAnterior;
        let valorMaxdeProducao;
        if (indiceDoArrayDeOdfs - 1 <= 0) {
            valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior || 0;
        }
        if (indiceDoArrayDeOdfs > 0) {
            qtdeApontadaArray = data.map((e) => e.QTDE_APONTADA);
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = x - valorQtdeApontAnterior || 0;
        }
        const obj = {
            funcionario,
            odfSelecionada,
            valorMaxdeProducao,
        };
        if (obj.odfSelecionada === undefined || obj.odfSelecionada === null) {
            return res.json({ message: 'erro ao pegar o tempo' });
        }
        else {
            return res.status(200).json(obj);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "erro ao pegar o tempo" });
    }
    finally {
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map