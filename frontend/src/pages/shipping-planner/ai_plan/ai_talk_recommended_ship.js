const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const toggleIcon = document.getElementById('toggleIcon');
const typingIndicator = document.getElementById('typingIndicator');

// ======= KONFIGURASI N8N =======
const N8N_WEBHOOK_URL = 'https://pojer26018.app.n8n.cloud/webhook-test/recommendationchatbot';

let sessionId = 'session_' + Date.now();

// Toggle chat box
chatToggle.addEventListener('click', function () {
    chatBox.classList.toggle('active');
    chatToggle.classList.toggle('active');
    toggleIcon.textContent = chatBox.classList.contains('active') ? '✕' : '💬';

    if (chatBox.classList.contains('active')) {
        chatInput.focus();
    }
});

// Open chat from sidebar
document.getElementById('openChatMine')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (!chatBox.classList.contains('active')) {
        chatToggle.click();
    }
});

// Fungsi untuk menambah pesan ke chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fungsi untuk mengirim pesan ke n8n
async function sendToN8N(userMessage) {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usermessages: userMessage,   // ← diganti sesuai kebutuhan
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data.response || data.message || data.output || 'Maaf, saya tidak mendapat respons yang valid.';

    } catch (error) {
        console.error('Error connecting to n8n:', error);
        return 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.';
    }
}

// Fungsi untuk mengirim pesan
async function sendMessage() {
    const message = chatInput.value.trim();

    if (message === '') return;

    // Tampilkan pesan user
    addMessage(message, 'user');
    chatInput.value = '';

    // Tampilkan typing indicator
    typingIndicator.classList.add('active');
    sendButton.disabled = true;
    chatInput.disabled = true;

    // Kirim ke n8n dan tunggu response
    const botResponse = await sendToN8N(message);

    // Sembunyikan typing indicator
    typingIndicator.classList.remove('active');

    // Tampilkan response dari bot
    addMessage(botResponse, 'bot');

    // Enable input kembali
    sendButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

chatInput.focus();