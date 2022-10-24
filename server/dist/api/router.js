"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../global.config");
const pointer_1 = require("./controllers/pointer");
const badFeedMotives_1 = require("./controllers/badFeedMotives");
const draw_1 = require("./controllers/draw");
const historic_1 = require("./controllers/historic");
const odfData_1 = require("./controllers/odfData");
const returnedValue_1 = require("./controllers/returnedValue");
const rip_1 = require("./controllers/rip");
const ripPost_1 = require("./controllers/ripPost");
const selectedTools_1 = require("./controllers/selectedTools");
const status_1 = require("./controllers/status");
const statusImage_1 = require("./controllers/statusImage");
const stopMotives_1 = require("./controllers/stopMotives");
const stopPost_1 = require("./controllers/stopPost");
const stopSupervisor_1 = require("./controllers/stopSupervisor");
const tools_1 = require("./controllers/tools");
const point_1 = require("./controllers/point");
const pointBagde_1 = require("./controllers/pointBagde");
const apiRouter = (0, express_1.Router)();
apiRouter.route("/apontamento")
    .post(pointer_1.pointerPost);
apiRouter.route("/apontamentoCracha")
    .post(pointBagde_1.pointBagde);
apiRouter.route("/odf")
    .get(odfData_1.odfData);
apiRouter.route("/imagem")
    .get(statusImage_1.statusImage);
apiRouter.route("/status")
    .get(status_1.status);
apiRouter.route("/HISTORICO")
    .get(historic_1.historic);
apiRouter.route("/ferramenta")
    .get(tools_1.tools);
apiRouter.route("/ferselecionadas")
    .get(selectedTools_1.selectedTools);
apiRouter.route("/apontar")
    .post(point_1.point);
apiRouter.route("/lancamentoRip")
    .post(ripPost_1.ripPost);
apiRouter.route("/returnedValue")
    .post(returnedValue_1.returnedValue);
apiRouter.route("/supervisor")
    .post(async (req, res) => {
    let supervisor = String(req.body['supervisor']);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    if (supervisor === '' || supervisor === undefined || supervisor === null) {
        return res.json({ message: 'supervisor não encontrado' });
    }
    try {
        const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            return res.status(200).json({ message: 'supervisor encontrado' });
        }
        else {
            return res.json({ message: 'supervisor não encontrado' });
        }
    }
    catch (error) {
        return res.json({ message: 'supervisor não encontrado' });
    }
    finally {
    }
});
apiRouter.route("/supervisorParada")
    .post(stopSupervisor_1.stopSupervisor);
apiRouter.route("/motivoParada")
    .get(stopMotives_1.stopMotives);
apiRouter.route("/postParada")
    .post(stopPost_1.stopPost);
apiRouter.route("/motivorefugo")
    .get(badFeedMotives_1.badFeedMotives);
apiRouter.route("/rip")
    .get(rip_1.rip);
apiRouter.route("/desenho")
    .get(draw_1.draw);
exports.default = apiRouter;
//# sourceMappingURL=router.js.map