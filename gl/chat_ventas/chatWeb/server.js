const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createChat } = require('@n8n/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuración de multer para subir archivos con organización por tipo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'uploads/';
    
    // Determinar el directorio según el tipo de archivo
    if (file.mimetype.startsWith('image/')) {
      uploadDir = 'uploads/fotos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadDir = 'uploads/audios/';
    } else if (file.mimetype === 'application/pdf') {
      uploadDir = 'uploads/documentos/';
    } else if (
      file.mimetype.includes('document') ||
      file.mimetype.includes('officedocument') ||
      file.mimetype.includes('msword') ||
      file.mimetype.includes('vnd.openxmlformats-officedocument')
    ) {
      uploadDir = 'uploads/documentos/';
    }
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    console.log(`📁 Directorio de destino: ${uploadDir} para ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre de archivo único con timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    const filename = `${timestamp}-${randomString}-${baseName}${extension}`;
    console.log(`📝 Nombre de archivo generado: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB límite para documentos
  },
  fileFilter: (req, file, cb) => {
    console.log(`🔍 Archivo recibido: ${file.originalname}`);
    console.log(`📋 MIME Type: ${file.mimetype}`);
    console.log(`📋 Extensión: ${path.extname(file.originalname)}`);
    
    // Extensiones y tipos MIME permitidos
    const allowedImageExtensions = /jpeg|jpg|png|gif|bmp|webp/;
    const allowedImageMimeTypes = /image\/(jpeg|jpg|png|gif|bmp|webp)/;
    
    const allowedAudioExtensions = /mp3|wav|ogg|m4a|webm|flac|aac/;
    const allowedAudioMimeTypes = /audio\/(mp3|wav|ogg|m4a|webm|flac|aac)/;
    
    const allowedDocumentExtensions = /pdf|doc|docx|txt/;
    const allowedDocumentMimeTypes = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/(plain|rtf)/;
    
    // Extensiones y tipos MIME peligrosos (bloqueados)
    const dangerousExtensions = /exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|sh|ps1|py|rb|pl|cgi/;
    const dangerousMimeTypes = /application\/(x-executable|x-msdownload|x-msdos-program|x-sh|x-python|x-ruby|x-perl|x-php|vnd\.ms-cab-compressed|x-zip-compressed|x-gzip-compressed|x-tar|x-rar-compressed)/;
    
    const extname = path.extname(file.originalname).toLowerCase();
    const filename = file.originalname.toLowerCase();
    
    // Bloquear archivos peligrosos
    if (dangerousExtensions.test(extname) || dangerousExtensions.test(filename) || dangerousMimeTypes.test(file.mimetype)) {
      console.log(`🚫 ARCHIVO PELIGROSO BLOQUEADO: ${file.originalname}`);
      return cb(new Error('Tipo de archivo no permitido por seguridad. No se permiten ejecutables, scripts, archivos comprimidos o archivos potencialmente peligrosos.'));
    }
    
    // Permitir imágenes
    if (allowedImageExtensions.test(extname) && allowedImageMimeTypes.test(file.mimetype)) {
      console.log(`✅ Archivo de imagen permitido: ${file.originalname}`);
      return cb(null, true);
    }
    
    // Permitir audios
    if (allowedAudioExtensions.test(extname) && allowedAudioMimeTypes.test(file.mimetype)) {
      console.log(`✅ Archivo de audio permitido: ${file.originalname}`);
      return cb(null, true);
    }
    
    // Permitir documentos
    if (allowedDocumentExtensions.test(extname) && allowedDocumentMimeTypes.test(file.mimetype)) {
      console.log(`✅ Archivo de documento permitido: ${file.originalname}`);
      return cb(null, true);
    }
    
    // Rechazar cualquier otro tipo
    console.log(`❌ Archivo no permitido: ${file.originalname} (MIME: ${file.mimetype}, Ext: ${extname})`);
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: imágenes (JPEG, PNG, GIF, BMP, WebP), audio (MP3, WAV, OGG, M4A, WebM, FLAC, AAC), y documentos (PDF, Word, TXT). No se permiten ejecutables, scripts, archivos comprimidos o archivos potencialmente peligrosos.'));
  }
});

// Configuración del chat de n8n
let chatInstance = null;

