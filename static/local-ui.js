console.log("Local UI script loaded");

// Configuration
const chatbotURL = '/InsuranceRecommendation';
const botName = 'Comparabot';
const chatTitle = 'Comparabot Insurance Finder';
const avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png'; // Placeholder avatar

// Product image data (same as original) Example: https://storage.googleapis.com/images-mobilab/product_sheet_01.jpg
const productImageData = [
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_01.jpg',
        alertText: 'Professional Insurance Option 1'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_02.jpg',
        alertText: 'Professional Insurance Option 2'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_03.jpg',
        alertText: 'Professional Insurance Option 3'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_04.jpg',
        alertText: 'Professional Insurance Option 4'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_05.jpg',
        alertText: 'Professional Insurance Option 5'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_06.jpg',
        alertText: 'Professional Insurance Option 6'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_07.jpg',
        alertText: 'Professional Insurance Option 7'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_08.jpg',
        alertText: 'Professional Insurance Option 8'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_09.jpg',
        alertText: 'Professional Insurance Option 9'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_10.jpg',
        alertText: 'Professional Insurance Option 10'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_11.jpg',
        alertText: 'Professional Insurance Option 11'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_12.jpg',
        alertText: 'Professional Insurance Option 12'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_13.jpg',
        alertText: 'Professional Insurance Option 13'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_14.jpg',
        alertText: 'Professional Insurance Option 14'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_15.jpg',
        alertText: 'Professional Insurance Option 15'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/product_sheet_16.jpg',
        alertText: 'Professional Insurance Option 16'
    }
];

// Colors - Professional Palette
const chatHeaderFontColor = "#FFFFFF";          // White text

