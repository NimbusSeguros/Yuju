const fs = require('fs');
const path = 'c:/Users/schut/yuju/src/pages/Cotizadores/MotoCotizador.tsx';

let content = fs.readFileSync(path, 'utf8');

const map = {
    'AÃ±o': 'Año',
    'aÃ±o': 'año',
    'FabricaciÃ³n': 'Fabricación',
    'VersiÃ³n': 'Versión',
    'versiÃ³n': 'versión',
    'SELECCIONÃ¡': 'SELECCIONÁ',
    'SEGÃºN': 'SEGÚN',
    'CÃ‰DULA': 'CÉDULA',
    'BUSCÃ¡': 'BUSCÁ',
    'ESPECÃFICA': 'ESPECÍFICA',
    'CÃ³DIGO': 'CÓDIGO',
    'SeleccionÃ¡': 'Seleccioná',
    'Â¡': '¡',
    'mÃ¡s': 'más',
    'nÃºmero': 'número',
    'cotizaciÃ³n': 'cotización',
    'Â¿': '¿',
    'SÃ­': 'Sí',
    'vehÃ­culo': 'vehículo',
    'daÃ±os': 'daños',
    'AsÃ­': 'Así',
    'podÃ©s': 'podés',
    'estÃ¡s': 'estás',
    'QuÃ©': 'Qué',
    'AdemÃ¡s': 'Además',
    'protecciÃ³n': 'protección',
    'mÃ¡s': 'más',
    'trÃ¡mite': 'trámite',
    'tenÃ©s': 'tenés',
    'documentaciÃ³n': 'documentación',
    'necesitÃ¡s': 'necesitás',
    'cÃ©dula': 'cédula',
    'rÃ¡pida': 'rápida',
    'CuÃ¡ndo': 'Cuándo',
    'dÃ­a': 'día',
    'compaÃ±Ã­a': 'compañía',
    'PagofÃ¡cil': 'Pagofácil',
    'tambiÃ©n': 'también',
    'automÃ¡tico': 'automático',
    'crÃ©dito': 'crédito',
    'grÃºa': 'grúa',
    'pÃ³liza': 'póliza',
    'abonÃ¡s': 'abonás',
    'estÃ¡': 'está',
    'inspecciÃ³n': 'inspección',
    'nÃºmero': 'número',
    'telÃ©fono': 'teléfono',
    'hacÃ©': 'hacé',
    'EstarÃ­as': 'Estarías',
    'trÃ¡nsito': 'tránsito',
    'infracciÃ³n': 'infracción',
    'CÃ³mo': 'Cómo',
    'mÃ³vil': 'móvil',
};

for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed encoding map in MotoCotizador.');
