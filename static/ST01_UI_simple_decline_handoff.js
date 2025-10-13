console.log("ST01_UI_simple_decline_handoff.js - Study 1: Simple Decline with Handoff");
var chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
// var chatbotURL = 'https://crimson-science.com/InsuranceRecommendation';
//var chatbotURL = 'http://127.0.0.1:5000/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Comparabot Insurance Finder';
var avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png'; // Replace with your actual image URL (square image)

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
documentBackgroundColor     = "#F6F5F2";    // Main page background
chatHeaderBackgroundColor   = "#3c3abd";    // Accent color (header background)
chatHeaderFontColor         = "#FFFFFF";    // White text
userMessageFontColor        = "#000000";    // Primary black text
userMessageBackgroundColor  = "#FFFFFF";    // White card background
loadingMessageFontColor     = "#6E6E6E";    // Secondary gray text
botMessageFontColor         = "#000000";    // Primary black text
botMessageBackgroundColor   = "#F8F9FA";    // Light gray card background
sendButtonColor             = "#3c3abd";    // Accent button color
sendButtonFontColor         = "#FFFFFF";    // White text

// Persistence keys and runtime state
const SESSION_STORAGE_KEY = 'ST01.sessionId';
const HISTORY_STORAGE_KEY = 'ST01.chatHistoryJson';
const HISTORY_TEXT_STORAGE_KEY = 'ST01.chatHistoryText';

let initializationInProgress = false;
let initializationCompleted = false;
let isSending = false;
let sendButtonElement = null;

// Internal variables
var sessionId = determineSessionId();
var chatHistory = "";
var chatHistoryJson = [];

function setQualtricsEmbeddedData(key, value) {
    try {
        if (typeof Qualtrics !== 'undefined' &&
            Qualtrics.SurveyEngine &&
            typeof Qualtrics.SurveyEngine.setEmbeddedData === 'function') {
            Qualtrics.SurveyEngine.setEmbeddedData(key, value);
            return;
        }

        if (typeof Qualtrics !== 'undefined' &&
            Qualtrics.SurveyEngine &&
            typeof Qualtrics.SurveyEngine.setJSEmbeddedData === 'function') {
            Qualtrics.SurveyEngine.setJSEmbeddedData(key, value);
            return;
        }
    } catch (error) {
        console.error('Error setting Qualtrics embedded data for key:', key, error);
    }

    // No-op fallback for local testing when Qualtrics is unavailable
    console.debug('Qualtrics embedded data unavailable. Skipping set for key:', key);
}

function getQualtricsEmbeddedData(key) {
    try {
        if (typeof Qualtrics !== 'undefined' &&
            Qualtrics.SurveyEngine &&
            typeof Qualtrics.SurveyEngine.getEmbeddedData === 'function') {
            return Qualtrics.SurveyEngine.getEmbeddedData(key);
        }

        if (typeof Qualtrics !== 'undefined' &&
            Qualtrics.SurveyEngine &&
            typeof Qualtrics.SurveyEngine.getJSEmbeddedData === 'function') {
            return Qualtrics.SurveyEngine.getJSEmbeddedData(key);
        }
    } catch (error) {
        console.error('Error getting Qualtrics embedded data for key:', key, error);
    }

    // No-op fallback for local testing when Qualtrics is unavailable
    console.debug('Qualtrics embedded data unavailable. Returning undefined for key:', key);
    return undefined;
}

function stampQualtricsTimestampOnce(key) {
    var existingValue = getQualtricsEmbeddedData(key);
    if (existingValue !== undefined && existingValue !== null && existingValue !== '') {
        return existingValue;
    }

    var timestamp = new Date().toISOString();
    setQualtricsEmbeddedData(key, timestamp);
    return timestamp;
}

function safeGetLocalStorage(key) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch (error) {
        console.warn('Unable to read localStorage key:', key, error);
    }
    return null;
}

function safeSetLocalStorage(key, value) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        console.warn('Unable to write localStorage key:', key, error);
    }
}

function safeParseJSON(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('Failed to parse JSON from storage value:', value.slice(0, 64), error);
        return null;
    }
}

function persistSessionId(id) {
    if (!id) {
        return;
    }

    safeSetLocalStorage(SESSION_STORAGE_KEY, id);
    setQualtricsEmbeddedData('SessionId', id);
}

function determineSessionId() {
    let override = '';

    try {
        const params = new URLSearchParams(window.location.search || '');
        override = (params.get('sessionId') || params.get('session_id') || '').trim();
    } catch (error) {
        console.warn('Failed to read sessionId from URL parameters:', error);
    }

    if (override) {
        persistSessionId(override);
        return override;
    }

    const qualtricsStored = (getQualtricsEmbeddedData('SessionId') || '').trim();
    if (qualtricsStored) {
        persistSessionId(qualtricsStored);
        return qualtricsStored;
    }

    const localStored = (safeGetLocalStorage(SESSION_STORAGE_KEY) || '').trim();
    if (localStored) {
        persistSessionId(localStored);
        return localStored;
    }

    const generated = `session_${crypto?.randomUUID?.() || (Math.random().toString(36) + Date.now().toString(36)).slice(0, 32)}`;
    persistSessionId(generated);
    return generated;
}

function loadStoredConversationFromClient() {
    const qualtricsValue = getQualtricsEmbeddedData('ChatHistoryJson');
    const parsedQualtrics = safeParseJSON(qualtricsValue);

    if (Array.isArray(parsedQualtrics) && parsedQualtrics.length > 0) {
        return parsedQualtrics;
    }

    const localValue = safeGetLocalStorage(HISTORY_STORAGE_KEY);
    const parsedLocal = safeParseJSON(localValue);

    if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
        return parsedLocal;
    }

    return [];
}

