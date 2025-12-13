// ============================================
// KONFIGURASI N8N - UBAH SESUAI WEBHOOK ANDA
// ============================================
const N8N_CONFIG = {
  webhookUrl: "https://pojer26018.app.n8n.cloud/webhook/chatai",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

// Session ID untuk tracking conversation (opsional)
const sessionId =
  "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

// ============================================
// CHAT FUNCTIONALITY
// ============================================
const chatToggle = document.getElementById("chatToggle");
const chatbotPopup = document.getElementById("chatbotPopup");
const closeChat = document.getElementById("closeChat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const statusDot = document.getElementById("statusDot");
const configNotice = document.getElementById("configNotice");

// Check if webhook is configured
if (statusDot) {
  if (N8N_CONFIG.webhookUrl.includes("your-n8n-instance.com")) {
    statusDot.classList.add("error");
  }
}

if (configNotice) {
  if (!N8N_CONFIG.webhookUrl.includes("your-n8n-instance.com")) {
    configNotice.style.display = "none";
  }
}

// Toggle chatbot popup
if (chatToggle && chatbotPopup) {
  chatToggle.addEventListener("click", () => {
    chatbotPopup.classList.toggle("active");
    if (chatbotPopup.classList.contains("active")) {
      if (messageInput) messageInput.focus();
    }
  });
}

// Close chatbot
if (closeChat && chatbotPopup) {
  closeChat.addEventListener("click", () => {
    chatbotPopup.classList.remove("active");
  });
}

// Send message function
async function sendMessage() {
  if (!messageInput || !sendBtn) return;

  const message = messageInput.value.trim();
  if (!message) return;

  // Disable input while processing
  messageInput.disabled = true;
  sendBtn.disabled = true;

  // Add user message to chat
  addMessage(message, "user");
  messageInput.value = "";

  // Show typing indicator
  showTypingIndicator();

  try {
    // Call N8N webhook
    const response = await callN8NWebhook(message);

    // Hide typing indicator
    hideTypingIndicator();

    // Add bot response
    if (response && response.message) {
      addMessage(response.message, "bot");
    } else if (response && response.output) {
      // Alternative response format
      addMessage(response.output, "bot");
    } else if (typeof response === "string") {
      addMessage(response, "bot");
    } else {
      addMessage(
        "Maaf, saya menerima respons yang tidak valid dari server.",
        "error"
      );
    }
  } catch (error) {
    hideTypingIndicator();
    console.error("Error:", error);
    addMessage(
      "Maaf, terjadi kesalahan saat menghubungi AI agent. Pastikan N8N webhook sudah dikonfigurasi dengan benar.",
      "error"
    );
  } finally {
    // Re-enable input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Call N8N Webhook
async function callN8NWebhook(userMessage) {
  // Prepare request payload - sesuaikan dengan format yang dibutuhkan N8N Anda
  const payload = {
    message: userMessage,
    sessionId: sessionId,
    timestamp: new Date().toISOString(),
    user: "Nino",
    // Tambahkan field lain yang dibutuhkan workflow N8N Anda
    context: {
      source: "shipping_planner_dashboard",
      language: "id",
    },
  };

  const response = await fetch(N8N_CONFIG.webhookUrl, {
    method: N8N_CONFIG.method,
    headers: N8N_CONFIG.headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Add message to chat
function addMessage(text, type) {
  if (!chatMessages) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = type === "bot" ? "AI" : type === "error" ? "⚠️" : "U";

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  if (!chatMessages) return;

  const indicator = document.createElement("div");
  indicator.className = "message bot";
  indicator.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "AI";

  const typing = document.createElement("div");
  typing.className = "typing-indicator active";
  typing.innerHTML =
    '<div class="typing-dots"><span></span><span></span><span></span></div>';

  indicator.appendChild(avatar);
  indicator.appendChild(typing);
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) {
    indicator.remove();
  }
}

// Event listeners
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (messageInput) {
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !messageInput.disabled) {
      sendMessage();
    }
  });
}