const initializeChat = () => {
  // Usar la production URL de n8n para workflow de Grupo Lotificadora
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat';
  console.log(`🏢 Iniciando chat Grupo Lotificadora con webhook: ${webhookUrl}`);
  
  return {
    webhookUrl,
    sendMessage: async (data) => {
      try {
        console.log(`📤 Enviando a webhook GL: ${webhookUrl}`);
        console.log('📋 Datos:', {
          message: data.message,
          sessionId: data.sessionId,
          attachments: data.attachments || []
        });
        
        console.log(`📤 Enviando a webhook GL: ${webhookUrl}`);
        console.log('📋 Datos:', {
          message: data.message,
          sessionId: data.sessionId,
          attachments: data.attachments || []
        });
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: data.message,
            sessionId: data.sessionId,
            attachments: data.attachments || []
          })
        });
        
        console.log(`📥 Status del webhook GL: ${response.status} ${response.statusText}`);
        
        if (response.status === 404) {
          console.log('❌ Error 404: Webhook no encontrado');
          console.log('🔧 Causas posibles:');
          console.log('   - Workflow no está activo');
          console.log('   - Path del webhook incorrecto');
          console.log('   - n8n necesita reiniciar');
        } else if (response.status === 200) {
          console.log('⚠️  Webhook responde 200 pero con JSON vacío/incompleto');
          console.log('🔧 Diagnóstico:');
          console.log('   - Workflow importado pero no activo completamente');
          console.log('   - Nodo "Respuesta Webhook" no configurado');
          console.log('   - Error en ejecución del workflow');
          console.log('   - Credenciales no configuradas');
          console.log('\n📋 Verificar en n8n:');
          console.log('   1. Workflow: Toggle debe estar ON/GREEN');
          console.log('   2. Ejecuciones: Revisa si hay errores');
          console.log('   3. Nodos: Verifica credenciales en cada nodo');
          console.log('   4. Test: Ejecuta workflow manualmente');
        }
        
        console.log(`📥 Respuesta del webhook GL: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error details:', errorText);
          
          // Instrucciones específicas para el workflow GL
          if (errorText.includes('Unused Respond to Webhook')) {
            console.log('\n🔧 SOLUCIÓN: Importa el workflow chat.json en n8n y actívalo');
            console.log('🏗️ El workflow ya incluye: Webhook → Preparar Mensaje → Agentes IA → Respuesta\n');
          }
          
          throw new Error(`Error en webhook GL: ${response.status} - ${errorText}`);
        }
        
        let result;
        try {
          const responseText = await response.text();
          console.log('📝 Respuesta texto:', responseText);
          
          if (!responseText || responseText.trim() === '' || responseText === '{}' || responseText === '[]') {
            console.log('❌ ERROR: Respuesta vacía del webhook GL');
            console.log('\n🚨 DIAGNÓSTICO - WORKFLOW PARCIALMENTE CONFIGURADO');
            console.log('\n📋 ACCIONES REQUERIDAS EN n8n:');
            console.log('   1. Abre: http://localhost:5678');
            console.log('   2. Ve al workflow "Chat GL - Webhook Integration"');
            console.log('   3. Verifica: Toggle ON (debe estar VERDE)');
            console.log('   4. Revisa: Pestaña "Executions" para errores');
            console.log('   5. Configura: Todas las credenciales faltantes');
            console.log('   6. Prueba: Ejecuta workflow manualmente');
            
            throw new Error('WORKFLOW RESPONDE VACÍO - Verificar configuración en n8n');
          }
          
          result = JSON.parse(responseText);
          console.log('✅ Respuesta JSON GL:', result);
        } catch (jsonError) {
          console.log('❌ Error al parsear JSON:', jsonError.message);
          throw new Error('RESPUESTA INVÁLIDA DEL WORKFLOW - Formato incorrecto');
        }
        
        // Procesar respuesta del workflow de Grupo Lotificadora
        if (Array.isArray(result) && result.length > 0 && result[0].json) {
          const agentResponse = result[0].json;
          return {
            text: agentResponse.text || agentResponse.output || 'Respuesta del asistente de Grupo Lotificadora',
            sessionId: agentResponse.sessionId || data.sessionId,
            attachments: agentResponse.attachments || [],
            timestamp: agentResponse.timestamp || new Date(),
            agent: 'Grupo Lotificadora'
          };
        } else if (result.text || result.message || result.output) {
          return {
            text: result.text || result.message || result.output,
            sessionId: result.sessionId || data.sessionId,
            attachments: result.attachments || [],
            timestamp: result.timestamp || new Date(),
            agent: 'Grupo Lotificadora'
          };
        } else {
          // Respuesta por defecto del sistema GL
          return {
            text: 'Gracias por contactar a Grupo Lotificadora. En breve atenderemos tu consulta.',
            sessionId: data.sessionId,
            timestamp: new Date(),
            agent: 'Grupo Lotificadora'
          };
        }
      } catch (error) {
        console.error('❌ Error al enviar mensaje a GL:', error);
        throw error;
      }
    }
  };
};

const n8nChat = initializeChat();

// Crear directorios base si no existen
const baseDirs = ['uploads', 'uploads/fotos', 'uploads/audios', 'uploads/documentos'];
baseDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${dir}`);
  }
});

