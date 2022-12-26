import { Router } from 'express';
//import assert from 'node:assert';
import { searchOdf } from './controllers/searchOdf';
import { badFeedMotives } from './controllers/badFeedMotives';
import { drawing } from './controllers/drawing';
import { historic } from './controllers/historic';
import { odfData } from './controllers/odfData';
import { returnedValue } from './controllers/returnedValue';
import { rip } from './controllers/rip';
import { ripPost } from './controllers/ripPost';
import { status } from './controllers/status';
import { statusImage } from './controllers/statusImage';
import { stopMotives } from './controllers/stopMotives';
import { stopPost } from './controllers/stopPost';
import { selectedTools, tools } from './controllers/tools';
import { point } from './controllers/point';
import { searchBagde } from './controllers/searchBadge';
import { getPoint } from './controllers/getPoint';
import { supervisor } from './controllers/supervisor';
import { stopSupervisor } from './controllers/stopSupervisor';
import { clear } from './controllers/clear';
import { returnMotives } from './controllers/returnMotives';

// /api/v1/
const apiRouter = Router();

apiRouter.route('/returnMotives')
    .get(returnMotives)

apiRouter.route('/clearAll')
    .get(clear)

apiRouter.route('/badge')
    .post(searchBagde)

apiRouter.route('/odf')
    //.post(codeNote)
    .post(searchOdf)

apiRouter.route('/tools')
    //.get(codeNote)
    .get(tools)
//.get(selectedTools)

apiRouter.route('/ferselecionadas')
    //.get(codeNote)
    .get(selectedTools)

apiRouter.route('/odfData')
    //.get(codeNote)
    .get(odfData)

apiRouter.route('/imagem')
    .get(statusImage)

apiRouter.route('/status')
    .get(status)

apiRouter.route('/historic')
    .get(historic)

apiRouter.route('/point')
    //.post(codeNote)
    .post(point)
    .get(getPoint)

apiRouter.route('/rip')
    //.get(codeNote)
    .get(rip)

apiRouter.route('/pointRip')
    //.get(codeNote)
    .post(ripPost)

apiRouter.route('/returnedValue')
    .post(returnedValue)

apiRouter.route('/supervisor')
    .post(supervisor)

apiRouter.route('/supervisorParada')
    //.get(getBefore)
    .post(stopSupervisor)

apiRouter.route('/stopMotives')
    .get(stopMotives)


apiRouter.route('/stopPost')
    .post(stopPost)


apiRouter.route('/badFeedMotives')
    .get(badFeedMotives)


apiRouter.route('/drawing')
    .get(drawing)

export default apiRouter;