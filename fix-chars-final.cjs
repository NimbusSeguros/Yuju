const fs = require('fs');
const path = 'c:/Users/schut/yuju/src/pages/Cotizadores/MotoCotizador.tsx';

let content = fs.readFileSync(path, 'utf8');

const map = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã\x81': 'Á',
    'Ã\x89': 'É',
    'Ã\x8D': 'Í',
    'Ã\x93': 'Ó',
    'Ã\x9A': 'Ú',
    'Â¿': '¿',
    'Â¡': '¡',
    'Ã‰': 'É',
    'Ã³': 'ó',
    'Ã¡': 'á',
    'Ã-': 'Í'
};

for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
}

// Special cases that might be multi-char broken
content = content.split('Vehculo').join('Vehículo')
                 .split('Ubicacin').join('Ubicación')
                 .split('Cotizacin').join('Cotización');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed encodings globally');