// Servir archivos estáticos y archivos organizados
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Endpoint para listar archivos (opcional, para debugging)
app.get('/uploads/fotos', (req, res) => {
  listFiles('fotos', res);
});

app.get('/uploads/audios', (req, res) => {
  listFiles('audios', res);
});

app.get('/uploads/documentos', (req, res) => {
  listFiles('documentos', res);
});

app.get('/uploads', (req, res) => {
  listFiles(null, res);
});

// Función helper para listar archivos
function listFiles(type, res) {
  let targetDir = 'uploads/';
  
  if (type && ['fotos', 'audios', 'documentos'].includes(type)) {
    targetDir = `uploads/${type}/`;
  }
  
  try {
    const files = fs.readdirSync(targetDir);
    const fileList = files.map(file => {
      const filePath = path.join(targetDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        url: `/uploads/${type ? type + '/' : ''}${file}`
      };
    });
    
    res.json({
      type: type || 'todos',
      files: fileList,
      total: files.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer directorio: ' + error.message });
  }
}

// Endpoint para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  // Determinar el tipo de archivo para la URL correcta
  let fileType = 'otros';
  if (req.file.mimetype.startsWith('image/')) {
    fileType = 'fotos';
  } else if (req.file.mimetype.startsWith('audio/')) {
    fileType = 'audios';
  } else if (req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('document') || req.file.mimetype.includes('officedocument')) {
    fileType = 'documentos';
  }
  
  const fileUrl = `/uploads/${fileType}/${req.file.filename}`;
  
  console.log(`📎 Archivo guardado exitosamente:`);
  console.log(`   - Nombre original: ${req.file.originalname}`);
  console.log(`   - Tipo: ${fileType}`);
  console.log(`   - URL: ${fileUrl}`);
  console.log(`   - Tamaño: ${(req.file.size / 1024).toFixed(2)} KB`);
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    type: fileType,
    url: fileUrl
  });
});

// WebSocket para comunicación en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  // Enviar mensaje a n8n y recibir respuesta
  socket.on('message', async (data) => {
    try {
      const response = await n8nChat.sendMessage({
        message: data.message,
        sessionId: data.sessionId || socket.id,
        attachments: data.attachments || []
      });
      
      socket.emit('message', {
        type: 'response',
        content: response.text || response.message || 'Sin respuesta de n8n',
        attachments: response.attachments || [],
        timestamp: response.timestamp || new Date()
      });
    } catch (error) {
      console.error('❌ Error con n8n GL:', error);
      socket.emit('error', {
        message: 'Error al conectar con el sistema Grupo Lotificadora',
        error: 'El servicio de atención no está disponible. Por favor intenta más tarde.',
        details: 'Asegúrate que el workflow está importado y activo en n8n.'
      });
    }
  });
  
  // Manejar archivos
  socket.on('file', async (data) => {
    try {
      const response = await n8nChat.sendMessage({
        message: data.message || '',
        sessionId: data.sessionId || socket.id,
        attachments: data.attachments || []
      });
      
      socket.emit('message', {
        type: 'response',
        content: response.text || response.message || 'Archivo procesado por Grupo Lotificadora',
        attachments: response.attachments || [],
        timestamp: response.timestamp || new Date()
      });
    } catch (error) {
      console.error('❌ Error al procesar archivo con n8n GL:', error);
      socket.emit('error', {
        message: 'Error al procesar el archivo',
        error: 'No se pudo conectar con el sistema de archivos de Grupo Lotificadora.',
        details: 'Verifica que el workflow esté activo en n8n.'
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🏢 CHAT GRUPO LOTIFICADORA - ARCHIVOS ORGANIZADOS`);
  console.log(`================================================`);
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`🤖 Workflow: chat_with_session.json`);
  console.log(`📋 Webhook: http://localhost:5678/webhook/chat`);
  console.log(`\n📁 Organización de archivos:`);
  console.log(`   📸 Imágenes → uploads/fotos/`);
  console.log(`   🎤 Audio → uploads/audios/`);
  console.log(`   📄 Documentos → uploads/documentos/`);
  console.log(`\n🔒 Seguridad: Scripts y ejecutables bloqueados`);
  console.log(`\n📂 Listar archivos: http://localhost:${PORT}/uploads/[fotos|audios|documentos]`);
  console.log(`\n📋 PASOS OBLIGATORIOS:`);
  console.log(`   1. Abre: http://localhost:5678`);
  console.log(`   2. Importa: chat_with_session.json`);
  console.log(`   3. Activa: Toggle ON`);
  console.log(`   4. Configura: Groq API`);
  console.log(`\n🧪 Para verificar: ./verify-workflow.sh`);
  console.log(`\n🎇 Chat GL con organización de archivos listo!\n`);
});