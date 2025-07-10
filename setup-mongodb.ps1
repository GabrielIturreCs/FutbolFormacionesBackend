# Script para configurar MongoDB Atlas
Write-Host "🔧 Configuración de MongoDB Atlas" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "`n📋 Pasos para solucionar el error de autenticación:" -ForegroundColor Yellow
Write-Host "1. Ve a https://cloud.mongodb.com" -ForegroundColor White
Write-Host "2. Inicia sesión con tu cuenta" -ForegroundColor White
Write-Host "3. Ve a 'Database Access' en el menú lateral" -ForegroundColor White
Write-Host "4. Busca tu usuario 'gabriel13iturre'" -ForegroundColor White
Write-Host "5. Haz clic en 'Edit' (lápiz)" -ForegroundColor White
Write-Host "6. Haz clic en 'Edit Password'" -ForegroundColor White
Write-Host "7. Establece una nueva contraseña (ejemplo: Futbol2024!)" -ForegroundColor White
Write-Host "8. Haz clic en 'Update User'" -ForegroundColor White

Write-Host "`n🌐 Verificar Network Access:" -ForegroundColor Yellow
Write-Host "1. Ve a 'Network Access' en el menú lateral" -ForegroundColor White
Write-Host "2. Verifica que tengas '0.0.0.0/0' configurado" -ForegroundColor White
Write-Host "3. Si no está, haz clic en 'Add IP Address'" -ForegroundColor White
Write-Host "4. Selecciona 'Allow Access from Anywhere'" -ForegroundColor White

Write-Host "`n📝 Actualizar variables de entorno en Render:" -ForegroundColor Yellow
Write-Host "1. Ve a tu proyecto en Render" -ForegroundColor White
Write-Host "2. Ve a 'Environment'" -ForegroundColor White
Write-Host "3. Actualiza MONGODB_URI con la nueva contraseña:" -ForegroundColor White
Write-Host "   mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB?retryWrites=true`&w=majority" -ForegroundColor Cyan

Write-Host "`n🧪 Probar conexión localmente:" -ForegroundColor Yellow
Write-Host "1. Crea un archivo .env en el backend con:" -ForegroundColor White
Write-Host "   MONGODB_URI=mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB?retryWrites=true`&w=majority" -ForegroundColor Cyan
Write-Host "   PORT=3000" -ForegroundColor Cyan
Write-Host "   NODE_ENV=development" -ForegroundColor Cyan

Write-Host "`n2. Ejecuta el test de conexión:" -ForegroundColor White
Write-Host "   node test-connection.js" -ForegroundColor Cyan

Write-Host "`n3. Si funciona localmente, redeploya en Render:" -ForegroundColor White
Write-Host "   - Ve a tu proyecto en Render" -ForegroundColor White
Write-Host "   - Haz clic en 'Manual Deploy'" -ForegroundColor White
Write-Host "   - Selecciona 'Deploy latest commit'" -ForegroundColor White

Write-Host "`n✅ Después de estos pasos, tu backend debería funcionar correctamente!" -ForegroundColor Green
Write-Host "🔗 URL de tu API: https://tu-proyecto.onrender.com" -ForegroundColor Cyan

Read-Host "`nPresiona Enter para continuar..." 