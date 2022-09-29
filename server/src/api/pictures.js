"use strict";
exports.__esModule = true;
exports.pictures = void 0;
var fs = require("fs");
var path = require("path");
var picturesRelativePath = path.join(__dirname, "../../static/images");
var OUTPUT_FOLDER = "/images";
var num = Math.floor(Math.random() * 10);
var item2 = "-" + num;
exports.pictures = {
    getPicturePath: function (item, hex, sufixo) {
        try {
            // Verificar se já existe imagem do item
            var filePath = path.join(picturesRelativePath, ("".concat(item).concat(sufixo ? "".concat(sufixo) : "", ".jpg")));
            if (fs.existsSync(filePath)) {
                return "".concat(OUTPUT_FOLDER, "/").concat(item).concat(sufixo, ".jpg");
            }
            // Verifica se veio o hexadecimal
            if (hex === null || hex.toString().trim() === "")
                return "".concat(OUTPUT_FOLDER, "/sem_imagem.gif");
            // Criar arquivo de imagem
            var buffer = Buffer.from(hex, "hex");
            var url = "".concat(OUTPUT_FOLDER, "/").concat(item).concat(sufixo, ".jpg");
            fs.writeFileSync(filePath, buffer);
            if (url === url) {
                url = "".concat(OUTPUT_FOLDER, "/").concat(item + item2).concat(sufixo, ".jpg");
            }
            return url;
        }
        catch (err) {
            console.log(err);
            return "".concat(OUTPUT_FOLDER, "/sem_imagem.gif");
        }
    }
};