// Internal variables
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
let chatHistory = "";
let chatHistoryJson = [];
let handoverStylesInjected = false;
let globalStylesInjected = false;
let isSending = false;
let sendButtonElement = null;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function injectGlobalStyles() {
    if (globalStylesInjected) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'local-ui-global-styles';
    style.textContent = `
        :root {
            color-scheme: light;
            --chat-shell-background: radial-gradient(circle at 20% 20%, rgba(60, 58, 189, 0.08), transparent 55%),
                radial-gradient(circle at 80% 0%, rgba(60, 58, 189, 0.06), transparent 45%),
                #f5f7fb;
            --chat-surface: #ffffff;
            --chat-border: rgba(32, 38, 50, 0.08);
            --chat-shadow: 0 32px 60px rgba(15, 23, 42, 0.15);
            --accent-primary: #3c3abd;
            --accent-secondary: #4f4cd7;
            --text-primary: #111322;
            --text-secondary: rgba(17, 19, 34, 0.72);
            --bot-message-surface: rgba(60, 58, 189, 0.06);
            --system-message-surface: rgba(17, 19, 34, 0.06);
            --step-background: rgba(255, 255, 255, 0.82);
        }

        body.chatgpt-inspired-body {
            margin: 0;
            min-height: 100vh;
            padding: clamp(16px, 4vw, 48px);
            display: flex;
            justify-content: center;
            align-items: center;
            background: var(--chat-shell-background);
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
            color: var(--text-primary);
        }

        #chat-container.chat-shell {
            width: min(900px, 100%);
            border-radius: 24px;
            background: var(--chat-surface);
            box-shadow: var(--chat-shadow);
            border: 1px solid var(--chat-border);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(8px);
        }

        .chat-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: clamp(18px, 4vw, 28px);
            background: linear-gradient(135deg, rgba(60, 58, 189, 0.95), rgba(41, 118, 221, 0.92));
            color: ${chatHeaderFontColor};
        }

        .chat-header-avatar {
            width: clamp(48px, 6vw, 64px);
            height: clamp(48px, 6vw, 64px);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.2);
            display: grid;
            place-items: center;
            overflow: hidden;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }

        .chat-header-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .chat-header-copy {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .chat-header-title {
            font-size: clamp(1.15rem, 3vw, 1.4rem);
            font-weight: 600;
            letter-spacing: 0.01em;
        }

        .chat-header-subtitle {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem);
            opacity: 0.82;
        }

        #chat-window.chat-scroll-region {
            display: flex;
            flex-direction: column;
            gap: clamp(12px, 2.6vw, 18px);
            padding: clamp(18px, 4vw, 32px);
            background: var(--chat-surface);
            overflow-y: auto;
            max-height: min(70vh, 640px);
        }

        #chat-window.chat-scroll-region::-webkit-scrollbar {
            width: 10px;
        }

        #chat-window.chat-scroll-region::-webkit-scrollbar-thumb {
            background: rgba(60, 58, 189, 0.25);
            border-radius: 8px;
        }

        .message {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: clamp(14px, 3vw, 18px);
            border-radius: 18px;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
            max-width: min(640px, 92%);
            animation: messageIn 0.35s ease;
            position: relative;
            isolation: isolate;
        }

        .user-message {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: #ffffff;
        }

        .bot-message {
            align-self: flex-start;
            background: var(--bot-message-surface);
            color: var(--text-primary);
        }

        .bot-message.recommendation {
            background: linear-gradient(135deg, rgba(60, 58, 189, 0.08), rgba(30, 147, 255, 0.1));
            border: 1px solid rgba(60, 58, 189, 0.12);
        }

        .system-message {
            align-self: center;
            background: var(--system-message-surface);
            color: var(--text-secondary);
            box-shadow: none;
            padding-inline: clamp(16px, 4vw, 28px);
            text-align: center;
        }

        .message-label {
            font-size: 0.75rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 600;
            opacity: 0.7;
        }

        .user-message .message-label {
            opacity: 0.9;
        }

        .message-body {
            font-size: clamp(0.9rem, 2.6vw, 1.05rem);
            line-height: 1.6;
            color: inherit;
        }

        .message-body ul {
            margin: 0;
            padding-left: 1.1rem;
            display: grid;
            gap: 6px;
        }

        .message-body p {
            margin: 0;
        }

        .message-body a {
            color: var(--accent-primary);
            text-decoration: underline;
            font-weight: 500;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }

        .message-body a:hover,
        .message-body a:focus {
            color: var(--accent-secondary);
            text-decoration: none;
        }

        .typing-indicator {
            align-self: flex-start;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            border-radius: 14px;
            background: rgba(60, 58, 189, 0.08);
            box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
            color: var(--text-secondary);
        }

        .typing-dots {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: var(--accent-primary);
            opacity: 0.2;
            animation: typingPulse 1.3s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.16s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.32s;
        }

        #input-row.chat-input-row {
            display: flex;
            gap: 12px;
            padding: clamp(16px, 4vw, 24px);
            background: rgba(60, 58, 189, 0.03);
            border-top: 1px solid rgba(60, 58, 189, 0.08);
        }

        #user-input.chat-input {
            flex: 1 1 auto;
            min-width: 0;
            border-radius: 14px;
            border: 1px solid rgba(17, 19, 34, 0.12);
            padding: 14px 18px;
            font-size: 1rem;
            line-height: 1.4;
            background: #ffffff;
            color: var(--text-primary);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
        }

        #user-input.chat-input:focus {
            outline: none;
            border-color: rgba(60, 58, 189, 0.48);
            box-shadow: 0 0 0 4px rgba(60, 58, 189, 0.12);
        }

        #user-input.chat-input::placeholder {
            color: rgba(17, 19, 34, 0.45);
        }

        #send-button.chat-send-button {
            flex: 0 0 auto;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: #ffffff;
            border: none;
            padding: 0 clamp(18px, 3vw, 26px);
            font-size: 1rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            min-height: 48px;
            transition: transform 0.18s ease, box-shadow 0.2s ease;
            position: relative;
        }

        #send-button.chat-send-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 36px rgba(60, 58, 189, 0.25);
        }

        #send-button.chat-send-button:disabled {
            opacity: 0.65;
            cursor: wait;
            box-shadow: none;
        }

        #send-button.chat-send-button.is-loading::after {
            content: '';
            position: absolute;
            right: clamp(12px, 3vw, 18px);
            width: 16px;
            height: 16px;
            border-radius: 999px;
            border: 2px solid rgba(255, 255, 255, 0.45);
            border-top-color: #ffffff;
            animation: spinner 0.75s linear infinite;
        }

        .handover-message {
            background: rgba(60, 58, 189, 0.05);
            border: 1px solid rgba(60, 58, 189, 0.12);
        }

        .handover-sequence {
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: handoverFadeIn 0.32s ease;
        }

        .handover-title {
            font-weight: 600;
            font-size: clamp(0.95rem, 2.8vw, 1.1rem);
            color: var(--accent-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .handover-title::before {
            content: '🤝';
            font-size: 1.1rem;
        }

        .handover-subtitle {
            font-size: clamp(0.82rem, 2.3vw, 0.94rem);
            color: rgba(17, 19, 34, 0.7);
        }

        .handover-steps {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding-left: 32px;
        }

        .handover-steps::before {
            content: '';
            position: absolute;
            left: 8px;
            top: 6px;
            bottom: 6px;
            width: 2px;
            background: rgba(60, 58, 189, 0.14);
        }

        .handover-step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            position: relative;
            opacity: 0.35;
            transform: translateY(4px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            color: var(--text-secondary);
            font-size: clamp(0.85rem, 2.2vw, 0.95rem);
        }

        .handover-step-marker {
            position: absolute;
            left: -32px;
            top: 2px;
            width: 16px;
            height: 16px;
            border-radius: 999px;
            border: 2px solid rgba(60, 58, 189, 0.28);
            background: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        .handover-step-marker::after {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 999px;
            border: 2px solid rgba(60, 58, 189, 0.22);
            opacity: 0;
            transform: scale(0.7);
            transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .handover-step-label {
            flex: 1 1 auto;
        }

        .handover-step.active {
            opacity: 1;
            transform: translateY(0);
            color: var(--text-primary);
        }

        .handover-step.active .handover-step-marker {
            border-color: var(--accent-primary);
            background: var(--accent-primary);
            box-shadow: 0 0 0 6px rgba(60, 58, 189, 0.08);
        }

        .handover-step.active .handover-step-marker::after {
            opacity: 1;
            transform: scale(1);
            animation: handoverPulse 1.8s ease-in-out infinite;
        }

        .handover-step.completed {
            opacity: 0.9;
            transform: translateY(0);
        }

        .handover-step.completed .handover-step-marker {
            border-color: var(--accent-primary);
            background: var(--accent-primary);
            box-shadow: none;
        }

        .handover-step.completed .handover-step-marker::after {
            opacity: 0;
            animation: none;
        }

        .handover-step.completed .handover-step-marker::before {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -54%);
            color: #ffffff;
            font-size: 0.55rem;
            font-weight: 600;
        }

        .handover-message.handover-complete {
            background: rgba(60, 58, 189, 0.04);
        }

        @keyframes handoverPulse {
            0% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: 0;
                transform: scale(1.3);
            }

            100% {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes messageIn {
            from {
                opacity: 0;
                transform: translateY(8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes typingPulse {
            0%, 100% {
                opacity: 0.2;
                transform: translateY(0);
            }
            40% {
                opacity: 1;
                transform: translateY(-3px);
            }
        }

        @keyframes spinner {
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes handoverFadeIn {
            from {
                opacity: 0;
                transform: translateY(16px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes shimmer {
            0% {
                transform: translateX(-60%);
            }
            100% {
                transform: translateX(60%);
            }
        }

        @keyframes carouselGlow {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .message,
            .handover-sequence,
            .handover-step,
            .typing-indicator {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
            }
        }
    `;

    document.head.appendChild(style);
    globalStylesInjected = true;
}

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function sanitizeHTML(value) {
    const template = document.createElement('template');
    template.innerHTML = value;

    const allowedElements = new Set(['P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'A', 'SPAN']);
    const allowedAnchorAttributes = new Set(['href', 'target', 'rel', 'onclick', 'title']);

    const walk = node => {
        const childNodes = Array.from(node.childNodes);
        for (const child of childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!allowedElements.has(child.tagName)) {
                    while (child.firstChild) {
                        node.insertBefore(child.firstChild, child);
                    }
                    child.remove();
                    continue;
                }

                if (child.tagName === 'A') {
                    const href = child.getAttribute('href');
                    if (href && /^\s*javascript:/i.test(href)) {
                        child.removeAttribute('href');
                    }

                    if (href && /^https?:/i.test(href) && !child.hasAttribute('target')) {
                        child.setAttribute('target', '_blank');
                        child.setAttribute('rel', 'noopener');
                    }

                    Array.from(child.attributes).forEach(attr => {
                        if (!allowedAnchorAttributes.has(attr.name)) {
                            child.removeAttribute(attr.name);
                        }
                    });
                } else {
                    Array.from(child.attributes).forEach(attr => {
                        child.removeAttribute(attr.name);
                    });
                }

                walk(child);
            } else if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
            }
        }
    };

    walk(template.content);
    return template.innerHTML;
}

