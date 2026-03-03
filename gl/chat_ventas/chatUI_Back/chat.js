class ChatClient {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingStartTime = null;
        this.audioBlob = null;
        this.audioUrl = null;
        this.currentAudio = null;
        
        this.initElements();
        this.initEventListeners();
        this.initSession();
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    initElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.stopRecordBtn = document.getElementById('stopRecordBtn');
        this.fileInput = document.getElementById('fileInput');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.recordingTime = document.getElementById('recordingTime');
        this.attachmentPreview = document.getElementById('attachmentPreview');
        this.attachmentName = document.getElementById('attachmentName');
        this.removeAttachment = document.getElementById('removeAttachment');
    }

    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });

        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordBtn.addEventListener('click', () => this.stopRecording());
        
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.removeAttachment.addEventListener('click', () => this.removeAttachment_());
    }

    initSession() {
        const storedSession = localStorage.getItem('chatSessionId');
        if (storedSession) {
            this.sessionId = storedSession;
        } else {
            localStorage.setItem('chatSessionId', this.sessionId);
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
            
            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
                stream.getTracks().forEach(track => track.stop());
                this.showRecordingComplete();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.recordBtn.style.display = 'none';
            this.stopRecordBtn.style.display = 'flex';
            this.recordingStatus.style.display = 'flex';
            this.messageInput.disabled = true;
            
            this.updateRecordingTime();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.addMessage('Error: No se pudo acceder al micrófono. Por favor verifica los permisos.', 'bot');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            this.recordBtn.style.display = 'flex';
            this.stopRecordBtn.style.display = 'none';
            this.recordingStatus.style.display = 'none';
            this.messageInput.disabled = false;
        }
    }

    updateRecordingTime() {
        if (!this.isRecording) return;
        
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.recordingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeout(() => this.updateRecordingTime(), 1000);
    }

    showRecordingComplete() {
        const previewMsg = document.createElement('div');
        previewMsg.className = 'message user-message';
        previewMsg.innerHTML = `
            <div class="message-content">
                <audio controls src="${this.audioUrl}"></audio>
            </div>
            <span class="timestamp">Ahora</span>
        `;
        this.chatMessages.appendChild(previewMsg);
        this.scrollToBottom();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.attachmentName.textContent = file.name;
        this.attachmentPreview.style.display = 'flex';
        
        if (file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.audioBlob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    removeAttachment_() {
        this.fileInput.value = '';
        this.attachmentPreview.style.display = 'none';
        this.audioBlob = null;
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (!text && !this.audioBlob) {
            return;
        }

        const userMessage = text || '[Audio]';
        
        this.addMessage(userMessage, 'user', this.audioUrl);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
        this.removeAttachment_();
        
        this.showTypingIndicator();
        
        try {
            const formData = new FormData();
            formData.append('message', text || '');
            formData.append('sessionId', this.sessionId);
            
            if (this.audioBlob) {
                formData.append('audio', this.audioBlob, 'audio.webm');
            }

            if (this.fileInput.files[0]) {
                formData.append('attachment', this.fileInput.files[0]);
            }

            const response = await fetch('api.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.text) {
                this.addMessage(data.text, 'bot');
            }
            
            if (data.audioUrl) {
                this.addAudioMessage(data.audioUrl);
            }
            
            if (data.error) {
                this.addMessage('Error: ' + data.error, 'bot');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', 'bot');
        }
    }

    addMessage(content, sender, audioUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let messageContent = '';
        if (audioUrl) {
            messageContent = `<audio controls src="${audioUrl}"></audio>`;
        } else {
            messageContent = `<p>${this.escapeHtml(content)}</p>`;
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${messageContent}
            </div>
            <span class="timestamp">${timeString}</span>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addAudioMessage(audioUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <audio controls src="${audioUrl}"></audio>
            </div>
            <span class="timestamp">${timeString}</span>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.chatMessages.appendChild(this.typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatClient();
});
