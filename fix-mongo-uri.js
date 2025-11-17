// Script para verificar y diagnosticar el problema de MongoDB URI

const mongoUri = process.env.MONGODB_URI;

console.log('='.repeat(60));
console.log('📊 DIAGNÓSTICO DE MONGODB URI');
console.log('='.repeat(60));

if (!mongoUri) {
  console.error('❌ MONGODB_URI no está definida');
  process.exit(1);
}

console.log('\n🔍 URI actual (parcial):', mongoUri.substring(0, 50) + '...');

// Extraer el nombre de la BD de la URI
const dbNameMatch = mongoUri.match(/\/([a-zA-Z0-9_-]+)(\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : 'desconocido';

console.log('📁 Nombre de BD en URI:', dbName);
console.log('❌ Nombre de BD en MongoDB Atlas:', 'futbolFormaciones');

if (dbName === 'futbolformaciones') {
  console.log('\n⚠️  PROBLEMA ENCONTRADO:');
  console.log('   La URI especifica "futbolformaciones" (minúsculas)');
  console.log('   Pero MongoDB Atlas tiene "futbolFormaciones" (camelCase)');
  console.log('\n💡 SOLUCIÓN:');
  console.log('   En Render, actualiza MONGODB_URI para cambiar:');
  console.log('   DE: ...mongodb.net/futbolformaciones?...');
  console.log('   A:  ...mongodb.net/futbolFormaciones?...');
} else if (dbName === 'futbolFormaciones') {
  console.log('\n✅ La URI está correcta!');
} else {
  console.log('\n⚠️  La BD no es ninguna de las esperadas');
  console.log('   BD en URI:', dbName);
}

console.log('\n' + '='.repeat(60));
