"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pictures = void 0;
const fs = require("fs");
const path = require("path");
const picturesRelativePath = path.join(__dirname, "../../static/images");
const OUTPUT_FOLDER = `/images`;
let num = Math.floor(Math.random() * 10);
let item2 = "-" + num;
exports.pictures = {
    getPicturePath: (item, hex, sufixo, i) => {
        try {
            const filePath = path.join(picturesRelativePath, (`${item}${sufixo ? `${sufixo}` : ""}${i}.jpg`));
            if (fs.existsSync(filePath)) {
                return `${OUTPUT_FOLDER}/${item}${sufixo}${i}.jpg`;
            }
            if (hex === null || hex.toString().trim() === "")
                return `${OUTPUT_FOLDER}/sem_imagem.gif`;
            const buffer = Buffer.from(hex, "hex");
            let url = `${OUTPUT_FOLDER}/${item}${sufixo}${i}.jpg`;
            fs.writeFileSync(filePath, buffer);
            if (url === url) {
                url = `${OUTPUT_FOLDER}/${item + item2}${sufixo}${i}.jpg`;
            }
            return url;
        }
        catch (err) {
            console.log(err);
            return `${OUTPUT_FOLDER}/sem_imagem.gif`;
        }
    }
};
//# sourceMappingURL=pictures.js.map