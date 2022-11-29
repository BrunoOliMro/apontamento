"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfIndex = void 0;
const odfIndex = async (array, numOper) => {
    let indexNumber = Number(array
        .map((element) => element.NUMERO_OPERACAO)
        .map((value) => '00' + value)
        .toString()
        .replaceAll(' ', '0')
        .split(',')
        .findIndex((callback) => callback === numOper));
    return indexNumber;
};
exports.odfIndex = odfIndex;
//# sourceMappingURL=odfIndex.js.map