"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    const numeroOdfCookies = req.cookies['odfCryptografada'];
    const encodedOdfString = req.cookies['encodedOdfString'];
    let decryptedValue = (0, decryptedOdf_1.decrypted)(numeroOdfCookies);
    let decodedBufferValue = (0, decodeOdf_1.decodedBuffer)(encodedOdfString);
    if (decodedBufferValue === decryptedValue) {
        next();
    }
    else {
        console.log("sera que cai aqui");
        return res.json({ message: 'Acesso negado' });
    }
    const numeroOdf = Number(req.cookies['NUMERO_ODF']) || 0;
    const codigoOper = req.cookies['NUMERO_OPERACAO'];
    const codigoMaq = req.cookies['CODIGO_MAQUINA'];
    const funcionario = req.cookies['FUNCIONARIO'];
    try {
        const codIdApontamento = await connection.query(`
            SELECT 
            TOP 1
            USUARIO,
            ODF,
            NUMOPE, 
            ITEM,
            CODAPONTA 
            FROM 
            HISAPONTA 
            WHERE 1 = 1 
            AND ODF = ${dados.numOdf}
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC
            `)
            .then(result => result.recordset);
        let lastEmployee = codIdApontamento[0]?.USUARIO;
        let numeroOdfDB = codIdApontamento[0]?.ODF;
        let codigoOperDB = codIdApontamento[0]?.NUMOPE;
        let codigoMaqDB = codIdApontamento[0]?.ITEM;
        if (lastEmployee !== funcionario
            && numeroOdf === numeroOdfDB
            && codigoOper === codigoOperDB
            && codigoMaq === codigoMaqDB) {
            console.log("usuario diferente");
            return res.json({ message: 'usuario diferente' });
        }
        if (codIdApontamento.length > 0) {
            if (codIdApontamento[0]?.CODAPONTA === 1) {
                req.body.message = `codeApont 1 setup iniciado`;
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
                return res.json({ message: `codeApont 2 setup finalizado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                return res.json({ message: `codeApont 3 prod iniciado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
                return res.json({ message: `codeApont 4 prod finalzado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                return res.json({ message: `codeApont 5 maquina parada` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 6) {
                return res.json({ message: `codeApont 6 processo finalizado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 7) {
                return res.json({ message: 'codeApont 7 estorno realizado' });
            }
            if (!codIdApontamento[0]?.CODAPONTA) {
                return res.json({ message: 'qualquer outro codigo' });
            }
        }
        if (!codIdApontamento) {
            return res.json({ message: 'codeApont 1 setup iniciado' });
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado ao buscar pelo codigo de apontamento' });
    }
    finally {
        await connection.close();
    }
};
exports.codeNote = codeNote;
//# sourceMappingURL=codeNote.js.map