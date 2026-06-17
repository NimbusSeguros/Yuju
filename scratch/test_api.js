const https = require('https');

async function testQuotation() {
    const payload = JSON.stringify({
        marca: "6", // FIAT
        modelo: "557", // CRONOS
        version: "CRONOS 1.3 GSE DRIVE PACK S-DESIGN",
        anio: 2023,
        codigoPostal: "1425",
        localidad: "CABA",
        tieneGNC: false,
        esOKM: false,
        esComercial: false,
        marcaNombre: "FIAT",
        modeloNombre: "CRONOS",
        codia: "12345",
        codInfoAuto: "12345",
        infoauto: "12345",
        version_desc: "CRONOS 1.3 GSE DRIVE PACK S-DESIGN",
        fechaVigencia: "28/04/2026"
    });

    const options = {
        hostname: 'www.api-yuju.com.ar',
        port: 443,
        path: '/api/cotizar-stream',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    console.log(`Testing endpoint: https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        res.on('data', (chunk) => {
            console.log('Received chunk:', chunk.toString());
        });

        res.on('end', () => {
            console.log('Stream ended');
        });
    });

    req.on('error', (e) => {
        console.error('Request error:', e);
    });

    req.write(payload);
    req.end();
}

testQuotation();
