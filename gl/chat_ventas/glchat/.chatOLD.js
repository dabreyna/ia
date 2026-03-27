const respuestasPredefinidas = [
  {
    tags: ["hola", "buenos dias", "buenas tardes","buenas noches", "saludos"],
    respuesta: "¡Hola!, en Grupo Lotificadora queremos brindarte la mejor experiencia de servicio al cliente. ¿Por favor dime en qué puedo ayudarte hoy?",
  },
  {
    tags: ["hola como estas"],
    respuesta: "¡Hola! Muy bien, gracias. ¿Por favor dime en qué puedo ayudarte hoy?",
  },
  {
    tags: ["informacion", "ventas", "planes", "precios", "info","inf"],
    respuesta: `
                <span style="font-family: Arial; font-size: 14px;">¡Claro! En Grupo Lotificadora contamos con terrenos que incluyen servicios básicos (luz, agua y drenaje) en varias zonas de Mexicali y en el Poblado Los Algodones. A continuación tienes un resumen rápido:</span><br><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">Zona Poniente – Curva Santa Isabel</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">La Gloria</span> – 200 m² – desde $4,861 / mes. Servicios completos.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">El Paraíso</span> – 190 m² – desde $4,618 / mes. Servicios completos.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Joyas del Paraíso 1, 2</span> – 190 m² – $4,618 / mes.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Joyas del Paraíso 3</span> – 190 m² – $3,563 / mes (agua y drenaje en curso).</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Aires del Paraíso 1, 2</span> – 190 m² – $3,958 / mes (agua en curso).</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Aires del Paraíso 3</span> – 190 m² – $3,563 / mes (agua y drenaje en curso).</span><br><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">Zona Oriente – Islas Agrarias A y B</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Oasis</span> – 240 m² – $6,666.67 / mes. Servicios listos para escriturar.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Manantiales</span> – 450 m² – $9,375 / mes. Servicios listos para escriturar, cerca del Aeropuerto Internacional.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Sesvania</span> – 300 m² – $7,291.67 / mes. Servicios listos para escriturar, próximo al Ejido Cuernavaca.</span><br><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">Poblado Los Algodones</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Fraccionamiento Algodones</span> – 180 m² – $3,125 / mes. Servicios completos.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- <span style="font-weight: bold;">Fraccionamiento Valle Fundadores</span> – 180 m² – $3,125 / mes. Servicios a iniciar en 2027.</span><br><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">Financiamiento</span> (sin enganche):<br>
                <span style="font-family: Arial; font-size: 14px;">- GL 120 → 120 mensualidades.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- GL 144 → 144 mensualidades.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- GL Express → 36 mensualidades.</span><br>
                <span style="font-family: Arial; font-size: 14px;">- Pago de contado (un solo pago) con 15 % de descuento.</span><br><br>
                <span style="font-family: Arial; font-size: 14px;">Para avanzar y ofrecerte la mejor opción, <span style="font-weight: bold;">¿en qué zona te interesa?</span> (Islas Agrarias A, B, Ejido Cuernavaca, Curva carretera Santa Isabel o Poblado Los Algodones).</span>
        `,
  },
  {
    tags: ["me gustaria saber que servicios tiene los terrenos","servicios","servicios disponibles","servicios que tiene","servicios que tiene los terrenos","servicios disponibles"],
     respuesta: `
                <span style="font-family: Arial; font-size: 14px;">¡Claro! En Grupo Lotificadora todos nuestros terrenos contarán con servicios básicos tales como:</span><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">- Luz</span><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">- Agua</span><br>
                <span style="font-family: Arial; font-size: 14px; font-weight: bold;">- Drenaje(Biodigestor)</span><br><br>
                <span style="font-family: Arial; font-size: 14px;"> Algunas de nuestras ubicaciones ya cuentan con todos los servicios disponibles, otras están en progreso. Para avanzar y ofrecerte la mejor opción, <span style="font-weight: bold;">¿en qué zona te interesa?</span> (Islas Agrarias A, B, Ejido Cuernavaca, Curva carretera Santa Isabel o Poblado Los Algodones).</span>
        `,
  },
  // {
  //   tags: ["ubicacion", "donde estan", "oficinas", "mapa", "mexicali"],
  //   respuesta:
  //     "Nuestras oficinas están en Mexicali. También puedes ver los terrenos en Google Maps.",
  // },
];

const opcionesFuse = {
  includeScore: true,
  threshold: 0.4, // 0.0 es coincidencia exacta, 1.0 coincide con todo. 0.4 es el punto dulce.
  keys: ["tags"], // Buscaremos dentro del arreglo de 'tags'
};
const fuse = new Fuse(respuestasPredefinidas, opcionesFuse);

function verificarRespuestaLocal(mensajeCliente) {
  const resultado = fuse.search(mensajeCliente);

  if (resultado.length > 0) {
    // Obtenemos el mejor resultado (el primero)
    const mejorCoincidencia = resultado[0].item;
    console.log("Coincidencia encontrada con score:", resultado[0].score);
    console.log("Respuesta encontrada:", mejorCoincidencia.respuesta);

    //mostrarEnPantalla(mejorCoincidencia.respuesta);
    //return true; // Mensaje resuelto localmente
    return mejorCoincidencia.respuesta;
  }

  //return false; // No hay coincidencia clara, enviar a n8n
  return null;
}

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
      "session-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11)
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
    // const n8nWebhookUrl = "http://localhost:5678/webhook/chatgl";

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

    const respuestaLocal = verificarRespuestaLocal(userMessage);
    if (respuestaLocal) {
      this.addMessage(respuestaLocal, "bot");
      return;
    }

    // if(verificarRespuestaLocal(userMessage)) {
    //     this.addMessage(mejorCoincidencia.respuesta, "bot");
    //     return;
    // }

    await this.showTypingIndicator();

    try {
      const payload = {
        message: text,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        isExistingCustomer: this.getIsExistingCustomer(), // Enviamos el booleano directo
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: "ontouchstart" in window,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
        deviceMemory: navigator.deviceMemory || "unknown",
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
    await new Promise((resolve) => setTimeout(resolve, 10));
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
