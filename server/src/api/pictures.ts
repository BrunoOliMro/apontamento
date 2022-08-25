import fs = require("fs");
import path = require("path");
const picturesRelativePath = path.join(__dirname, "../../static/images");
const OUTPUT_FOLDER = `/images`;

export const pictures = {
    getPicturePath: (item: any, hex: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; } | null) => {
        try {
            // Verificar se já existe imagem do item
            const filePath = path.join(picturesRelativePath, `${item}.jpg`);
            if (fs.existsSync(filePath)) {
                return `${OUTPUT_FOLDER}/${item}.jpg`;
            }
            // Verifica se veio o hexadecimal
            if (hex === null || hex.toString().trim() === "") return `${OUTPUT_FOLDER}/sem_imagem.gif`;
            // Criar arquivo de imagem
            const buffer = Buffer.from(hex, "hex");
            fs.writeFileSync(filePath, buffer);
            return `${OUTPUT_FOLDER}/${item}.jpg`;
        } catch (err) {
            console.log(err);
            return `${OUTPUT_FOLDER}/sem_imagem.gif`;
        }
    }
}