function formatMessageContent(value) {
    const normalized = String(value ?? '').replace(/\r\n?/g, '\n');
    if (!normalized.trim()) {
        return '';
    }

    const paragraphs = normalized.split(/\n{2,}/).map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) {
            return '';
        }

        const containsHTML = /<[^>]+>/.test(trimmed);
        if (containsHTML) {
            return trimmed;
        }

        const lines = trimmed.split(/\n/);
        const bulletLines = lines.every(line => /^[-*]\s+/.test(line.trim()));

        if (bulletLines) {
            const items = lines
                .map(line => line.trim().replace(/^[-*]\s+/, ''))
                .filter(Boolean)
                .map(item => `<li>${escapeHTML(item)}</li>`)
                .join('');
            return `<ul>${items}</ul>`;
        }

        const escapedLines = lines.map(line => escapeHTML(line));
        return `<p>${escapedLines.join('<br>')}</p>`;
    }).filter(Boolean);

    return sanitizeHTML(paragraphs.join(''));
}

function createMessageElement(role, content, agentType) {
    const wrapper = document.createElement('div');
    const normalizedRole = role === 'assistant' ? 'bot' : role;
    wrapper.className = `message ${normalizedRole}-message`;

    if (normalizedRole === 'bot' && agentType === 'recommendation') {
        wrapper.classList.add('recommendation');
    }

    const label = document.createElement('div');
    label.className = 'message-label';

    if (normalizedRole === 'user') {
        label.textContent = 'You';
    } else if (agentType === 'recommendation') {
        label.textContent = 'Recommendation Agent';
    } else {
        label.textContent = 'Information Agent';
    }

    const body = document.createElement('div');
    body.className = 'message-body';
    body.innerHTML = formatMessageContent(content);

    wrapper.appendChild(label);
    wrapper.appendChild(body);

    return wrapper;
}

