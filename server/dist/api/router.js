"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pointer_1 = require("./controllers/pointer");
const badFeedMotives_1 = require("./controllers/badFeedMotives");
const drawing_1 = require("./controllers/drawing");
const historic_1 = require("./controllers/historic");
const odfData_1 = require("./controllers/odfData");
const returnedValue_1 = require("./controllers/returnedValue");
const rip_1 = require("./controllers/rip");
const ripPost_1 = require("./controllers/ripPost");
const status_1 = require("./controllers/status");
const statusImage_1 = require("./controllers/statusImage");
const stopMotives_1 = require("./controllers/stopMotives");
const stopPost_1 = require("./controllers/stopPost");
const stopSupervisor_1 = require("./controllers/stopSupervisor");
const tools_1 = require("./controllers/tools");
const point_1 = require("./controllers/point");
const pointBagde_1 = require("./controllers/pointBagde");
const getPoint_1 = require("./controllers/getPoint");
const supervisor_1 = require("./controllers/supervisor");
const codeNote_1 = require("./controllers/codeNote");
const getBefSel_1 = require("./controllers/getBefSel");
const apiRouter = (0, express_1.Router)();
apiRouter.route("/apontamento")
    .post(codeNote_1.codeNote)
    .post(pointer_1.pointerPost);
apiRouter.route("/apontamentoCracha")
    .post(pointBagde_1.pointBagde);
apiRouter.route("/odf")
    .get(getBefSel_1.getBefore)
    .get(odfData_1.odfData);
apiRouter.route("/imagem")
    .get(statusImage_1.statusImage);
apiRouter.route("/status")
    .get(status_1.status);
apiRouter.route("/historic")
    .get(historic_1.historic);
apiRouter.route("/ferramenta")
    .get(tools_1.tools);
apiRouter.route("/ferselecionadas")
    .get(tools_1.selectedTools);
apiRouter.route("/apontar")
    .get(getPoint_1.getPoint)
    .post(point_1.point);
apiRouter.route("/lancamentoRip")
    .post(ripPost_1.ripPost);
apiRouter.route("/returnedValue")
    .post(returnedValue_1.returnedValue);
apiRouter.route("/supervisor")
    .post(supervisor_1.supervisor);
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
    .get(drawing_1.draw);
exports.default = apiRouter;
//# sourceMappingURL=router.js.map