console.log("ST01_UI_simple_decline_handoff.js - Study 1: Simple Decline with Handoff");

// Configuration
const chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
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
const sessionId = 'session_' + (
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9)
);
let chatHistory = "";
let chatHistoryJson = [];
let handoverStylesInjected = false;
let globalStylesInjected = false;
let isSending = false;
let sendButtonElement = null;
let originalRecommendation = null;
let recommendationType = null;
let qualtricsResponseId = "${e://Field/ResponseID}";
let recommendationStylesInjected = false;
let customAlertStylesInjected = false;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resolveQualtricsResponseId() {
    let resolved = qualtricsResponseId;

    if (!resolved || resolved === "${e://Field/ResponseID}") {
        resolved = 'LOCAL_DEBUG';
    }

    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
            const current = Qualtrics.SurveyEngine.getEmbeddedData('ResponseID');
            if (current) {
                resolved = current;
            }
        }
    } catch (error) {
        console.warn('Unable to resolve Qualtrics ResponseID:', error);
    }

    qualtricsResponseId = resolved;
    return resolved;
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
            --accent-tertiary: #2976dd;
            --text-primary: #111322;
            --text-secondary: rgba(17, 19, 34, 0.72);
            --bot-message-surface: rgba(60, 58, 189, 0.06);
            --handover-message-surface: linear-gradient(140deg, rgba(60, 58, 189, 0.08), rgba(41, 118, 221, 0.12));
            --handover-border: rgba(60, 58, 189, 0.28);
            --recommendation-surface: linear-gradient(135deg, rgba(41, 118, 221, 0.08), rgba(30, 147, 255, 0.12));
            --system-message-surface: rgba(17, 19, 34, 0.06);
            --step-background: rgba(255, 255, 255, 0.82);
            --label-pill-radius: 999px;
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
            z-index: 0;
        }

        .message > * {
            position: relative;
            z-index: 1;
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
            border: 1px solid rgba(60, 58, 189, 0.08);
        }

        .bot-message::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(145deg, rgba(60, 58, 189, 0.08), transparent 62%);
            mix-blend-mode: multiply;
            opacity: 0.45;
        }

        .bot-message.recommendation {
            background: var(--recommendation-surface);
            border: 1px solid rgba(41, 118, 221, 0.22);
            box-shadow: 0 24px 48px rgba(41, 118, 221, 0.18);
        }

        .bot-message.recommendation::before {
            background: linear-gradient(160deg, rgba(41, 118, 221, 0.18), transparent 58%);
            mix-blend-mode: normal;
            opacity: 0.4;
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
            font-size: 0.72rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: var(--label-pill-radius);
            background: rgba(17, 19, 34, 0.06);
            color: var(--text-secondary);
            align-self: flex-start;
        }

        .message-label::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0.7;
        }

        .user-message .message-label {
            background: rgba(255, 255, 255, 0.22);
            color: #ffffff;
        }

        .bot-message .message-label {
            background: rgba(60, 58, 189, 0.12);
            color: var(--accent-primary);
        }

        .bot-message.recommendation .message-label {
            background: rgba(41, 118, 221, 0.18);
            color: var(--accent-tertiary);
        }

        .handover-message .message-label {
            background: rgba(60, 58, 189, 0.2);
            color: var(--accent-primary);
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
            background: var(--handover-message-surface);
            border: 1px solid var(--handover-border);
            box-shadow: 0 28px 60px rgba(60, 58, 189, 0.18);
            overflow: hidden;
        }

        .handover-message::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
            mix-blend-mode: normal;
            pointer-events: none;
            opacity: 1;
        }

        .handover-message::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at -20% 0%, rgba(60, 58, 189, 0.18), transparent 50%);
            opacity: 0.3;
            pointer-events: none;
            mix-blend-mode: normal;
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
    const safeValue = value === undefined || value === null ? '' : value;
    return String(safeValue)
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
    const safeValue = value === undefined || value === null ? '' : value;
    const normalized = String(safeValue).replace(/\r\n?/g, '\n');
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
    const previousElement = chatWindow ? chatWindow.previousElementSibling : null;
    if (!chatWindow || (previousElement && previousElement.classList.contains('chat-header'))) {
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
    const resolvedQualtricsId = resolveQualtricsResponseId();

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
            qualtrics_response_id: resolvedQualtricsId
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
                    addSystemMessage('🔄 Handing off → Recommendation Agent');
                    await showHandoffSequence(chatWindow);
                }
            }

            try {
                if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
                    Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
                    Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
                    Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
                    Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', resolvedQualtricsId);
                }
            } catch (error) {
                console.error('Error from Qualtrics: ', error);
                qualtricsResponseId = 'DEBUG';
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
    if (customAlertStylesInjected) {
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
    customAlertStylesInjected = true;
}

function applyCustomRecommendationStyles() {
    if (recommendationStylesInjected) {
        return;
    }

    const css = `
        .custom-recommendation {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 1000;
            background-color: rgba(0, 0, 0, 0.4);
            align-items: center;
            justify-content: center;
        }

        .custom-recommendation-content {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: clamp(320px, 90vw, 60rem);
            max-height: 90vh;
            overflow-y: auto;
            padding: clamp(1rem, 3vw, 2rem);
            margin: clamp(1rem, 5vh, 2.5rem) auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .modal-close-button {
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            color: #666;
            cursor: pointer;
            z-index: 10;
            padding: 5px;
            line-height: 1;
            transition: color 0.3s ease;
        }

        .modal-close-button:hover {
            color: #3c3abd;
        }

        #recommendationMessage {
            color: #000000;
            margin-bottom: clamp(1rem, 3vw, 1.5rem);
            text-align: center;
            font-size: clamp(1.125rem, 2.5vw, 1.5rem);
            line-height: 1.3;
        }

        #image-container {
            margin: clamp(1rem, 4vw, 2rem) 0;
            width: 100%;
            text-align: center;
        }

        #image-container img {
            width: 100%;
            max-width: min(50rem, 90vw);
            display: block;
            margin: 0 auto;
            border-radius: clamp(0.5rem, 1vw, 0.75rem);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .recommendation-buttons {
            display: flex;
            justify-content: center;
            gap: clamp(0.75rem, 2vw, 1.25rem);
            margin-top: clamp(1.25rem, 4vw, 2rem);
            flex-wrap: wrap;
        }

        .custom-recommendation-button {
            padding: clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 4vw, 2rem);
            background-color: #3c3abd;
            color: #FFFFFF;
            border: none;
            border-radius: clamp(0.25rem, 1vw, 0.5rem);
            font-size: clamp(1rem, 2.5vw, 1.125rem);
            cursor: pointer;
            min-height: 44px;
            min-width: 120px;
            transition: background-color 0.3s ease, transform 0.1s ease;
        }

        .custom-recommendation-button:hover {
            background-color: #3A36BC;
            transform: translateY(-1px);
        }

        .custom-recommendation-button:active {
            transform: translateY(0);
        }
    `;

    const style = document.createElement('style');
    style.id = 'custom-recommendation-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
    recommendationStylesInjected = true;
}

function showProductOverlay() {
    applyCustomRecommendationStyles();

    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    const alertBox = document.createElement('div');
    alertBox.id = 'recommendation';
    alertBox.className = 'custom-recommendation';
    alertBox.style.display = 'flex';

    const alertContent = document.createElement('div');
    alertContent.id = 'product-overlay-content';
    alertContent.className = 'custom-recommendation-content';

    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => alertBox.remove();

    const alertMessage = document.createElement('p');
    alertMessage.id = 'recommendationMessage';
    alertMessage.style.color = '#000000';
    alertMessage.innerHTML = 'message';

    const container = document.createElement('div');
    container.id = 'image-container';
    container.style.margin = 'clamp(1rem, 4vw, 2rem) 0';

    alertContent.appendChild(closeButton);
    alertContent.appendChild(alertMessage);
    alertContent.appendChild(container);

    alertBox.appendChild(alertContent);
    chatWindow.appendChild(alertBox);
}

function showRecommendation(productNumber) {
    if (!productNumber) {
        return;
    }

    originalRecommendation = productNumber;
    recommendationType = 'single';

    showProductOverlay();

    const alertMessage = document.getElementById('recommendationMessage');
    if (alertMessage) {
        alertMessage.innerHTML = `Here is your recommended product: ${escapeHTML(String(productNumber))}`;
    }

    const container = document.getElementById('image-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    const product = productImageData[productNumber - 1];
    if (product) {
        const img = document.createElement('img');
        img.src = product.src;
        img.alt = product.alertText || `Recommended product ${productNumber}`;
        img.style.width = '100%';
        img.style.maxWidth = '750px';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        container.appendChild(img);
    }

    const acceptButton = document.createElement('button');
    acceptButton.textContent = '✅Accept';
    acceptButton.className = 'custom-recommendation-button';
    acceptButton.onclick = function () {
        logEvent(`accepted-recommended-product-${productNumber}`, {
            acceptedProduct: productNumber,
            originalRecommendation,
            wasRecommended: true,
            recommendationType
        });

        alert(`You accepted product ${productNumber}!`);
        try {
            document.getElementById('NextButton').click();
        } catch (error) {
            console.warn('Unable to advance survey automatically:', error);
        }
    };

    const declineButton = document.createElement('button');
    declineButton.textContent = '❌Decline';
    declineButton.className = 'custom-recommendation-button';
    declineButton.addEventListener('click', function () {
        logEvent(`declined-recommended-product-${productNumber}`, {
            declinedProduct: productNumber,
            originalRecommendation,
            wasRecommended: true,
            recommendationType
        });

        const recommendationModal = document.getElementById('recommendation');
        if (recommendationModal) {
            recommendationModal.remove();
        }

        alert(`Thank you for your feedback. You have declined product ${productNumber}.`);

        try {
            document.getElementById('NextButton').click();
        } catch (error) {
            console.warn('Unable to advance survey automatically:', error);
        }
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'recommendation-buttons';
    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(declineButton);

    const alertContent = document.getElementById('product-overlay-content');
    if (alertContent) {
        alertContent.appendChild(buttonContainer);
    }

    logEvent(`recommended-product-${productNumber}`, {
        productNumber,
        type: 'single',
        recommendationType: 'single'
    });
}

function logEvent(eventType, details) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        role: 'system',
        content: eventType,
        timestamp,
        details: details || {}
    };

    chatHistory += `System: ${eventType}\n`;
    chatHistoryJson.push(logEntry);

    const resolvedQualtricsId = resolveQualtricsResponseId();

    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
            Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
            Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
            Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
            Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', resolvedQualtricsId);

            const currentRecommended = Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendedProduct') || '';
            const currentAccepted = Qualtrics.SurveyEngine.getJSEmbeddedData('AcceptedProduct') || '';
            const currentWasAccepted = Qualtrics.SurveyEngine.getJSEmbeddedData('WasRecommendationAccepted') || '';
            const currentUserJourney = Qualtrics.SurveyEngine.getJSEmbeddedData('UserJourney') || '';
            const currentRecommendationType = Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendationType') || '';
            const currentRejected = Qualtrics.SurveyEngine.getJSEmbeddedData('RejectedRecommendation') || '';
            const currentDeclined = Qualtrics.SurveyEngine.getJSEmbeddedData('DeclinedProduct') || '';

            let nextRecommended = currentRecommended;
            let nextAccepted = currentAccepted;
            let nextWasAccepted = currentWasAccepted;
            let nextUserJourney = currentUserJourney;
            let nextRecommendationType = currentRecommendationType;
            let nextRejected = currentRejected;
            let nextDeclined = currentDeclined;

            if (eventType.startsWith('recommended-product-')) {
                const productNum = eventType.replace('recommended-product-', '');
                nextRecommended = productNum;
                nextRecommendationType = 'single';
            }

            if (eventType.startsWith('accepted-recommended-product-')) {
                const productNum = eventType.replace('accepted-recommended-product-', '');
                nextAccepted = productNum;
                nextWasAccepted = 'true';
                nextUserJourney = 'direct-accept';
            }

            if (eventType.startsWith('declined-recommended-product-')) {
                const productNum = eventType.replace('declined-recommended-product-', '');
                nextAccepted = '';
                nextWasAccepted = 'false';
                nextUserJourney = 'decline-only';
                nextDeclined = productNum;
                nextRejected = productNum;
            }

            Qualtrics.SurveyEngine.setJSEmbeddedData('RecommendedProduct', nextRecommended);
            Qualtrics.SurveyEngine.setJSEmbeddedData('AcceptedProduct', nextAccepted);
            Qualtrics.SurveyEngine.setJSEmbeddedData('WasRecommendationAccepted', nextWasAccepted);
            Qualtrics.SurveyEngine.setJSEmbeddedData('UserJourney', nextUserJourney);
            Qualtrics.SurveyEngine.setJSEmbeddedData('RecommendationType', nextRecommendationType);
            Qualtrics.SurveyEngine.setJSEmbeddedData('RejectedRecommendation', nextRejected);
            Qualtrics.SurveyEngine.setJSEmbeddedData('DeclinedProduct', nextDeclined);
        }
    } catch (error) {
        console.error('Error logging event: ', error);
        qualtricsResponseId = 'DEBUG';
    }
}

// Initialize the chat interface
try {
    setupLayout();
    addChatHeader();

    if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
        Qualtrics.SurveyEngine.addOnload(function () {
            try {
                this.hideNextButton();
            } catch (error) {
                console.warn('Unable to hide Qualtrics NextButton:', error);
            }
        });
    }

    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButtonElement = sendButton;
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
