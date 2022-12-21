"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchOdf_1 = require("./controllers/searchOdf");
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
const tools_1 = require("./controllers/tools");
const point_1 = require("./controllers/point");
const searchBadge_1 = require("./controllers/searchBadge");
const getPoint_1 = require("./controllers/getPoint");
const supervisor_1 = require("./controllers/supervisor");
const stopSupervisor_1 = require("./controllers/stopSupervisor");
const clear_1 = require("./controllers/clear");
const apiRouter = (0, express_1.Router)();
apiRouter.route('/clearAll')
    .get(clear_1.clear);
apiRouter.route('/badge')
    .post(searchBadge_1.searchBagde);
apiRouter.route('/odf')
    .post(searchOdf_1.searchOdf);
apiRouter.route('/tools')
    .get(tools_1.tools);
apiRouter.route('/ferselecionadas')
    .get(tools_1.selectedTools);
apiRouter.route('/odfData')
    .get(odfData_1.odfData);
apiRouter.route('/imagem')
    .get(statusImage_1.statusImage);
apiRouter.route('/status')
    .get(status_1.status);
apiRouter.route('/historic')
    .get(historic_1.historic);
apiRouter.route('/point')
    .post(point_1.point)
    .get(getPoint_1.getPoint);
apiRouter.route('/rip')
    .get(rip_1.rip);
apiRouter.route('/pointRip')
    .post(ripPost_1.ripPost);
apiRouter.route('/returnedValue')
    .post(returnedValue_1.returnedValue);
apiRouter.route('/supervisor')
    .post(supervisor_1.supervisor);
apiRouter.route('/supervisorParada')
    .post(stopSupervisor_1.stopSupervisor);
apiRouter.route('/stopMotives')
    .get(stopMotives_1.stopMotives);
apiRouter.route('/stopPost')
    .post(stopPost_1.stopPost);
apiRouter.route('/badFeedMotives')
    .get(badFeedMotives_1.badFeedMotives);
apiRouter.route('/drawing')
    .get(drawing_1.drawing);
exports.default = apiRouter;
//# sourceMappingURL=router.js.map