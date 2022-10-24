"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const odfData = async (req, res) => {
    let numeroOdf = String(req.cookies["NUMERO_ODF"]);
    let numOper = String(req.cookies["NUMERO_OPERACAO"]);
    let numOpeNew = numOper.toString().replaceAll(' ', "0");
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT 
        * 
        FROM
        VW_APP_APTO_PROGRAMACAO_PRODUCAO
        WHERE 1 = 1 
        AND [NUMERO_ODF] = ${numeroOdf}
        AND [CODIGO_PECA] IS NOT NULL
        ORDER BY NUMERO_OPERACAO ASC`.trim()).then(record => record.recordset);
        res.cookie("qtdProduzir", resource[0].QTDE_ODF);
        let codigoOperArray = resource.map(e => e.NUMERO_OPERACAO);
        let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",");
        let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === numOpeNew);
        let odfSelecionada = resource[indiceDoArrayDeOdfs];
        let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
        let qtdOdfArray = resource.map(e => e.QTDE_ODF);
        let valorQtdOdf;
        let valorQtdeApontAnterior;
        let valorMaxdeProducao;
        if (indiceDoArrayDeOdfs - 1 <= 0) {
            valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior || 0;
        }
        if (indiceDoArrayDeOdfs > 0) {
            qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = x - valorQtdeApontAnterior || 0;
        }
        const obj = {
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