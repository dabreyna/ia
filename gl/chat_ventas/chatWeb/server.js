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

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes y archivos de audio'));
    }
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

// Servir archivos estáticos
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Endpoint para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`
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
  console.log(`\n🏢 CHAT GRUPO LOTIFICADORA - MODO n8n EXCLUSIVO`);
  console.log(`================================================`);
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`🤖 Workflow: chat.json (REQUERIDO)`);
  console.log(`📋 Webhook: http://localhost:5678/webhook/chat`);
  console.log(`\n🚨 IMPORTANTE: EL CHAT NO FUNCIONARÁ SIN CONFIGURAR n8n`);
  console.log(`\n📋 PASOS OBLIGATORIOS:`);
  console.log(`   1. Abre: http://localhost:5678`);
  console.log(`   2. Importa: chat.json`);
  console.log(`   3. Activa: Toggle ON (esquina superior derecha)`);
  console.log(`   4. Configura: Credenciales (Google, Groq, Email)`);
  console.log(`\n🧪 Para verificar: ./verify-workflow.sh`);
  console.log(`\n⚠️  NO HAY MODO SIMULADO - SOLO FUNCIONA CON n8n`);
  console.log(`\n🎇 Chat GL esperando configuración de n8n...\n`);
});