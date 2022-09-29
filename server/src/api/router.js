"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var mssql_1 = require("mssql");
var global_config_1 = require("../global.config");
var pictures_1 = require("./pictures");
var apiRouter = (0, express_1.Router)();
// /api/v1/
apiRouter.route("/apontamento")
    .post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function sanitize(input) {
        var allowedChars = /[A-Za-z0-9]/;
        return input.split("").map(function (char) { return (allowedChars.test(char) ? char : ""); }).join("");
    }
    /**
     * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
     */
    function calMaxQuant(qtdNecessPorPeca, saldoReal) {
        // Quantas peças pai o estoque do componente poderia produzir
        var pecasPaiPorComponente = qtdNecessPorPeca.map(function (qtdPorPeca, i) {
            return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
        });
        var qtdMaxProduzivel = pecasPaiPorComponente.reduce(function (qtdMax, pecasPorComp) {
            return Math.min(qtdMax, pecasPorComp);
        }, Infinity);
        Math.round(qtdMaxProduzivel);
        return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
    }
    var barcode, NUMERO_ODF, dados, connection_1, resource, NUMERO_ODF_1, CODIGO_PECA, CODIGO_MAQUINA, resource_1, resource_2, execut, saldoReal, qtdTotal_1, reservedItens, quan, str_1, codigoFilho, updateTable, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                //Sanitização do codigo
                req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
                barcode = req.body["codigoBarras"];
                NUMERO_ODF = '1232975';
                if (!(barcode === '')) return [3 /*break*/, 1];
                res.status(400).redirect("/#/codigobarras");
                return [3 /*break*/, 17];
            case 1:
                dados = {
                    numOdf: Number(barcode.slice(10)),
                    numOper: String(barcode.slice(0, 5)),
                    codMaq: String(barcode.slice(5, 10))
                };
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 2:
                connection_1 = _a.sent();
                return [4 /*yield*/, connection_1.query("\n                        SELECT TOP 1\n                        [NUMERO_ODF], \n                        [CODIGO_MAQUINA],\n                        [NUMERO_OPERACAO],\n                        [CODIGO_PECA]\n                        FROM            \n                        PCP_PROGRAMACAO_PRODUCAO\n                        WHERE 1 = 1\n                        AND [NUMERO_ODF] = ".concat(dados.numOdf, "\n                        AND [CODIGO_MAQUINA] = '").concat(dados.codMaq, "'\n                        AND [NUMERO_OPERACAO] = ").concat(dados.numOper, "\n                        AND [CODIGO_PECA] IS NOT NULL\n                        ORDER BY NUMERO_OPERACAO ASC\n                        ").trim()).then(function (result) { return result.recordset; })
                    //Armazena os dados em cookies
                ];
            case 3:
                resource = _a.sent();
                NUMERO_ODF_1 = resource.map(function (item) { return item.NUMERO_ODF; });
                CODIGO_PECA = resource.map(function (item) { return item.CODIGO_PECA; });
                CODIGO_MAQUINA = resource.map(function (item) { return item.CODIGO_MAQUINA; });
                res.cookie("NUMERO_ODF", NUMERO_ODF_1);
                res.cookie("CODIGO_PECA", CODIGO_PECA);
                res.cookie("CODIGO_MAQUINA", CODIGO_MAQUINA);
                _a.label = 4;
            case 4:
                _a.trys.push([4, 14, 15, 17]);
                return [4 /*yield*/, connection_1.query("\n                        SELECT TOP 1\n                        [NUMERO_ODF], \n                        [CODIGO_MAQUINA],\n                        [NUMERO_OPERACAO],\n                        [CODIGO_PECA]\n                        FROM            \n                        PCP_PROGRAMACAO_PRODUCAO\n                        WHERE 1 = 1\n                        AND [NUMERO_ODF] = ".concat(dados.numOdf, "\n                        AND [CODIGO_MAQUINA] = '").concat(dados.codMaq, "'\n                        AND [NUMERO_OPERACAO] = ").concat(dados.numOper, "\n                        AND [CODIGO_PECA] IS NOT NULL\n                        ORDER BY NUMERO_OPERACAO ASC\n                        ").trim()).then(function (result) { return result.recordset; })];
            case 5:
                resource_1 = _a.sent();
                if (!(resource_1.length > 0)) return [3 /*break*/, 12];
                res.cookie("NUMERO_ODF", resource_1[0].NUMERO_ODF);
                res.cookie("CODIGO_MAQUINA", resource_1[0].CODIGO_MAQUINA);
                res.cookie("NUMERO_OPERACAO", resource_1[0].NUMERO_OPERACAO);
                res.cookie("CODIGO_PECA", resource_1[0].CODIGO_PECA);
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, 9, 11]);
                return [4 /*yield*/, connection_1.query("\n                            SELECT DISTINCT                 \n                               OP.NUMITE,                 \n                               CAST(OP.EXECUT AS INT) AS EXECUT,       \n                               CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 \n                               CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,\n                               ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado\n                               FROM PROCESSO PRO (NOLOCK)                  \n                               INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  \n                               INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                \n                               INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                \n                               WHERE 1=1                    \n                               AND PRO.ATIVO ='S'                   \n                               AND PRO.CONCLUIDO ='T'                \n                               AND OP.CONDIC ='P'                 \n                               AND PCP.NUMERO_ODF = '".concat(NUMERO_ODF_1, "'    \n                            ").trim()).then(function (result) { return result.recordset; })
                    /**
                     * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
                     */
                ];
            case 7:
                resource_2 = _a.sent();
                execut = resource_2.map(function (item) { return item.EXECUT; });
                saldoReal = resource_2.map(function (item) { return item.SALDOREAL; });
                qtdTotal_1 = calMaxQuant(execut, saldoReal);
                reservedItens = execut.map(function (quantItens) {
                    return Math.floor((qtdTotal_1 || 0) * quantItens);
                }, Infinity);
                console.log(reservedItens);
                quan = [1, 2, 3] //É reservedItens
                ;
                str_1 = ["105830489-1", "105830489-2", "105830489-3"] //É codigoFilho
                ;
                codigoFilho = resource_2.map(function (item) { return item.NUMITE; });
                updateTable = quan.map(function (quan, i) { return __awaiter(void 0, void 0, void 0, function () {
                    var updateResult, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, connection_1.query("\n                                    UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ".concat(quan, " WHERE 1 = 1 AND ODF = '").concat(NUMERO_ODF_1, "' AND CODIGO_FILHO = '").concat(str_1[i], "'"))
                                    // const resourceUpdate  = connection.query(`
                                    // UPDATE CST_ALOCACAO SET  QUANTIDADE  = QUANTIDADE + '${reservedItens}' WHERE 1= 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`);
                                    // res.json()
                                ];
                            case 1:
                                updateResult = _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                error_3 = _a.sent();
                                console.log(error_3);
                                res.status(500).json({ error: true, message: "Erro no servidor." });
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                console.log(updateTable);
                return [3 /*break*/, 11];
            case 8:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, connection_1.close()];
            case 10:
                _a.sent();
                return [7 /*endfinally*/];
            case 11: return [3 /*break*/, 13];
            case 12:
                res.status(400).send("ODF nao ienwurwbv!");
                _a.label = 13;
            case 13: return [3 /*break*/, 17];
            case 14:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(400).send("Dados não encontrados!");
                return [3 /*break*/, 17];
            case 15:
                res.status(200).redirect("/#/ferramenta");
                return [4 /*yield*/, connection_1.close()];
            case 16:
                _a.sent();
                return [7 /*endfinally*/];
            case 17: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/apontamentoCracha")
    .post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    //Sanitizar codigo
    function sanitize(MATRIC) {
        var allowedChars = /[A-Za-z0-9]/;
        return MATRIC.split("").map(function (char) { return (allowedChars.test(char) ? char : ""); }).join("");
    }
    var finalTimer, maxRange, MATRIC, connection, resource, start, mili, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                finalTimer = 6000000;
                maxRange = finalTimer;
                MATRIC = req.body["MATRIC"].trim();
                if (!(MATRIC === '')) return [3 /*break*/, 1];
                res.status(404).send("FUNCIONARIO DESTA MATRICULA NAO ENCONTRADO" + MATRIC);
                return [3 /*break*/, 8];
            case 1: return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 2:
                connection = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, 6, 8]);
                return [4 /*yield*/, connection.query(" \n                SELECT TOP 1\n                [MATRIC],\n                [FUNCIONARIO]\n                FROM FUNCIONARIOS\n                WHERE 1 = 1\n                AND [MATRIC] = ".concat(MATRIC, "\n                ").trim()).then(function (result) { return result.recordset; })];
            case 4:
                resource = _a.sent();
                if (resource.length > 0) {
                    start = new Date();
                    mili = start.getMilliseconds();
                    console.log(mili / 1000);
                    res.cookie("starterBarcode", start.getTime());
                    res.cookie("MATRIC", resource[0].MATRIC, { httpOnly: true, maxAge: maxRange });
                    res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO);
                    res.status(200).redirect("/#/codigobarras");
                }
                else {
                    res.status(404).redirect("/#/codigobarras");
                }
                return [3 /*break*/, 8];
            case 5:
                error_4 = _a.sent();
                res.status(404).send("Erro");
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, connection.close()];
            case 7:
                _a.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/odf")
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var NUMERO_ODF, CODIGO_MAQUINA, NUMERO_OPERACAO, connection, resource, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                NUMERO_ODF = req.query["NUMERO_ODF"].trim() || undefined;
                CODIGO_MAQUINA = req.query["CODIGO_MAQUINA"].trim() || undefined;
                NUMERO_OPERACAO = req.query["NUMERO_OPERACAO"].trim() || undefined;
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n                SELECT TOP 1\n                [NUMERO_ODF], \n                [CODIGO_MAQUINA], \n                [NUMERO_OPERACAO],\n                [QTDE_ODF],\n                [CODIGO_CLIENTE],\n                [CODIGO_PECA],\n                [DT_INICIO_OP],\n                [DT_FIM_OP],\n                [QTDE_ODF],\n                [QTDE_APONTADA],\n                [DT_ENTREGA_ODF],\n                [QTD_REFUGO],\n                [HORA_INICIO],\n                [HORA_FIM]\n                FROM PCP_PROGRAMACAO_PRODUCAO\n                WHERE 1 = 1\n                AND [NUMERO_ODF] = ".concat(NUMERO_ODF, "\n                AND [CODIGO_MAQUINA] = '").concat(CODIGO_MAQUINA, "'\n                AND [NUMERO_OPERACAO] = ").concat(NUMERO_OPERACAO, "\n                ORDER BY NUMERO_OPERACAO ASC").trim()).then(function (result) { return result.recordset; })];
            case 3:
                resource = _a.sent();
                res.json(resource);
                return [3 /*break*/, 7];
            case 4:
                error_5 = _a.sent();
                console.log(error_5);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/IMAGEM")
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var NUMPEC, connection, statusImg, resource, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, req.cookies["CODIGO_PECA"]];
            case 1:
                NUMPEC = _a.sent();
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 2:
                connection = _a.sent();
                statusImg = "_status";
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, 6, 8]);
                return [4 /*yield*/, connection.query("\n            SELECT TOP 1\n            [NUMPEC],\n            [IMAGEM]\n            FROM PROCESSO (NOLOCK)\n            WHERE 1 = 1\n            AND NUMPEC = '".concat(NUMPEC, "'\n            AND IMAGEM IS NOT NULL\n            "))];
            case 4:
                resource = _a.sent();
                result = resource.recordset.map(function (record) {
                    var imgPath = pictures_1.pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"], (statusImg));
                    return {
                        img: imgPath,
                        sufixo: record["sufixo"]
                    };
                });
                res.json(result);
                return [3 /*break*/, 8];
            case 5:
                error_6 = _a.sent();
                console.log(error_6);
                res.status(500).json({ error: true, message: "Erro no servidor." });
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, connection.close()];
            case 7:
                _a.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/HISTORICO")
    .get(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var NUMERO_ODF, connection, resource, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                NUMERO_ODF = req.cookies["NUMERO_ODF"];
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n            SELECT\n            *\n            FROM VW_APP_APONTAMENTO_HISTORICO\n            WHERE 1 = 1\n            AND ODF = '195873'\n            ".trim()).then(function (result) { return result.recordset; })];
            case 3:
                resource = _a.sent();
                console.log(resource);
                res.json(resource);
                return [2 /*return*/, next()];
            case 4:
                error_7 = _a.sent();
                console.log(error_7);
                res.status(500).json({ error: true, message: "Erro no servidor." });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/ferramenta")
    .get(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var CODIGO, connection, ferramenta, startProd, mili, resource, result, s, error_8, end, start, final, insertSql;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                CODIGO = '00240347';
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                ferramenta = "_ferr";
                startProd = new Date();
                mili = startProd.getMilliseconds();
                res.cookie("startProd", startProd.getTime());
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 8]);
                return [4 /*yield*/, connection.query("\n            SELECT \n            [IMAGEM], \n            [CODIGO]\n            FROM VIEW_APTO_FERRAMENTAL \n            WHERE 1 = 1\n            AND CODIGO = '".concat(CODIGO, "'\n            AND IMAGEM IS NOT NULL\n\n            ").trim())];
            case 3:
                resource = _a.sent();
                result = resource.recordset.map(function (record) {
                    var imgPath = pictures_1.pictures.getPicturePath(record["CODIGO"], record["IMAGEM"], (ferramenta));
                    return {
                        img: imgPath
                    };
                });
                s = Object.values(result);
                if (s.length > 0) {
                    res.status(200).redirect("/#/ferramenta");
                }
                else {
                    res.status(500).redirect("/#/apontamento");
                }
                return [3 /*break*/, 8];
            case 4:
                error_8 = _a.sent();
                console.log(error_8);
                res.status(500).json({ error: true, message: "Erro no servidor." });
                return [3 /*break*/, 8];
            case 5:
                end = new Date();
                start = req.cookies["starterBarcode"];
                final = end.getTime() - Number(start);
                return [4 /*yield*/, connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')];
            case 6:
                insertSql = _a.sent();
                return [4 /*yield*/, connection.close()];
            case 7:
                _a.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/apontar")
    .post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    //Sanitização de input
    function sanitize(input) {
        var allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map(function (char) { return (allowedChars.test(char) ? char : ""); })
            .join("");
    }
    var status, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA, parcialFeed, input, connection, resource, error_9, resource, result, error_10, endProdTimer, startProd, finalProdTimer, startRip, mili, insertSqlRework, insertSql, insertSqlTimer, resourceReserved, resourceSaldoReal, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                status = '';
                NUMERO_ODF = req.cookies["NUMERO_ODF"].trim();
                NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"].trim();
                CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"].trim();
                EMPRESA_RECNO = 1;
                QTDE_APONTADA = req.body["goodFeed"].trim();
                QTD_REFUGO = req.body["badfeed"].trim();
                CST_PC_FALTANTE = req.body["reworkFeed"].trim();
                CST_QTD_RETRABALHADA = req.body["missingFeed"].trim();
                parcialFeed = req.body["parcialFeed"].trim();
                input = req.body.trim();
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n                SELECT TOP 1\n                [ODF],\n                [PECA],\n                [REVISAO],\n                [ITEM],\n                [PC_BOAS],\n                [PC_REFUGA]\n                FROM            \n                HISAPONTA\n                WHERE 1 = 1\n                AND [ODF] = ".concat(NUMERO_ODF, "\n                AND [PECA] =").concat(CODIGO_MAQUINA, "\n                ORDER BY DATAHORA DESC\n                ").trim()).then(function (result) { return result.recordset; })];
            case 3:
                resource = _a.sent();
                return [3 /*break*/, 7];
            case 4:
                error_9 = _a.sent();
                console.log(error_9);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7:
                _a.trys.push([7, 9, 10, 12]);
                return [4 /*yield*/, connection.query("\n                UPDATE CST_ALOCACAO  SET QUANTIDADE =  QUANTIDADE + '".concat(QTDE_APONTADA, "' WHERE 1 = 1 AND ODF = '").concat(NUMERO_ODF, "'"))];
            case 8:
                resource = _a.sent();
                result = resource.recordset.map(function () { });
                res.json(result);
                return [3 /*break*/, 12];
            case 9:
                error_10 = _a.sent();
                console.log(error_10);
                res.status(500).json({ error: true, message: "Erro no servidor." });
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, connection.close()];
            case 11:
                _a.sent();
                return [7 /*endfinally*/];
            case 12:
                _a.trys.push([12, 18, 19, 21]);
                endProdTimer = new Date();
                startProd = req.cookies["startProd"];
                finalProdTimer = endProdTimer.getTime() - Number(startProd);
                console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos");
                startRip = new Date();
                mili = startRip.getMilliseconds();
                console.log(mili / 1000);
                res.cookie("startRip", startRip.getTime());
                return [4 /*yield*/, connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')')
                    // } else {
                ];
            case 13:
                insertSqlRework = _a.sent();
                return [4 /*yield*/, connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + totalPecas + ',' + totalRefugo + ')')
                    // }
                ];
            case 14:
                insertSql = _a.sent();
                return [4 /*yield*/, connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdTimer + ')')];
            case 15:
                insertSqlTimer = _a.sent();
                return [4 /*yield*/, connection.query("UPDATE CST_ALOCA\u00C7\u00C3O SET  QUANTIDADE AS RESERVA = RESERVA - '".concat(QTDE_APONTADA, "' WHERE 1= 1 AND ODF= '").concat(NUMERO_ODF, "'"))];
            case 16:
                resourceReserved = _a.sent();
                return [4 /*yield*/, connection.query("UPDATE CST_ALOCA\u00C7\u00C3O SET  SALDOREAL = SALDOREAL - '".concat(QTDE_APONTADA, "' WHERE 1= 1 AND ODF= '").concat(NUMERO_ODF, "'"))];
            case 17:
                resourceSaldoReal = _a.sent();
                res.status(200).redirect("/#/rip");
                return [3 /*break*/, 21];
            case 18:
                error_11 = _a.sent();
                res.redirect("/#/rip");
                return [3 /*break*/, 21];
            case 19: return [4 /*yield*/, connection.close()];
            case 20:
                _a.sent();
                return [7 /*endfinally*/];
            case 21: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/rip")
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var NUMERO_ODF, NUMPEC, REVISAO, NUMCAR, connection, resource, resource_3, error_12, end, start, final, endProdRip, startRip, finalProdRip, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                NUMERO_ODF = '1232975';
                NUMPEC = '00240070';
                REVISAO = '02';
                NUMCAR = '2999';
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, 11, 13]);
                return [4 /*yield*/, connection.query("\n            SELECT  DISTINCT\n            PROCESSO.NUMPEC,\n            PROCESSO.REVISAO,\n            QA_CARACTERISTICA.NUMCAR AS NUMCAR,\n            QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,\n            QA_CARACTERISTICA.DESCRICAO,\n            ESPECIFICACAO  AS ESPECIF,\n            LIE,\n            LSE,\n            QA_CARACTERISTICA.INSTRUMENTO\n            FROM PROCESSO\n            INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO\n            INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC\n            AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA \n            AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO \n            LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  \n            FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE\n\t\t\tWHERE PROCESSO.NUMPEC = '".concat(NUMPEC, "' \n            AND PROCESSO.REVISAO = '").concat(REVISAO, "' \n            AND NUMCAR < '").concat(NUMCAR, "'\n            ORDER BY NUMPEC ASC\n                ").trim()).then(function (result) { return result.recordset; })];
            case 3:
                resource = _a.sent();
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, 7, 9]);
                return [4 /*yield*/, connection.query("\n                SELECT DISTINCT                 \n                   OP.NUMITE,                 \n                   CAST(OP.EXECUT AS INT) AS EXECUT,       \n                   CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 \n                   CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,\n                   ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado\n                   FROM PROCESSO PRO (NOLOCK)                  \n                   INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  \n                   INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                \n                   INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                \n                   WHERE 1=1                    \n                   AND PRO.ATIVO ='S'                   \n                   AND PRO.CONCLUIDO ='T'                \n                   AND OP.CONDIC ='P'                 \n                   AND PCP.NUMERO_ODF = '".concat(NUMERO_ODF, "'    \n                ").trim()).then(function (result) { return result.recordset; })];
            case 5:
                resource_3 = _a.sent();
                return [3 /*break*/, 9];
            case 6:
                error_12 = _a.sent();
                console.log(error_12);
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, connection.close()];
            case 8:
                _a.sent();
                return [7 /*endfinally*/];
            case 9:
                end = new Date();
                start = req.cookies["starterBarcode"];
                final = end.getTime() - Number(start);
                endProdRip = new Date();
                startRip = req.cookies["startRip"];
                finalProdRip = endProdRip.getTime() - Number(startRip);
                // Insert com o tempo final no banco
                // const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')')
                // console.log("Rip: " + finalProdRip / 1000 + " segundos")
                // const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
                // console.log("Completo: " + final / 1000 + " segundos")
                res.json(resource);
                return [3 /*break*/, 13];
            case 10:
                error_13 = _a.sent();
                console.log(error_13);
                return [3 /*break*/, 13];
            case 11: return [4 /*yield*/, connection.close()];
            case 12:
                _a.sent();
                return [7 /*endfinally*/];
            case 13: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/lancamentoRip")
    .post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    // let M7 = req.body["M7"].trim()
    // let M8 = req.body["M8"].trim()
    // let M9 = req.body["M9"].trim()
    // let M10 = req.body["M10"].trim()
    // let M11 = req.body["M11"].trim()
    // let M12 = req.body["M12"].trim()
    // let M13 = req.body["M13"].trim()
    function sanitize(input) {
        var allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map(function (char) { return (allowedChars.test(char) ? char : ""); })
            .join("");
    }
    var returnedvalue, NUMERO_ODF, SETUP, M2, M3, M4, M5, M6, connection, resource, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                returnedvalue = req.body["returnValue"].trim();
                NUMERO_ODF = req.cookies["NUMERO_ODF"];
                SETUP = req.body["SETUP"].trim();
                M2 = req.body["M2"].trim();
                M3 = req.body["M3"].trim();
                M4 = req.body["M4"].trim();
                M5 = req.body["M5"].trim();
                M6 = req.body["M6"].trim();
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query('INSERT INTO CST_RIP_ODF_PRODUCAO(SETUP, M2,M3,M4,M5,M6) VALUES ('
                        + SETUP + ','
                        + M2 + ','
                        + M3 + ','
                        + M4 + ','
                        + M5 + ','
                        + M6 +
                        ')').then(function (result) { return result.recordset; })];
            case 3:
                resource = _a.sent();
                console.log(resource);
                res.json(resource);
                return [3 /*break*/, 7];
            case 4:
                error_14 = _a.sent();
                console.log(error_14);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/returnedValue")
    .post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function sanitize(returnedvalue) {
        var allowedChars = /[A-Za-z0-9]/;
        return returnedvalue
            .split("")
            .map(function (char) { return (allowedChars.test(char) ? char : ""); })
            .join("");
    }
    var returnedvalue, NUMERO_ODF, connection, resource, result, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                returnedvalue = req.body["returnValue"].trim();
                NUMERO_ODF = req.cookies["returnValue"].trim();
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '".concat(returnedvalue, "' WHERE 1 = 1 AND ODF = '").concat(NUMERO_ODF, "'"))];
            case 3:
                resource = _a.sent();
                result = resource.recordset.map(function () { });
                console.log(resource);
                res.status(200).json(resource);
                return [3 /*break*/, 7];
            case 4:
                error_15 = _a.sent();
                console.log(error_15);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/parada")
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, resource, result, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '".concat(returnedvalue, "' WHERE 1 = 1 AND ODF = '").concat(NUMERO_ODF, "'"))];
            case 3:
                resource = _a.sent();
                result = resource.recordset.map(function () { });
                console.log(resource);
                res.status(200).json(resource);
                return [3 /*break*/, 7];
            case 4:
                error_16 = _a.sent();
                console.log(error_16);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/pausa")
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, resource, result, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 7]);
                return [4 /*yield*/, connection.query("\n                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '".concat(returnedvalue, "' WHERE 1 = 1 AND ODF = '").concat(NUMERO_ODF, "'"))];
            case 3:
                resource = _a.sent();
                result = resource.recordset.map(function () { });
                console.log(resource);
                res.status(200).json(resource);
                return [3 /*break*/, 7];
            case 4:
                error_17 = _a.sent();
                console.log(error_17);
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, connection.close()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
apiRouter.route("/desenho")
    //GET das Fotos das desenho
    .get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var NUMPEC, connection, desenho, resource, result, error_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, req.cookies["CODIGO_PECA"]];
            case 1:
                NUMPEC = _a.sent();
                return [4 /*yield*/, mssql_1["default"].connect(global_config_1.sqlConfig)];
            case 2:
                connection = _a.sent();
                desenho = "_desenho";
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, 6, 8]);
                return [4 /*yield*/, connection.query("\n            SELECT\n            [NUMPEC],\n            [IMAGEM]\n            FROM  QA_LAYOUT(NOLOCK) \n            WHERE 1 = 1 \n            AND NUMPEC = '".concat(NUMPEC, "'\n            AND IMAGEM IS NOT NULL"))];
            case 4:
                resource = _a.sent();
                result = resource.recordset.map(function (record) {
                    var imgPath = pictures_1.pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"], desenho);
                    return {
                        img: imgPath,
                        codigoInterno: record["NUMPEC"],
                        sufixo: record["sufixo"]
                    };
                });
                res.json(result);
                return [3 /*break*/, 8];
            case 5:
                error_18 = _a.sent();
                console.log(error_18);
                res.status(500).json({ error: true, message: "Erro no servidor." });
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, connection.close()];
            case 7:
                _a.sent();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); });
exports["default"] = apiRouter;
