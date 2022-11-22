import { Router } from "express";
//import assert from "node:assert";
import { pointerPost } from "./controllers/pointer";
import { badFeedMotives } from "./controllers/badFeedMotives";
import { drawing } from "./controllers/drawing";
import { historic } from "./controllers/historic";
import { odfData } from "./controllers/odfData";
import { returnedValue } from "./controllers/returnedValue";
import { rip } from "./controllers/rip";
import { ripPost } from "./controllers/ripPost";
import { status } from "./controllers/status";
import { statusImage } from "./controllers/statusImage";
import { stopMotives } from "./controllers/stopMotives";
import { stopPost } from "./controllers/stopPost";
import { stopSupervisor } from "./controllers/stopSupervisor";
import { selectedTools, tools } from "./controllers/tools";
import { point } from "./controllers/point";
import { pointBagde } from "./controllers/pointBagde";
import { getPoint } from "./controllers/getPoint";
import { supervisor } from "./controllers/supervisor";
import { codeNote } from "./controllers/codeNote";
import { getBefore } from "./controllers/getBefSel";
import { odfDataQtd } from "./controllers/odfDataQtd";

// /api/v1/
const apiRouter = Router();

apiRouter.route("/apontamentoCracha")
    .post(pointBagde)

apiRouter.route("/apontamento")
    //.post(codeNote)
    .post(pointerPost)

apiRouter.route("/odf")
    //.get(codeNote)
    .get(odfData)

// apiRouter.route("/odfQtd")
//     .get(odfDataQtd)

apiRouter.route("/imagem")
    //.get(getBefore)
    .get(statusImage)

apiRouter.route("/status")
    //.get(codeNote)
    //.get(getBefore)
    .get(status)

apiRouter.route("/historic")
    //.get(getBefore)
    .get(historic)

apiRouter.route("/ferramenta")
    //GET das Fotos das desenhodiv
    //.get(getBefore)
    .get(tools)
    .get(selectedTools)


// apiRouter.route("/ferselecionadas")
//     //.get(codeNote)
//    // .get(getBefore)
//     .get(selectedTools)


apiRouter.route("/apontar")
    //.get(codeNote)
    //.get(getBefore)
    .get(getPoint)
    .post(point)

apiRouter.route("/lancamentoRip")
    //.get(getBefore)
    //.get(codeNote)
    .post(ripPost)

apiRouter.route("/returnedValue")
    //.get(getBefore)
    //.get(codeNote)
    .post(returnedValue)

apiRouter.route("/supervisor")
    .post(supervisor)

// apiRouter.route("/supervisorParada")
//     //.get(getBefore)
//     .post(stopSupervisor)

apiRouter.route("/motivoParada")
    //.get(getBefore)
    .get(stopMotives)

apiRouter.route("/postParada")
   // .get(getBefore)
    .post(stopPost)

apiRouter.route("/motivorefugo")
    //.get(getBefore)
    //.get(codeNote)
    .get(badFeedMotives)

apiRouter.route("/rip")
    //.get(getBefore)
    .get(rip)

apiRouter.route("/desenho")
    //GET Desenho TECNICO
    //.get(getBefore)
    .get(drawing)

export default apiRouter;