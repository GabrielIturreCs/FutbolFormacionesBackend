# 🔧 Solución de Problemas - MongoDB Atlas

## ❌ Error: "bad auth : authentication failed"

### **Paso 1: Resetear la Contraseña en MongoDB Atlas**

1. **Ve a MongoDB Atlas**
   - Accede a https://cloud.mongodb.com
   - Inicia sesión con tu cuenta

2. **Ve a Database Access**
   - En el menú lateral, haz clic en "Database Access"
   - Busca tu usuario `gabriel13iturre`

3. **Edita el Usuario**
   - Haz clic en "Edit" (lápiz)
   - Haz clic en "Edit Password"
   - Establece una nueva contraseña (por ejemplo: `Futbol2024!`)
   - Haz clic en "Update User"

### **Paso 2: Verificar la Cadena de Conexión**

La cadena de conexión debe ser así:
```
mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB?retryWrites=true&w=majority
```

### **Paso 3: Verificar Network Access**

1. **Ve a Network Access**
   - En el menú lateral, haz clic en "Network Access"
   - Verifica que tengas `0.0.0.0/0` (permite acceso desde cualquier IP)

2. **Si no está configurado:**
   - Haz clic en "Add IP Address"
   - Selecciona "Allow Access from Anywhere"
   - Haz clic en "Confirm"

### **Paso 4: Verificar la Base de Datos**

1. **Ve a Database**
   - En el menú lateral, haz clic en "Database"
   - Verifica que la base de datos `futbolDB` existe

2. **Si no existe:**
   - Haz clic en "Browse Collections"
   - Se creará automáticamente cuando el servidor se conecte

### **Paso 5: Actualizar Variables de Entorno en Render**

1. **Ve a tu proyecto en Render**
2. **Ve a Environment**
3. **Actualiza MONGODB_URI con la nueva contraseña:**

```
mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB?retryWrites=true&w=majority
```

### **Paso 6: Verificar el Código del Servidor**

Asegúrate de que tu `server.js` tenga esta configuración:

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
});
```

### **Paso 7: Probar la Conexión Localmente**

1. **Crea un archivo `.env` en el backend:**
```env
MONGODB_URI=mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

2. **Prueba la conexión:**
```bash
cd backend
npm start
```

### **Paso 8: Verificar Logs en Render**

1. **Ve a tu proyecto en Render**
2. **Ve a Logs**
3. **Busca errores específicos de MongoDB**

### **Comandos Útiles para Debugging**

```bash
# Probar conexión con MongoDB Compass
mongodb+srv://gabriel13iturre:NUEVA_CONTRASEÑA@futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB

# Verificar variables de entorno en Render
echo $MONGODB_URI

# Probar conexión con mongo shell
mongosh "mongodb+srv://futbolformacionestopbd.xtuajuh.mongodb.net/futbolDB" --username gabriel13iturre
```

### **Posibles Causas del Error**

1. **Contraseña incorrecta** - Resetear en MongoDB Atlas
2. **Usuario no existe** - Crear nuevo usuario en Database Access
3. **IP no autorizada** - Configurar Network Access
4. **Base de datos no existe** - Se crea automáticamente
5. **Cadena de conexión malformada** - Verificar formato

### **Solución Rápida**

1. **Resetear contraseña en MongoDB Atlas**
2. **Actualizar MONGODB_URI en Render**
3. **Redeployar el proyecto**
4. **Verificar logs**

### **Contacto de Soporte**

Si el problema persiste:
- MongoDB Atlas Support: https://support.mongodb.com
- Render Support: https://render.com/docs/help 