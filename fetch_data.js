const https = require('https');
const fs = require('fs');
const path = require('path');

// Las URLs de tu Google Apps Script
const DATA_URL = "https://script.google.com/macros/s/AKfycbxxM2JFcNZkPUhJ-VPnTbloWTSKiznpeoPuZS6CAbHCam8pXxsKfjw6U9ZXSOywvFVD/exec";
const KML_URL = "https://script.google.com/macros/s/AKfycbzaBFcsUxpfPcdECwAVPyek7nGgYZo194fD5Q_VsmnfvRhhyyZhMxNzw_C9KZIQce3umA/exec";

// Función para descargar y seguir redirecciones (Google Apps Script siempre redirige)
function downloadData(url, outputPath) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadData(res.headers.location, outputPath).then(resolve).catch(reject);
            }
            
            if (res.statusCode !== 200) {
                return reject(new Error(`Fallo al descargar '${url}' (Status: ${res.statusCode})`));
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                fs.writeFileSync(path.resolve(__dirname, outputPath), data);
                console.log(`Guardado exitosamente: ${outputPath}`);
                resolve();
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    try {
        console.log("Descargando horarios (JSON)...");
        await downloadData(DATA_URL, 'data.json');
        
        console.log("Descargando mapa (KML)...");
        await downloadData(KML_URL, 'mapa.kml');
        
        console.log("¡Toda la información fue actualizada correctamente!");
    } catch (error) {
        console.error("Error durante la descarga:", error);
        process.exit(1);
    }
}

main();
