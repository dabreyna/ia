class ChatApp {
    constructor() {
        this.socket = io();
        this.sessionId = 'session-' + Date.now();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.initializeElements();
        this.bindEvents();
        this.connectToServer();
    }
    
    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.fileButton = document.getElementById('fileButton');
        this.fileInput = document.getElementById('fileInput');
        this.voiceButton = document.getElementById('voiceButton');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.statusText = document.querySelector('.status-text');
    }
    
    bindEvents() {
        // Enviar mensaje
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Subir archivo
        this.fileButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Grabar audio
        this.voiceButton.addEventListener('click', () => this.toggleRecording());
        
        // Eventos de socket
        this.socket.on('connect', () => this.onConnect());
        this.socket.on('disconnect', () => this.onDisconnect());
        this.socket.on('message', (data) => this.onMessage(data));
        this.socket.on('error', (data) => this.onError(data));
    }
    
    connectToServer() {
        this.statusText.textContent = 'Conectando...';
        this.statusIndicator.classList.remove('connected');
    }
    
    onConnect() {
        this.statusText.textContent = 'Conectado';
        this.statusIndicator.classList.add('connected');
        this.addSystemMessage('Conectado al servidor de chat');
    }
    
    onDisconnect() {
        this.statusText.textContent = 'Desconectado';
        this.statusIndicator.classList.remove('connected');
        this.addSystemMessage('Desconectado del servidor');
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addUserMessage(message);
        this.socket.emit('message', {
            message: message,
            sessionId: this.sessionId
        });
        
        this.messageInput.value = '';
        this.showTypingIndicator();
    }
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Error al subir archivo');
            }
            
            const result = await response.json();
            
            this.addUserMessage(`Archivo enviado: ${result.originalName}`, [{
                type: result.mimetype.startsWith('image/') ? 'image' : 'audio',
                url: result.url,
                originalName: result.originalName,
                mimetype: result.mimetype
            }]);
            
            this.socket.emit('file', {
                message: `Archivo: ${result.originalName}`,
                sessionId: this.sessionId,
                attachments: [result]
            });
            
            this.showTypingIndicator();
            
        } catch (error) {
            this.addSystemMessage(`Error al subir archivo: ${error.message}`, 'error');
        }
        
        this.fileInput.value = '';
    }
    
    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.sendAudioMessage(audioBlob);
                
                // Detener todas las pistas de audio
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.voiceButton.classList.add('recording');
            this.voiceButton.textContent = '⏹️';
            
        } catch (error) {
            console.error('Error al iniciar grabación:', error);
            this.addSystemMessage('No se pudo acceder al micrófono', 'error');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.voiceButton.classList.remove('recording');
            this.voiceButton.textContent = '🎤';
        }
    }
    
    async sendAudioMessage(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, `audio-${Date.now()}.webm`);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Error al subir audio');
            }
            
            const result = await response.json();
            
            this.addUserMessage('Mensaje de voz', [{
                type: 'audio',
                url: result.url,
                originalName: result.originalName,
                mimetype: result.mimetype
            }]);
            
            this.socket.emit('file', {
                message: 'Mensaje de voz',
                sessionId: this.sessionId,
                attachments: [result]
            });
            
            this.showTypingIndicator();
            
        } catch (error) {
            this.addSystemMessage(`Error al enviar audio: ${error.message}`, 'error');
        }
    }
    
    onMessage(data) {
        this.hideTypingIndicator();
        
        // Limpiar y formatear el mensaje del bot
        let cleanMessage = data.content;
        
        // Reemplazar \n literales por saltos de línea reales
        cleanMessage = cleanMessage.replace(/\\n/g, '\n');
        
        // Eliminar caracteres Unicode invisibles/problemáticos
        cleanMessage = cleanMessage.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // Procesar markdown básico (negritas)
        cleanMessage = this.processMarkdown(cleanMessage);
        
        this.addBotMessage(cleanMessage, data.attachments);
    }
    
    // Función para procesar markdown básico
    processMarkdown(text) {
        // Procesar negritas con **texto**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Procesar saltos de línea dobles
        text = text.replace(/\n\n/g, '<br><br>');
        
        // Procesar saltos de línea simples
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    onError(data) {
        this.hideTypingIndicator();
        this.addSystemMessage(data.message, 'error');
    }
    
    addUserMessage(text, attachments = []) {
        this.addMessage(text, 'user', attachments);
    }
    
    addBotMessage(text, attachments = []) {
        this.addMessage(text, 'bot', attachments);
    }
    
    addSystemMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `system-message ${type}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addMessage(text, sender, attachments = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Para mensajes del bot, usar innerHTML para soportar formato
        if (sender === 'bot') {
            contentDiv.innerHTML = text;
        } else {
            contentDiv.textContent = text;
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(contentDiv);
        
        // Agregar archivos adjuntos
        attachments.forEach(attachment => {
            const attachmentDiv = this.createAttachmentElement(attachment, sender);
            contentDiv.appendChild(attachmentDiv);
        });
        
        messageDiv.appendChild(timeDiv);
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    createAttachmentElement(attachment, sender) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'file-attachment';
        
        if (attachment.type === 'image') {
            const img = document.createElement('img');
            img.src = attachment.url;
            img.alt = attachment.originalName;
            img.onclick = () => window.open(attachment.url, '_blank');
            attachmentDiv.appendChild(img);
        } else if (attachment.type === 'audio') {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = attachment.url;
            attachmentDiv.appendChild(audio);
        }
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.textContent = attachment.originalName;
        attachmentDiv.appendChild(fileInfo);
        
        return attachmentDiv;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content loading';
        contentDiv.textContent = 'Escribiendo...';
        
        typingDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Inicializar la aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});