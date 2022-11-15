"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    console.log("linha 7 code note", dados);
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoker');
    const secret = process.env['JWT_SECRET_KEY'];
    const key = jwt.sign({
        dados
    }, secret);
    console.log('linha 20', secret);
    console.log("linha 22", key);
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(' ');
    console.log("linha 28 token", token);
    if (!token) {
        return res.json({ message: 'Acesso negado' });
    }
    try {
        let x = jwt.verify(token, secret);
        if (x === true) {
            next();
        }
    }
    catch (error) {
        return res.json({ message: 'Token inválido' });
    }
    const { numOdf, numOper, codMaq } = dados;
    console.log("linha 45", numOdf);
    const numeroOdf = Number(req.cookies['NUMERO_ODF']) || 0;
    const codigoOper = req.cookies['NUMERO_OPERACAO'];
    const codigoMaq = req.cookies['CODIGO_MAQUINA'];
    const funcionario = req.cookies['FUNCIONARIO'];
    if (!numeroOdf) {
    }
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
        console.log('linha 44', funcionario);
        console.log("linha 45", lastEmployee);
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
                req.body.message = 'codeApont 1 setup iniciado';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                return res.json({ message: `codeApont 3 prod iniciado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                req.body.message = 'codeApont 5 maquina parada';
                console.log('52', req.body.message);
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 6) {
                return res.json({ message: `codeApont 6 processo finalizado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 7) {
                req.body.message = 'codeApont 7 estorno realizado';
                next();
            }
            if (!codIdApontamento[0]?.CODAPONTA) {
                req.body.message = `qualquer outro codigo`;
                next();
            }
        }
        if (codIdApontamento.length <= 0) {
            req.body.message = 'insira cod 1';
            next();
        }
    }
    catch (error) {
        return res.json({ message: 'algo deu errado ao buscar pelo codigo de apontamento' });
    }
    finally {
    }
};
exports.codeNote = codeNote;
//# sourceMappingURL=codeNote.js.map