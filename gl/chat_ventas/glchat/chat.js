class ChatClient {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.firstMessage = false;

    this.initElements();
    this.initEventListeners();
    this.initSession();
  }

  generateSessionId() {
    localStorage.clear();
    return (
      "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    );
  }

  initElements() {
    this.chatMessages = document.getElementById("chatMessages");
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.typingIndicator = document.getElementById("typingIndicator");
  }

  initEventListeners() {
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener("input", () => {
      this.messageInput.style.height = "auto";
      this.messageInput.style.height =
        Math.min(this.messageInput.scrollHeight, 120) + "px";
    });
  }

  initSession() {
    const storedSession = localStorage.getItem("chatSessionId");
    if (storedSession) {
      this.sessionId = storedSession;
    } else {
      localStorage.setItem("chatSessionId", this.sessionId);
    }

    if (localStorage.getItem("isExistingCustomer") === null) {
      localStorage.setItem("isExistingCustomer", "false");
    }
  }

  getIsExistingCustomer() {
    return localStorage.getItem("isExistingCustomer") === "true";
  }

  setIsExistingCustomer(value) {
    localStorage.setItem("isExistingCustomer", value.toString());
  }

  async sendMessage() {
    const text = this.messageInput.value.trim();
    const n8nWebhookUrl = "https://n8n.srv655139.hstgr.cloud/webhook/chat";

    if (!text) {
      return;
    }

    const userMessage = text;

    if (this.firstMessage) {
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes("si") ||
        lowerText.includes("si soy") ||
        lowerText.includes("sí") ||
        lowerText.includes("yes") ||
        lowerText.includes("ya soy cliente") ||
        lowerText.includes("soy cliente") ||
        lowerText.includes("tengo un terreno") ||
        lowerText.includes("ya compré") ||
        lowerText.includes("ya tengo") ||
        lowerText.includes("si ya") ||
        lowerText.includes("si ya soy cliente") ||
        lowerText.includes("ya soy")
      ) {
        console.log("SE DETECTO QUE SI ES CLIENTE");
        this.setIsExistingCustomer(true);
      } else if (
        lowerText.includes("no") ||
        lowerText.includes("no soy") ||
        lowerText.includes("aún no") ||
        lowerText.includes("aun no") ||
        lowerText.includes("todavia no") ||
        lowerText.includes("todavía no") ||
        lowerText.includes("no soy") ||
        lowerText.includes("primera vez") ||
        lowerText.includes("es mi primera") ||
        lowerText.includes("nuevo") ||
        lowerText.includes("nueva")
      ) {
        this.setIsExistingCustomer(false);
      }
      this.firstMessage = false;
    }

    this.addMessage(userMessage, "user");
    this.messageInput.value = "";
    this.messageInput.style.height = "auto";

    await this.showTypingIndicator();

    try {
      const payload = {
        message: text,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        isExistingCustomer: this.getIsExistingCustomer(), // Enviamos el booleano directo
      };

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.info(data);

      this.hideTypingIndicator();

      const botResponse = data.output || data.text;

      if (botResponse) {
        this.addMessage(botResponse, "bot");
      } else if (data.message) {
        // A veces n8n devuelve 'message' según el nodo
        this.addMessage(data.message, "bot");
      }

      if (data.error) {
        this.addMessage("Error: " + data.error, "bot");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
        "bot",
      );
    }
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    let messageContent = "";

    // messageContent = `<p>${this.escapeHtml(content)}</p>`;
    messageContent = `${content}`;

    const now = new Date();
    const timeString = now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
            <div class="message-content">
                ${messageContent}
            </div>
            <span class="timestamp">${timeString}</span>
        `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

    async showTypingIndicator() {
      // 1. Se muestra el indicador inmediatamente
      this.typingIndicator.style.display = "flex";
      this.chatMessages.appendChild(this.typingIndicator);
      this.scrollToBottom();

      // 2. "Dura" 2.3 segundos pausando la ejecución aquí
      await new Promise(resolve => setTimeout(resolve, 10));
    }

  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ChatClient();
});
