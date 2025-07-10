const https = require('https');
const http = require('http');

console.log('🔍 Probando CORS específicamente...\n');

function testCors(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    // Simular una petición OPTIONS (preflight)
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://futbolformacionesfrontend.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const req = client.request(url, options, (res) => {
      console.log(`🌐 ${url}`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers de CORS:`);
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods', 
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        const value = res.headers[header] || 'No encontrado';
        console.log(`   ${header}: ${value}`);
      });
      
      console.log('');
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      console.log('');
      resolve();
    });
    
    req.end();
  });
}

async function testAll() {
  const urls = [
    'https://futbolformacionesbackend.onrender.com/api/jugadores',
    'http://localhost:3000/api/jugadores'
  ];
  
  for (const url of urls) {
    await testCors(url);
  }
  
  console.log('💡 Soluciones:');
  console.log('1. Si no hay headers CORS: El middleware no se está aplicando');
  console.log('2. Si hay headers pero no funcionan: Problema de configuración');
  console.log('3. Si el servidor no responde: Backend caído');
}

testAll(); 