function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';

    const label = document.createElement('span');
    label.textContent = `${botName} is thinking`;

    const dots = document.createElement('div');
    dots.className = 'typing-dots';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'typing-dot';
        dots.appendChild(dot);
    }

    indicator.appendChild(label);
    indicator.appendChild(dots);

    return indicator;
}

function setupLayout() {
    injectGlobalStyles();
    document.body.classList.add('chatgpt-inspired-body');

    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.classList.add('chat-shell');
    }

    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.add('chat-scroll-region');
    }

    const inputRow = document.getElementById('input-row');
    if (inputRow) {
        inputRow.classList.add('chat-input-row');
    }

    const input = document.getElementById('user-input');
    if (input) {
        input.classList.add('chat-input');
        input.setAttribute('placeholder', 'Ask for personalized insurance guidance…');
    }

    const button = document.getElementById('send-button');
    if (button) {
        button.classList.add('chat-send-button');
        sendButtonElement = button;
    }
}

function addChatHeader() {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow || chatWindow.previousElementSibling?.classList.contains('chat-header')) {
        return;
    }

    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';

    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'chat-header-avatar';

    const avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + ' Avatar';
    avatarWrapper.appendChild(avatar);

    const copyWrapper = document.createElement('div');
    copyWrapper.className = 'chat-header-copy';

    const title = document.createElement('div');
    title.className = 'chat-header-title';
    title.textContent = chatTitle;

    const subtitle = document.createElement('div');
    subtitle.className = 'chat-header-subtitle';
    subtitle.textContent = 'Powered by multi-agent intelligence';

    copyWrapper.appendChild(title);
    copyWrapper.appendChild(subtitle);

    chatHeader.appendChild(avatarWrapper);
    chatHeader.appendChild(copyWrapper);

    chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
}

