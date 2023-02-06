import fs = require('fs');
import path = require('path');
const picturesFolder = path.join(__dirname, '../../static/images');
const OUTPUT_FOLDER = `/images`;

export const pictures = {
    getPicturePath: async (item: any, hex: String, sufixo: String, i: String) => {
        const filename = `/${item}${sufixo || ''}${i}.jpg`;
        const url = OUTPUT_FOLDER + filename;
        const filePath = path.join(picturesFolder, filename);
        try {
            // Verificar se já existe imagem do item

            if (fs.existsSync(filePath)) {
                return url;
            }

            // Verifica se veio o hexadecimal
            if (hex === null || hex.toString().trim() === '') {
                return `${OUTPUT_FOLDER}/sem_imagem.gif`
            }

            // Criar arquivo de imagem
            const buffer = Buffer.from(hex, 'hex');
            
            await fs.writeFileSync(filePath, buffer);
            
            return url;
        } catch (err) {
            console.log(err);
            return `${OUTPUT_FOLDER}/sem_imagem.gif`;
        }
    }
}