function rebuildChatHistoryString(historyArray) {
    if (!Array.isArray(historyArray)) {
        return '';
    }

    let buffer = '';

    for (const entry of historyArray) {
        if (!entry || typeof entry !== 'object') {
            continue;
        }

        const role = (entry.role || '').toLowerCase();
        const prefix = role === 'user' ? 'User' : role === 'assistant' ? 'Agent' : 'System';
        buffer += `${prefix}: ${entry.content || ''}\n`;
    }

    return buffer;
}

function resolveQualtricsResponseId() {
    const templatedValue = "${e://Field/ResponseID}";

    if (templatedValue && typeof templatedValue === 'string' && !templatedValue.includes('${')) {
        return templatedValue;
    }

    const embeddedValue = getQualtricsEmbeddedData('ResponseID');
    if (embeddedValue && typeof embeddedValue === 'string' && embeddedValue.trim()) {
        return embeddedValue;
    }

    return 'LOCAL_DEBUG';
}

function persistConversationState(optionalResponseId) {
    try {
        const serializedHistory = JSON.stringify(chatHistoryJson || []);
        const historyText = chatHistory || '';

        safeSetLocalStorage(HISTORY_STORAGE_KEY, serializedHistory);
        safeSetLocalStorage(HISTORY_TEXT_STORAGE_KEY, historyText);

        setQualtricsEmbeddedData('ChatHistory', historyText);
        setQualtricsEmbeddedData('ChatHistoryJson', serializedHistory);
        persistSessionId(sessionId);

        if (optionalResponseId && typeof optionalResponseId === 'string' && optionalResponseId.trim() && !optionalResponseId.includes('${')) {
            setQualtricsEmbeddedData('ResponseID', optionalResponseId.trim());
        }
    } catch (error) {
        console.error('Error persisting conversation state:', error);
    }
}

function getConversationEndpoint(sessionIdentifier) {
    if (!sessionIdentifier) {
        return '';
    }

    try {
        const base = new URL(chatbotURL, window.location.origin);
        return new URL(`/conversation/${encodeURIComponent(sessionIdentifier)}`, base).toString();
    } catch (error) {
        console.warn('Falling back to relative conversation endpoint:', error);
        return `/conversation/${encodeURIComponent(sessionIdentifier)}`;
    }
}

// Recommendation tracking variables
var originalRecommendation = null;
var recommendationType = null;

stampQualtricsTimestampOnce('WINDOW_OPEN_TS');

// Apply styles inspired by the website
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.backgroundColor = documentBackgroundColor

// Helper function for delays
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// HTML escaping for security
function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// HTML sanitization with allowlist
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

// Format message content with markdown-like support (Qualtrics-safe version)
// NO innerHTML - builds everything with pure DOM methods
function formatMessageContentSafe(value, container) {
    const normalized = String(value || '').replace(/\r\n?/g, '\n');
    if (!normalized.trim()) {
        return;
    }

    // Check for anchor tags and parse them manually
    const anchorRegex = /<a\s+([^>]*)>(.*?)<\/a>/gi;
    const hasAnchor = anchorRegex.test(normalized);

    if (hasAnchor) {
        // Parse anchor tags manually - Qualtrics blocks innerHTML
        const p = document.createElement('p');
        let lastIndex = 0;
        const regex = /<a\s+([^>]*)>(.*?)<\/a>/gi;
        let match;

        while ((match = regex.exec(normalized)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                const textBefore = normalized.substring(lastIndex, match.index);
                p.appendChild(document.createTextNode(textBefore));
            }

            // Parse anchor attributes
            const attrString = match[1];
            const linkText = match[2];

            // Create anchor element
            const anchor = document.createElement('a');
            anchor.textContent = linkText;

            // Extract href
            const hrefMatch = /href=["']([^"']*)["']/i.exec(attrString);
            if (hrefMatch) {
                anchor.href = hrefMatch[1];
            }

            // Extract onclick
            const onclickMatch = /onclick=["']([^"']*)["']/i.exec(attrString);
            if (onclickMatch) {
                anchor.setAttribute('onclick', onclickMatch[1]);
            }

            p.appendChild(anchor);
            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last link
        if (lastIndex < normalized.length) {
            p.appendChild(document.createTextNode(normalized.substring(lastIndex)));
        }

        container.appendChild(p);
    } else {
        // No HTML - use safe text-only approach
        const paragraphs = normalized.split(/\n{2,}/);

        for (const paragraph of paragraphs) {
            const trimmed = paragraph.trim();
            if (!trimmed) continue;

            const lines = trimmed.split(/\n/);
            const bulletLines = lines.every(line => /^[-*]\s+/.test(line.trim()));

            if (bulletLines) {
                const ul = document.createElement('ul');
                for (const line of lines) {
                    const text = line.trim().replace(/^[-*]\s+/, '');
                    if (text) {
                        const li = document.createElement('li');
                        li.textContent = text;
                        ul.appendChild(li);
                    }
                }
                container.appendChild(ul);
            } else {
                const p = document.createElement('p');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line) {
                        p.appendChild(document.createTextNode(line));
                        if (i < lines.length - 1) {
                            p.appendChild(document.createElement('br'));
                        }
                    }
                }
                if (p.childNodes.length > 0) {
                    container.appendChild(p);
                }
            }
        }
    }
}