async function sendMessage() {
    if (isSending) {
        return;
    }

    const inputField = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    if (!inputField || !chatWindow) {
        return;
    }

    const userMessage = inputField.value.trim();
    if (!userMessage) {
        return;
    }

    const timestamp = new Date().toISOString();

    chatHistory += "User: " + userMessage + "\n";
    chatHistoryJson.push({
        role: "user",
        content: userMessage,
        timestamp: timestamp
    });

    const userMessageDiv = createMessageElement('user', userMessage);
    chatWindow.appendChild(userMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    inputField.value = '';
    inputField.focus();

    const typingIndicator = createTypingIndicator();
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (!sendButtonElement) {
        sendButtonElement = document.getElementById('send-button');
    }

    if (sendButtonElement) {
        sendButtonElement.disabled = true;
        sendButtonElement.classList.add('is-loading');
    }

    isSending = true;

    try {
        const requestData = {
            message: chatHistoryJson,
            session_id: sessionId,
            qualtrics_response_id: "LOCAL_DEBUG"
        };

        console.log("Sending request:", JSON.stringify(requestData, null, 2));

        const response = await fetch(chatbotURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        if (response.ok) {
            const data = await response.json();
            const botTimestamp = new Date().toISOString();
            const responses = Array.isArray(data.response) ? data.response : [data.response];
            const isHandoff = responses.length > 1;

            console.log("Received response:", data.response);
            console.log("Processed responses:", responses);
            console.log("Is handoff:", isHandoff);

            for (let i = 0; i < responses.length; i++) {
                const messageContent = responses[i];
                const agentType = isHandoff && i === 1 ? 'recommendation' : 'collector';

                if (i > 0) {
                    await wait(650);
                }

                chatHistory += "Agent: " + messageContent + "\n";
                chatHistoryJson.push({
                    role: "assistant",
                    content: messageContent,
                    timestamp: botTimestamp
                });

                const botMessageDiv = createBotMessage(messageContent, agentType);
                chatWindow.appendChild(botMessageDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;

                if (isHandoff && i === 0) {
                    await showHandoffSequence(chatWindow);
                }
            }
        } else {
            showErrorMessage("Error from server.<br>Status code: " + response.status);
            console.error("Error from server: " + response.status);
        }
    } catch (error) {
        showErrorMessage("Network error: " + error.message);
        console.error("Network error: ", error);
    } finally {
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        if (sendButtonElement) {
            sendButtonElement.disabled = false;
            sendButtonElement.classList.remove('is-loading');
        }

        isSending = false;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function addSystemMessage(message) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    const systemMessageDiv = document.createElement('div');
    systemMessageDiv.className = 'message system-message';

    const body = document.createElement('div');
    body.className = 'message-body';
    body.innerHTML = `<em>${escapeHTML(message)}</em>`;

    systemMessageDiv.appendChild(body);
    chatWindow.appendChild(systemMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function injectHandoverStyles() {
    if (!handoverStylesInjected) {
        handoverStylesInjected = true;
    }
}

async function showHandoffSequence(chatWindowOverride) {
    injectHandoverStyles();

    const chatWindow = chatWindowOverride || document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    const handoverMessage = document.createElement('div');
    handoverMessage.className = 'message bot-message handover-message';

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'Agent Handoff';

    const body = document.createElement('div');
    body.className = 'message-body';

    const sequenceContainer = document.createElement('div');
    sequenceContainer.className = 'handover-sequence';

    const title = document.createElement('div');
    title.className = 'handover-title';
    title.textContent = 'Handing over';

    const subtitle = document.createElement('div');
    subtitle.className = 'handover-subtitle';
    subtitle.textContent = "We're routing your conversation to the right specialist.";

    const stepsWrapper = document.createElement('div');
    stepsWrapper.className = 'handover-steps';

    const steps = [
        { label: 'Handing over to Insurance Specialist' },
        { label: 'Thinking' },
        { label: 'Getting top recommendation' }
    ];

    const stepElements = steps.map(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'handover-step';
        const marker = document.createElement('span');
        marker.className = 'handover-step-marker';
        marker.setAttribute('aria-hidden', 'true');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'handover-step-label';
        labelSpan.textContent = step.label;

        stepElement.appendChild(marker);
        stepElement.appendChild(labelSpan);
        stepsWrapper.appendChild(stepElement);

        return {
            element: stepElement
        };
    });

    sequenceContainer.appendChild(title);
    sequenceContainer.appendChild(subtitle);
    sequenceContainer.appendChild(stepsWrapper);
    body.appendChild(sequenceContainer);
    handoverMessage.appendChild(label);
    handoverMessage.appendChild(body);
    chatWindow.appendChild(handoverMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    for (let i = 0; i < stepElements.length; i++) {
        const currentStep = stepElements[i];
        await wait(i === 0 ? 200 : 850);
        currentStep.element.classList.add('active');

        if (i > 0) {
            const previousStep = stepElements[i - 1];
            previousStep.element.classList.remove('active');
            previousStep.element.classList.add('completed');
        }

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    await wait(850);

    const lastStep = stepElements[stepElements.length - 1];
    lastStep.element.classList.remove('active');
    lastStep.element.classList.add('completed');

    sequenceContainer.classList.add('handover-finished');
    handoverMessage.classList.add('handover-complete');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createBotMessage(content, agentType = 'collector') {
    return createMessageElement('assistant', content, agentType);
}

function showErrorMessage(message) {
    applyCustomAlertStyles();
    const chatWindow = document.getElementById('chat-window');

    const alertBox = document.createElement("div");
    alertBox.id = "customAlertBox";
    alertBox.className = "custom-alert";

    const alertContent = document.createElement("div");
    alertContent.className = "custom-alert-content";

    const closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => alertBox.remove();

    const alertMessage = document.createElement("p");
    alertMessage.id = "alertMessage";
    alertMessage.style.color = "#b60000";
    alertMessage.innerHTML = message;

    alertContent.appendChild(closeButton);
    alertContent.appendChild(alertMessage);
    alertBox.appendChild(alertContent);
    chatWindow.appendChild(alertBox);

    alertBox.style.display = "flex";
}

function applyCustomAlertStyles() {
    if (document.getElementById('custom-alert-styles')) {
        return;
    }

    const customAlertStyle = document.createElement("style");
    customAlertStyle.id = 'custom-alert-styles';
    customAlertStyle.innerHTML = `
        .custom-alert {
            display: none;
            position: absolute;
            justify-content: center;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.4);
        }
        .custom-alert-content {
            background-color: #fefefe;
            padding: 20px;
            border: 1px solid #888;
            width: 25%;
            height: 10%;
            top: 10%;
            border-radius: 8px;
            position: relative;
        }
        .custom-alert-content p {
            background: white;
            padding: 20px;
            border-radius: 8px;
            font-size: 18px;
            text-align: center;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(customAlertStyle);
}

// Product recommendation functions (same as original)
function showRecommendation(productNumber) {
    // Implementation for showing product recommendation
    alert('Product recommendation: ' + productNumber);
}

function showAllProducts(message) {
    // Implementation for showing all products
    alert('Show all products: ' + message);
}

// Initialize the chat interface
try {
    setupLayout();
    addChatHeader();

    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (userInput.value.trim() !== "") {
                    sendMessage();
                }
            }
        });
    }
} catch (error) {
    showErrorMessage("Error setting up event listeners: " + error.message);
    console.error("Error setting up event listeners: ", error);
}