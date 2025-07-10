const https = require('https');
const http = require('http');

console.log('🔍 Verificando estado del backend...\n');

// URLs a verificar
const urls = [
  'https://futbolformacionesbackend.onrender.com/api/health',
  'https://futbolformacionesbackend.onrender.com/',
  'http://localhost:3000/api/health'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'No encontrado'}`);
        console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'No encontrado'}`);
        console.log(`   - Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'No encontrado'}`);
        console.log(`   Response: ${data.substring(0, 200)}...`);
        console.log('');
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${url} - Timeout`);
      console.log('');
      req.destroy();
      resolve();
    });
  });
}

async function checkAllUrls() {
  for (const url of urls) {
    await checkUrl(url);
  }
  
  console.log('📋 Resumen:');
  console.log('- Si el backend responde 200: Está funcionando');
  console.log('- Si no hay headers CORS: Problema de configuración');
  console.log('- Si no responde: Backend caído o mal configurado');
}

checkAllUrls(); 