// Inject modern CSS styles
let globalStylesInjected = false;
function injectGlobalStyles() {
    if (globalStylesInjected) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'st01-global-styles';
    style.textContent = `
        /* Chat window and layout styling */
        #chat-window.chat-scroll-region {
            display: flex;
            flex-direction: column;
            gap: clamp(8px, 1.8vw, 12px);
            padding: clamp(4px, 1vw, 8px);
            background: #ffffff;
            overflow-y: auto;
        }

        #chat-window.chat-scroll-region::-webkit-scrollbar {
            width: 10px;
        }

        #chat-window.chat-scroll-region::-webkit-scrollbar-thumb {
            background: rgba(60, 58, 189, 0.25);
            border-radius: 8px;
        }

        #input-row.chat-input-row {
            display: flex;
            gap: 12px;
            padding: clamp(6px, 1.5vw, 10px);
            background: rgba(60, 58, 189, 0.03);
            border-top: 1px solid rgba(60, 58, 189, 0.08);
        }

        #user-input.chat-input {
            flex: 1 1 auto;
            min-width: 0;
            border-radius: 14px;
            border: 1px solid rgba(17, 19, 34, 0.12);
            padding: 8px 12px;
            font-size: 0.85rem;
            line-height: 1.4;
            background: #ffffff;
            color: #111322;
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
            background: linear-gradient(135deg, #3c3abd, #4f4cd7);
            color: #ffffff;
            border: none;
            padding: 0 clamp(12px, 2vw, 18px);
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            min-height: 36px;
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

        /* Modern message styling */
        .message {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: clamp(8px, 2vw, 12px);
            border-radius: 12px;
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
            background: linear-gradient(135deg, #3c3abd, #4f4cd7) !important;
            color: #ffffff !important;
        }

        .bot-message {
            align-self: flex-start;
            background: #F0F1F9 !important;
            color: #111322 !important;
            border: 1px solid rgba(60, 58, 189, 0.2) !important;
        }

        .bot-message::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(145deg, rgba(60, 58, 189, 0.05), transparent 62%);
            mix-blend-mode: multiply;
            opacity: 0.3;
        }

        .bot-message.recommendation {
            background: #E8F4F8 !important;
            color: #000000 !important;
            border: 1px solid rgba(41, 118, 221, 0.3) !important;
            box-shadow: 0 24px 48px rgba(41, 118, 221, 0.18);
        }

        .bot-message.recommendation::before {
            background: linear-gradient(160deg, rgba(41, 118, 221, 0.12), transparent 58%);
            mix-blend-mode: normal;
            opacity: 0.3;
        }

        .message-label {
            font-size: 0.6rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 999px;
            background: rgba(17, 19, 34, 0.025);
            color: #6E6E6E;
            align-self: flex-start;
        }

        .message-label::before {
            content: '';
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0.7;
        }

        .user-message .message-label {
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
        }

        .bot-message .message-label {
            background: rgba(60, 58, 189, 0.025);
            color: #6E6E6E;
        }

        .bot-message.recommendation .message-label {
            background: rgba(41, 118, 221, 0.03);
            color: #6E6E6E;
        }

        .message-body {
            font-size: clamp(0.8rem, 2vw, 0.9rem) !important;
            line-height: 1.6 !important;
            color: inherit !important;
        }

        .user-message .message-body {
            color: #ffffff !important;
        }

        .bot-message .message-body {
            color: #111322 !important;
        }

        .bot-message.recommendation .message-body {
            color: #000000 !important;
        }

        .message-body ul {
            margin: 0;
            padding-left: 1.1rem;
            display: grid;
            gap: 6px;
        }

        .message-body p {
            margin: 0 !important;
            padding: 0 !important;
        }

        .message-body:empty::before {
            content: '[No message content]';
            color: red;
            font-style: italic;
        }

        .message-body a {
            color: #3c3abd;
            text-decoration: underline;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .message-body a:hover {
            color: #4f4cd7;
            text-decoration: none;
        }

        /* Typing indicator */
        .typing-indicator {
            align-self: flex-start;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 12px;
            background: rgba(60, 58, 189, 0.08);
            box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
            color: rgba(17, 19, 34, 0.72);
            font-size: 0.75rem;
        }

        .typing-label {
            font-size: 0.75rem;
            color: rgba(17, 19, 34, 0.72);
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .typing-dots {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .typing-dot {
            width: 5px;
            height: 5px;
            border-radius: 999px;
            background: #3c3abd;
            opacity: 0.2;
            animation: typingPulse 1.3s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.16s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.32s;
        }

        /* Handover animation styles */
        .handover-message {
            align-self: center;
            background: transparent;
            border: none;
            box-shadow: none;
            padding-block: clamp(4px, 1vw, 6px);
            padding-inline: clamp(8px, 1.5vw, 10px);
            max-width: min(420px, 92%);
            text-align: center;
        }

        .handover-message::before,
        .handover-message::after {
            display: none;
        }

        .handover-message .message-label {
            align-self: center;
            background: rgba(50, 88, 200, 0.14);
            color: #3855c8;
            letter-spacing: 0.14em;
        }

        .handover-sequence {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            animation: handoverFadeIn 0.32s ease;
        }

        .handover-title {
            font-weight: 600;
            font-size: clamp(0.75rem, 1.8vw, 0.85rem);
            color: #3c3abd;
            letter-spacing: 0.02em;
        }

        .handover-subtitle {
            font-size: clamp(0.65rem, 1.6vw, 0.72rem);
            color: rgba(17, 19, 34, 0.68);
            max-width: 32ch;
        }

        .handover-steps {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: 100%;
            padding-block: 4px 2px;
        }

        .handover-steps::before {
            content: '';
            position: absolute;
            top: 22px;
            bottom: 22px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            background: linear-gradient(180deg, rgba(60, 58, 189, 0.22), rgba(41, 118, 221, 0.18));
            pointer-events: none;
        }

        .handover-step {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.35s ease, transform 0.35s ease;
            color: rgba(17, 19, 34, 0.72);
            font-size: clamp(0.68rem, 1.6vw, 0.78rem);
            min-height: 24px;
        }

        .handover-step-marker {
            position: relative;
            width: 9px;
            height: 9px;
            border-radius: 999px;
            border: 2px solid rgba(60, 58, 189, 0.28);
            background: rgba(255, 255, 255, 0.82);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
            z-index: 1;
            box-shadow: 0 4px 12px rgba(60, 58, 189, 0.15);
        }

        .handover-step-marker::after {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 999px;
            border: 2px solid transparent;
            border-top-color: rgba(60, 58, 189, 0.6);
            border-right-color: rgba(60, 58, 189, 0.4);
            opacity: 0;
            transition: opacity 0.35s ease;
        }

        .handover-step-label {
            max-width: 26ch;
        }

        .handover-step.active {
            opacity: 1;
            transform: translateY(0);
            color: #111322;
        }

        .handover-step.active .handover-step-marker {
            border-color: #3c3abd;
            background: #3c3abd;
            color: #ffffff;
            box-shadow: 0 0 0 4px rgba(60, 58, 189, 0.16);
        }

        .handover-step.active .handover-step-marker::after {
            opacity: 1;
            animation: handoverSpinner 1.2s linear infinite;
        }

        .handover-step.completed {
            opacity: 0.92;
            transform: translateY(0);
            color: rgba(17, 19, 34, 0.72);
        }

        .handover-step.completed .handover-step-marker {
            border-color: #3c3abd;
            background: #3c3abd;
            color: #ffffff;
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
            transform: translate(-50%, -52%);
            font-size: 0.4rem;
            font-weight: 600;
        }

        .handover-message.handover-complete .handover-steps::before {
            background: linear-gradient(180deg, rgba(60, 58, 189, 0.1), rgba(41, 118, 221, 0.12));
        }

        /* Keyframe animations */
        @keyframes handoverSpinner {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
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

// Setup layout by adding necessary CSS classes
function setupLayout() {
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
        input.setAttribute('placeholder', 'Type your message…');
    }

    const button = document.getElementById('send-button');
    if (button) {
        button.classList.add('chat-send-button');
    }
}

function addChatHeader() {
    // Create and style the chat header container (for avatar and text)
    var chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = chatHeaderBackgroundColor;
    chatHeader.style.color = chatHeaderFontColor;
    chatHeader.style.padding = "clamp(4px, 1vw, 8px)";
    chatHeader.style.textAlign = "center";
    chatHeader.style.fontSize = "clamp(0.7rem, 2vw, 0.85rem)";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.borderTopLeftRadius = "10px";
    chatHeader.style.borderTopRightRadius = "10px";
    chatHeader.style.display = "flex"; // Flexbox for alignment
    chatHeader.style.alignItems = "center"; // Center items vertically

    // Create the avatar image element
    var avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + 'Avatar';
    avatar.style.width = "clamp(35px, 5vw, 50px)"; // Responsive avatar size
    avatar.style.height = "clamp(35px, 5vw, 50px)"; // Responsive avatar size
    avatar.style.marginRight = "clamp(4px, 1vw, 8px)"; // Responsive space between avatar and text
    avatar.style.borderRadius = "50%"; // Make it circular if not already

    // Create the text element
    var chatHeaderText = document.createElement('span');
    chatHeaderText.innerText = chatTitle;

    // Append avatar and text to the header
    chatHeader.appendChild(avatar);
    chatHeader.appendChild(chatHeaderText);

    // Insert the header above the existing chat box
    var chatWindow = document.getElementById('chat-window');
    chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
}

// Create message element with modern styling
function createMessageElement(role, content, agentType) {
    const wrapper = document.createElement('div');
    const normalizedRole = role === 'assistant' ? 'bot' : role;
    wrapper.className = `message ${normalizedRole}-message`;

    // Add inline styles for colors (highest specificity, works in Qualtrics)
    if (normalizedRole === 'user') {
        wrapper.style.background = 'linear-gradient(135deg, #3c3abd, #4f4cd7)';
        wrapper.style.color = '#ffffff';
        wrapper.style.alignSelf = 'flex-end';
    } else if (agentType === 'recommendation') {
        wrapper.classList.add('recommendation');
        wrapper.style.background = '#E8F4F8';
        wrapper.style.color = '#000000';
        wrapper.style.border = '1px solid rgba(41, 118, 221, 0.3)';
        wrapper.style.alignSelf = 'flex-start';
    } else {
        wrapper.style.background = '#F0F1F9';
        wrapper.style.color = '#111322';
        wrapper.style.border = '1px solid rgba(60, 58, 189, 0.2)';
        wrapper.style.alignSelf = 'flex-start';
    }

    const label = document.createElement('div');
    label.className = 'message-label';

    if (normalizedRole === 'user') {
        label.textContent = 'You';
        label.style.background = 'rgba(255, 255, 255, 0.22)';
        label.style.color = '#ffffff';
    } else if (agentType === 'recommendation') {
        label.textContent = 'Recommendation Agent';
        label.style.background = 'rgba(41, 118, 221, 0.18)';
        label.style.color = '#2976dd';
    } else {
        label.textContent = 'Information Agent';
        label.style.background = 'rgba(60, 58, 189, 0.12)';
        label.style.color = '#3c3abd';
    }

    const body = document.createElement('div');
    body.className = 'message-body';
    // Add inline style for color
    body.style.color = normalizedRole === 'user' ? '#ffffff' : (agentType === 'recommendation' ? '#000000' : '#111322');

    // Use Qualtrics-safe formatting (no innerHTML)
    formatMessageContentSafe(content, body);

    wrapper.appendChild(label);
    wrapper.appendChild(body);

    return wrapper;
}

// Create animated typing indicator
function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';

    const label = document.createElement('span');
    label.className = 'typing-label';
    // label.textContent = `${botName} is thinking`;
    label.textContent = `Information Agent is thinking`;

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

async function loadConversationHistory() {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        console.error('Chat window not found when attempting to load history');
        return;
    }

    let history = [];
    const conversationEndpoint = getConversationEndpoint(sessionId);

    if (conversationEndpoint) {
        try {
            const response = await fetch(conversationEndpoint);
            if (response.ok) {
                const data = await response.json();
                history = Array.isArray(data.history) ? data.history : [];
                console.log(`Retrieved ${history.length} messages from backend history endpoint`);
            } else if (response.status !== 404) {
                console.warn('Failed to load conversation history from backend:', response.status);
            }
        } catch (error) {
            console.error('Error fetching conversation history:', error);
        }
    }

    if (!Array.isArray(history) || history.length === 0) {
        history = loadStoredConversationFromClient();
        if (history.length > 0) {
            console.log(`Loaded ${history.length} messages from client-side storage`);
        }
    }

    chatWindow.innerHTML = '';

    if (!Array.isArray(history) || history.length === 0) {
        chatHistoryJson = [];
        chatHistory = '';
        persistConversationState(resolveQualtricsResponseId());
        chatWindow.scrollTop = chatWindow.scrollHeight;
        await sendInitializationMessage();
        return;
    }

    chatHistoryJson = history.map(entry => ({ ...entry }));
    chatHistory = rebuildChatHistoryString(chatHistoryJson);

    const assistantPresent = chatHistoryJson.some(entry => (entry.role || '').toLowerCase() === 'assistant');
    if (assistantPresent) {
        initializationCompleted = true;
    }

    for (let i = 0; i < chatHistoryJson.length; i++) {
        const entry = chatHistoryJson[i];
        if (!entry) {
            continue;
        }

        const normalizedRole = (entry.role || '').toLowerCase();

        if (normalizedRole === 'user') {
            const userMessageDiv = createMessageElement('user', entry.content);
            chatWindow.appendChild(userMessageDiv);
        } else if (normalizedRole === 'assistant') {
            const agentType = entry.agent_type || (entry.content && entry.content.includes('showRecommendation(') ? 'recommendation' : 'collector');
            const botMessageDiv = createMessageElement('assistant', entry.content, agentType);
            chatWindow.appendChild(botMessageDiv);

            if (entry.customer_data && i + 1 < chatHistoryJson.length) {
                const nextEntry = chatHistoryJson[i + 1];
                const nextRole = (nextEntry.role || '').toLowerCase();
                if (nextRole === 'assistant') {
                    const nextAgentType = nextEntry.agent_type || (nextEntry.content && nextEntry.content.includes('showRecommendation(') ? 'recommendation' : 'collector');
                    if (nextAgentType === 'recommendation') {
                        const handoffDivider = createStaticHandoffDivider();
                        chatWindow.appendChild(handoffDivider);
                    }
                }
            }
        } else if (normalizedRole === 'system') {
            addSystemMessage(entry.content || '', { suppressScroll: true });
        }
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
    persistConversationState(resolveQualtricsResponseId());
}

async function sendInitializationMessage() {
    if (initializationInProgress || initializationCompleted) {
        return;
    }

    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        console.error('Chat window not found during initialization');
        return;
    }

    initializationInProgress = true;

    const typingIndicator = createTypingIndicator();
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (!sendButtonElement) {
        sendButtonElement = document.getElementById('send-button');
    }

    if (sendButtonElement) {
        sendButtonElement.disabled = true;
        sendButtonElement.style.opacity = '0.6';
    }

    const qualtricsResponseId = resolveQualtricsResponseId();

    try {
        const requestData = {
            message: [],
            session_id: sessionId,
            qualtrics_response_id: qualtricsResponseId
        };

        const response = await fetch(chatbotURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const data = await response.json();
            const responses = Array.isArray(data.response) ? data.response : [data.response];
            const botTimestamp = new Date().toISOString();

            for (const messageContent of responses) {
                chatHistoryJson.push({
                    role: 'assistant',
                    content: messageContent,
                    timestamp: botTimestamp,
                    agent_type: 'collector'
                });
                const botMessageDiv = createMessageElement('assistant', messageContent, 'collector');
                chatWindow.appendChild(botMessageDiv);
            }

            if (responses.length > 0) {
                initializationCompleted = true;
            }

            chatHistory = rebuildChatHistoryString(chatHistoryJson);
            persistConversationState(qualtricsResponseId);
        } else {
            console.error('Failed to initialize conversation:', response.status);
        }
    } catch (error) {
        console.error('Error initializing conversation:', error);
    } finally {
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        if (sendButtonElement) {
            sendButtonElement.disabled = false;
            sendButtonElement.style.opacity = '1';
        }

        initializationInProgress = false;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
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

    const userInput = inputField.value.trim();
    if (!userInput) {
        return;
    }

    stampQualtricsTimestampOnce('FIRST_MSG_TS');

    const qualtricsResponseId = resolveQualtricsResponseId();

    inputField.value = '';
    if (typeof inputField.focus === 'function') {
        inputField.focus();
    }

    if (!sendButtonElement) {
        sendButtonElement = document.getElementById('send-button');
    }

    if (sendButtonElement) {
        sendButtonElement.disabled = true;
        sendButtonElement.style.opacity = '0.6';
    }

    isSending = true;

    const timestamp = new Date().toISOString();

    chatHistoryJson.push({ role: 'user', content: userInput, timestamp: timestamp });
    chatHistory = rebuildChatHistoryString(chatHistoryJson);
    persistConversationState(qualtricsResponseId);

    const userMessageDiv = createMessageElement('user', userInput);
    chatWindow.appendChild(userMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const typingIndicator = createTypingIndicator();
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const requestData = {
            message: chatHistoryJson,
            session_id: sessionId,
            qualtrics_response_id: qualtricsResponseId
        };

        const response = await fetch(chatbotURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const data = await response.json();
            const botTimestamp = new Date().toISOString();
            const responses = Array.isArray(data.response) ? data.response : [data.response];
            const isHandoff = responses.length > 1;

            for (let i = 0; i < responses.length; i++) {
                const messageContent = responses[i];
                const agentType = isHandoff && i === 1 ? 'recommendation' : 'collector';

                if (i > 0) {
                    await wait(800);
                }

                chatHistoryJson.push({
                    role: 'assistant',
                    content: messageContent,
                    timestamp: botTimestamp,
                    agent_type: agentType
                });
                chatHistory = rebuildChatHistoryString(chatHistoryJson);

                const botMessageDiv = createBotMessage(messageContent, agentType);
                chatWindow.appendChild(botMessageDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;

                if (isHandoff && i === 0) {
                    await showHandoffSequence(chatWindow);
                }
            }

            initializationCompleted = initializationCompleted || responses.length > 0;
            persistConversationState(qualtricsResponseId);
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
            sendButtonElement.style.opacity = '1';
        }

        isSending = false;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function createBotMessage(content, agentType = 'collector') {
    // Use modern createMessageElement instead of inline styling
    return createMessageElement('assistant', content, agentType);
}

// Animated handoff sequence
async function showHandoffSequence(chatWindowOverride) {
    const chatWindow = chatWindowOverride || document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    const handoverMessage = document.createElement('div');
    handoverMessage.className = 'message handover-message';

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
    subtitle.textContent = "Routing to specialist...";

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

    // Sequential reveal with timing from local-ui.js
    for (let i = 0; i < stepElements.length; i++) {
        const currentStep = stepElements[i];
        await wait(i === 0 ? 200 : 1500);
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

function createStaticHandoffDivider() {
    const handoverMessage = document.createElement('div');
    handoverMessage.className = 'message handover-message handover-complete';

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'Agent Handoff';

    const body = document.createElement('div');
    body.className = 'message-body';

    const sequenceContainer = document.createElement('div');
    sequenceContainer.className = 'handover-sequence handover-finished';

    const title = document.createElement('div');
    title.className = 'handover-title';
    title.textContent = 'Handoff Complete';

    const subtitle = document.createElement('div');
    subtitle.className = 'handover-subtitle';
    subtitle.textContent = 'Routed to Insurance Specialist';

    const stepsWrapper = document.createElement('div');
    stepsWrapper.className = 'handover-steps';

    const steps = [
        { label: 'Handing over to Insurance Specialist' },
        { label: 'Thinking' },
        { label: 'Getting top recommendation' }
    ];

    for (const step of steps) {
        const stepElement = document.createElement('div');
        stepElement.className = 'handover-step completed';

        const marker = document.createElement('span');
        marker.className = 'handover-step-marker';
        marker.setAttribute('aria-hidden', 'true');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'handover-step-label';
        labelSpan.textContent = step.label;

        stepElement.appendChild(marker);
        stepElement.appendChild(labelSpan);
        stepsWrapper.appendChild(stepElement);
    }

    sequenceContainer.appendChild(title);
    sequenceContainer.appendChild(subtitle);
    sequenceContainer.appendChild(stepsWrapper);
    body.appendChild(sequenceContainer);
    handoverMessage.appendChild(label);
    handoverMessage.appendChild(body);

    return handoverMessage;
}

function addSystemMessage(message, options) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    const systemMessageDiv = document.createElement('div');

    systemMessageDiv.style.fontSize = 'clamp(0.75rem, 2vw, 0.875rem)';
    systemMessageDiv.style.fontStyle = 'italic';
    systemMessageDiv.style.color = '#6E6E6E';
    systemMessageDiv.style.backgroundColor = '#FFFFFF';
    systemMessageDiv.style.padding = '8px 12px';
    systemMessageDiv.style.borderRadius = '15px';
    systemMessageDiv.style.marginBottom = 'clamp(8px, 2vw, 12px)';
    systemMessageDiv.style.maxWidth = '60%';
    systemMessageDiv.style.alignSelf = 'center';
    systemMessageDiv.style.border = '1px solid #DADADA';
    systemMessageDiv.style.textAlign = 'center';

    const emphasis = document.createElement('em');
    emphasis.textContent = message || '';
    systemMessageDiv.appendChild(emphasis);

    chatWindow.appendChild(systemMessageDiv);

    if (!options || !options.suppressScroll) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function logEvent(eventType, details) {
    try {
        var timestamp = new Date().toISOString();
        var logEntry = {
            role: "system",
            content: eventType,
            timestamp: timestamp,
            details: details || {}
        };

        chatHistoryJson.push(logEntry);
        chatHistory = rebuildChatHistoryString(chatHistoryJson);
        persistConversationState(resolveQualtricsResponseId());

        // Initialize all variables to ensure consistent data structure
        var currentRecommended = getQualtricsEmbeddedData('RecommendedProduct') || "";
        var currentAccepted = getQualtricsEmbeddedData('AcceptedProduct') || "";
        var currentWasAccepted = getQualtricsEmbeddedData('WasRecommendationAccepted') || "";
        var currentUserJourney = getQualtricsEmbeddedData('UserJourney') || "";
        var currentRecommendationType = getQualtricsEmbeddedData('RecommendationType') || "";
        var currentRejected = getQualtricsEmbeddedData('RejectedRecommendation') || "";
        var currentDeclined = getQualtricsEmbeddedData('DeclinedProduct') || "";
        
        // Set specific values based on event type, keeping others as current or empty
        if (eventType.startsWith("recommended-product-")) {
            var productNum = eventType.replace("recommended-product-", "");
            currentRecommended = productNum;
            currentRecommendationType = "single";
        }
        
        if (eventType.startsWith("accepted-recommended-product-")) {
            var productNum = eventType.replace("accepted-recommended-product-", "");
            currentAccepted = productNum;
            currentWasAccepted = "true";
            currentUserJourney = "direct-accept";
        }
        
        if (eventType.startsWith("declined-recommended-product-")) {
            var productNum = eventType.replace("declined-recommended-product-", "");
            currentAccepted = "";
            currentWasAccepted = "false";
            currentUserJourney = "decline-only";
            currentDeclined = productNum;
            currentRejected = productNum;
        }
        
        // Always set ALL variables to ensure consistent data structure
        setQualtricsEmbeddedData('RecommendedProduct', currentRecommended);
        setQualtricsEmbeddedData('AcceptedProduct', currentAccepted);
        setQualtricsEmbeddedData('WasRecommendationAccepted', currentWasAccepted);
        setQualtricsEmbeddedData('UserJourney', currentUserJourney);
        setQualtricsEmbeddedData('RecommendationType', currentRecommendationType);
        setQualtricsEmbeddedData('RejectedRecommendation', currentRejected);
        setQualtricsEmbeddedData('DeclinedProduct', currentDeclined);

    } catch(error) {
        console.error("Error logging event: ", error);
    }
}

try {
    // Inject modern CSS styles first
    injectGlobalStyles();

    // Add CSS classes to HTML elements
    setupLayout();

    addChatHeader();

    const bootstrapConversation = () => {
        loadConversationHistory().catch(error => {
            console.error('Failed to load conversation history:', error);
        });
    };

    const scheduleConversationBootstrap = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootstrapConversation, { once: true });
        } else {
            bootstrapConversation();
        }
    };

    if (typeof Qualtrics !== 'undefined' &&
        Qualtrics.SurveyEngine &&
        typeof Qualtrics.SurveyEngine.addOnload === 'function') {
        Qualtrics.SurveyEngine.addOnload(function () {
            if (typeof this.hideNextButton === 'function') {
                this.hideNextButton();
            }
            stampQualtricsTimestampOnce('WINDOW_OPEN_TS');

            var nextButton = document.getElementById('NextButton');
            if (nextButton) {
                var handleNextClick = function () {
                    stampQualtricsTimestampOnce('NEXT_CLICK_TS');
                };

                if (typeof nextButton.addEventListener === 'function') {
                    nextButton.addEventListener('click', handleNextClick, { once: true });
                } else {
                    nextButton.onclick = function () {
                        handleNextClick();
                        nextButton.onclick = null;
                    };
                }
            }

            scheduleConversationBootstrap();
        });
    } else {
        scheduleConversationBootstrap();
    }

    // Add event listeners (styling now handled by CSS classes)
    var sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', sendMessage);

    // Handle Enter key to send message and prevent default behavior
    document.getElementById('user-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // Prevent default behavior like form submission
            if (document.getElementById('user-input').value.trim() !== "") {  // Ensure input is not empty
                sendMessage();
            }
        }
    });
} catch (error) {
    showErrorMessage("Error setting up event listeners. Error", error);
    console.error("Error setting up event listeners: ", error);
}



 function showErrorMessage(message) {
         // Create alertbox for errors
        applyCustomAlertStyles();
        let chatWindow = document.getElementById('chat-window');

         // Create the main container div
        let alertBox = document.createElement("div");
        alertBox.id = "customAlertBox";
        alertBox.className = "custom-alert";

        // Create the content div
        let alertContent = document.createElement("div");
        alertContent.className = "custom-alert-content";

        // Create the close button
        let closeButton = document.createElement("span");
        closeButton.className = "close";
        closeButton.innerHTML = "&times;";
        closeButton.onclick = () => alertBox.remove(); // Close functionality

        // Create the message paragraph
        let alertMessage = document.createElement("p");
        alertMessage.id = "alertMessage";

        // Assemble the alert box
        alertContent.appendChild(closeButton);
        alertContent.appendChild(alertMessage);
        alertBox.appendChild(alertContent);

        // Append to the body or desired parent element
        //document.body.appendChild(alertBox);

        chatWindow.appendChild(alertBox);

        alertMessage.style.color = "#000000"
        alertMessage.innerHTML = message;
        alertBox.style.display = "flex";
        closeButton.addEventListener('click', function () {
            alertBox.style.display = "none";
        });
}

// Testing new product viewer:
//showRecommendation(1)



function showProductOverlay(){
    // Create alertbox for errors
    applyCustomRecommendationcStyles();
    let chatWindow = document.getElementById('chat-window');

    // Create the main container div
    let alertBox = document.createElement("div");
    alertBox.id = "recommendation";
    alertBox.className = "custom-recommendation";    
    alertBox.style.display = "flex";

    // Create the content div
    let alertContent = document.createElement("div");
    alertContent.id = "product-overlay-content";
    alertContent.className = "custom-recommendation-content";

    // Create close button
    let closeButton = document.createElement("button");
    closeButton.className = "modal-close-button";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => alertBox.remove();

    // Create the message paragraph
    let alertMessage = document.createElement("p");
    alertMessage.id = "recommendationMessage";
    alertMessage.style.color = "#000000";
    alertMessage.innerHTML = "message";

    // Create the <img> container and image
    const container = document.createElement('div');
    container.id = 'image-container';
    container.style.margin = 'clamp(1rem, 4vw, 2rem) 0';

     // Append elements in desired order
    alertContent.appendChild(closeButton);       // Close button (top-right)
    alertContent.appendChild(alertMessage);      // Top
    alertContent.appendChild(container);         // Middle (Image)
    
    alertBox.appendChild(alertContent);
    chatWindow.appendChild(alertBox);    
}


function showRecommendation(productNumber) {    
    // Set tracking variables
    originalRecommendation = productNumber;
    recommendationType = "single";
    
    showProductOverlay()
    message = "Here is your recommended product: " + productNumber 
    // Adapt message
    let alertMessage = document.getElementById("recommendationMessage")
    alertMessage.innerHTML = message;

    // Show recommended product as an image
    let container = document.getElementById("image-container")

    const img = document.createElement('img');
    img.src = productImageData[productNumber-1].src;
    img.alt = 'Description of image';
    img.style.width = '100%';
    img.style.maxWidth = '750px';
    img.style.display = 'block';
    img.style.margin = '0 auto';

    container.appendChild(img);

    // Accept button
    const acceptButton = document.createElement('button');
    acceptButton.textContent = '✅Accept';
    acceptButton.style.backgroundColor = sendButtonColor;
    acceptButton.style.color = sendButtonFontColor;
    acceptButton.style.padding = "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 20px)";
    acceptButton.style.minHeight = "44px"; // Minimum touch target
    acceptButton.style.border = "none";
    acceptButton.style.borderRadius = "5px";
    acceptButton.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    acceptButton.style.cursor = "pointer";
    acceptButton.onclick = function() {
        // Log acceptance with context
        logEvent("accepted-recommended-product-" + productNumber, {
            acceptedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType
        });
        
        alert('You accepted product ' + productNumber + '!');
        document.getElementById("NextButton").click();
    };

    // Decline button - MODIFIED: Simple decline workflow
    const declineButton = document.createElement('button');
    declineButton.textContent = '❌Decline';
    declineButton.style.backgroundColor = sendButtonColor;
    declineButton.style.color = sendButtonFontColor;
    declineButton.style.padding = "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 20px)";
    declineButton.style.minHeight = "44px"; // Minimum touch target
    declineButton.style.border = "none";
    declineButton.style.borderRadius = "5px";
    declineButton.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    declineButton.style.cursor = "pointer";
    declineButton.addEventListener('click', function () {
        // Log decline with context  
        logEvent("declined-recommended-product-" + productNumber, {
            declinedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType
        });
        
        // Remove the recommendation modal
        document.getElementById("recommendation").remove();
        
        // Show decline message and proceed to next question
        alert('Thank you for your feedback. You have declined product ' + productNumber + '.');
        
        // Advance to next question
        document.getElementById("NextButton").click();
    });

    // Set button classes
    acceptButton.className = "custom-recommendation-button";
    declineButton.className = "custom-recommendation-button";

    // Wrap buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "recommendation-buttons";

    // Append buttons to button container
    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(declineButton);

    let alertContent = document.getElementById('product-overlay-content')    
       
    alertContent.appendChild(buttonContainer);   // Bottom (Buttons)
    
    // Log the recommendation event
    logEvent("recommended-product-" + productNumber, {
        productNumber: productNumber,
        type: "single",
        recommendationType: "single"
    });
}

// Note: showAllProducts function removed as it's not needed in simple decline workflow

function applyCustomAlertStyles() {
    // Set styles for .custom-alert
    const customAlertStyle = document.createElement("style");
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

function applyCustomRecommendationcStyles() {
  const css = `
    /* ===== Overlay Backdrop ===== */
    .custom-recommendation {
      display: none;
      position: fixed;  /* was absolute; fixed keeps centered on long pages */
      inset: 0;
      z-index: 1000;
      background-color: rgba(0, 0, 0, 0.4);
      align-items: center;
      justify-content: center;
    }

    /* ===== Modal Card ===== */
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

    /* ===== Close Button ===== */
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
      color: #b60000;
      margin-bottom: clamp(1rem, 3vw, 1.5rem);
      text-align: center;
      font-size: clamp(1.125rem, 2.5vw, 1.5rem);
      line-height: 1.3;
    }

    /* Container for single image display */
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

    /* ===== Accept/Decline Button Row ===== */
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
  style.innerHTML = css;
  document.head.appendChild(style);
}