import fs = require("fs");
import path = require("path");
const picturesRelativePath = path.join(__dirname, "../../static/images");
const OUTPUT_FOLDER = `/images`;
let num = Math.floor(Math.random() * 10)
let item2 = "-" + num

export const pictures = {
    getPicturePath: (item: any, hex: String, sufixo: String) => {
        try {
            // Verificar se já existe imagem do item
            const filePath = path.join(picturesRelativePath, (`${item}${sufixo ? `${sufixo}` : ""}.jpg`));
            if (fs.existsSync(filePath)) {
                return `${OUTPUT_FOLDER}/${item}${sufixo}.jpg`;
            }
            // Verifica se veio o hexadecimal
            if (hex === null || hex.toString().trim() === "") return `${OUTPUT_FOLDER}/sem_imagem.gif`;
            // Criar arquivo de imagem
            const buffer = Buffer.from(hex, "hex");
            let url = `${OUTPUT_FOLDER}/${item}${sufixo}.jpg`;
            fs.writeFileSync(filePath, buffer);
            if (url === url) {
                url = `${OUTPUT_FOLDER}/${item + item2}${sufixo}.jpg`;
            }
            return url
        } catch (err) {
            console.log(err);
            return `${OUTPUT_FOLDER}/sem_imagem.gif`;
        }
    }
}