"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedItensFromOdf = void 0;
const selectedItensFromOdf = async (groupOdf, indexOdf) => {
    let response = {
        message: '',
        odf: '',
        nextOdf: '',
        beforeOdf: '',
    };
    console.log("linha 9 /queryGroup/", indexOdf + 1);
    console.log("linha 10 /queryGroup/", groupOdf.length);
    if (indexOdf <= 0) {
        response.message = 'Primeira ODF selecionada';
        response.beforeOdf = groupOdf[indexOdf];
        response.nextOdf = groupOdf[indexOdf + 1];
        response.odf = groupOdf[indexOdf];
        return response;
    }
    else if (indexOdf + 1 === groupOdf.length) {
        console.log("linha 19 /query/ ultimaOdf");
        response.message = 'Ultima ODF';
        response.odf = groupOdf[indexOdf];
        response.nextOdf = groupOdf[indexOdf];
        response.beforeOdf = groupOdf[indexOdf - 1];
        return response;
    }
    else if (indexOdf > 0 && indexOdf < groupOdf.length - 1) {
        response.message = 'Alguma ODF no meio';
        response.nextOdf = groupOdf[indexOdf + 1];
        response.beforeOdf = groupOdf[indexOdf - 1];
        response.odf = groupOdf[indexOdf];
        return response;
    }
    else {
        return response.message = 'Algo deu errado';
    }
};
exports.selectedItensFromOdf = selectedItensFromOdf;
//# sourceMappingURL=queryGroup.js.map