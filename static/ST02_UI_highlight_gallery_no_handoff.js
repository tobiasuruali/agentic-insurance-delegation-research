console.log("ST02_UI_highlight_gallery_no_handoff.js - Study 2: Highlight Gallery without Handoff");
var chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
// var chatbotURL = 'https://crimson-science.com/InsuranceRecommendation';
//var chatbotURL = 'http://127.0.0.1:5000/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Comparabot Insurance Finder';
var avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png'; // Replace with your actual image URL (square image)

// Study configuration
var STUDY_ID = 'ST02_02';

const productImageData = [
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_01.png',
        alertText: 'Professional Insurance Option 1'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_02.png',
        alertText: 'Professional Insurance Option 2'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_03.png',
        alertText: 'Professional Insurance Option 3'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_04.png',
        alertText: 'Professional Insurance Option 4'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_05.png',
        alertText: 'Professional Insurance Option 5'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_06.png',
        alertText: 'Professional Insurance Option 6'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_07.png',
        alertText: 'Professional Insurance Option 7'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_08.png',
        alertText: 'Professional Insurance Option 8'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_09.png',
        alertText: 'Professional Insurance Option 9'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_10.png',
        alertText: 'Professional Insurance Option 10'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_11.png',
        alertText: 'Professional Insurance Option 11'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_12.png',
        alertText: 'Professional Insurance Option 12'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_13.png',
        alertText: 'Professional Insurance Option 13'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_14.png',
        alertText: 'Professional Insurance Option 14'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_15.png',
        alertText: 'Professional Insurance Option 15'
    },
    {
        src: 'https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_16.png',
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

// Internal variables
var isSending = false; // Prevent double-send on rapid clicks

// Composite session ID combining Qualtrics SessionID and PROLIFIC_PID
var compositeSessionId = (function () {
    function getStored() {
        try {
            var item = localStorage.getItem('ST02_sessionId');
            return (item && item.trim()) || '';
        } catch (e) {
            return '';
        }
    }

    function setStored(value) {
        try {
            localStorage.setItem('ST02_sessionId', value);
        } catch (e) {
            // Ignore storage errors
        }
    }

    var stored = getStored();
    if (stored) {
        return stored;
    }

    var sessionId = '';
    var prolificId = '';

    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
            var qualtricsSessionId = Qualtrics.SurveyEngine.getEmbeddedData('Q_SessionID');
            if (qualtricsSessionId && qualtricsSessionId.trim()) {
                sessionId = qualtricsSessionId.trim();
            }
        }
    } catch (e) {
        // Ignore Qualtrics access errors
    }

    if (!sessionId) {
        sessionId = 'AUTO_' + crypto.randomUUID();
    }

    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
            var pid = Qualtrics.SurveyEngine.getEmbeddedData('PROLIFIC_PID');
            if (pid && pid.trim()) {
                prolificId = pid.trim();
            }
        }
    } catch (e) {
        // Ignore Qualtrics access errors
    }

    if (!prolificId) {
        var urlParams = new URLSearchParams(window.location.search);
        var pidFromUrl = urlParams.get('PROLIFIC_PID');
        if (pidFromUrl && pidFromUrl.trim()) {
            prolificId = pidFromUrl.trim();
        }
    }

    if (!prolificId) {
        prolificId = 'AUTO_' + crypto.randomUUID();
    }

    // Prefix each component for clarity
    sessionId = 'SES_' + sessionId;
    prolificId = 'PID_' + prolificId;

    // Combine into composite format
    var combined = sessionId + '__PROLIFIC__' + prolificId;
    var compositeId = STUDY_ID + '_' + combined;

    setStored(compositeId);

    // Also set in Qualtrics for reference
    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
            if (typeof Qualtrics.SurveyEngine.setJSEmbeddedData === 'function') {
                Qualtrics.SurveyEngine.setJSEmbeddedData('CompositeSessionId', compositeId);
            } else if (typeof Qualtrics.SurveyEngine.setEmbeddedData === 'function') {
                Qualtrics.SurveyEngine.setEmbeddedData('CompositeSessionId', compositeId);
            }
        }
    } catch (e) {
        // Ignore Qualtrics set errors
    }

    return compositeId;
})();

// Set treatment condition for this study variant
setQualtricsEmbeddedData('TreatmentCondition', 'no_handoff');

var chatHistory = "";
var chatHistoryJson = [];

// Recommendation tracking variables
var originalRecommendation = null;
var recommendationType = null;
var shuffledProductOrder = null; // Stores the randomized display order

// Timestamp tracking variables for duration calculations
var currentPopupShownAt = null; // Track most recent popup show time for duration calc
var currentGalleryShownAt = null; // Track most recent gallery show time
var recommendationPopupOpenCount = 0; // Count how many times popup opened
var galleryOpenCount = 0; // Count how many times gallery opened

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Qualtrics helper functions for consistent data access
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

// Utility functions for delays and safe content handling
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHTML(value) {
    return String(value)
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

function formatMessageContentSafe(value, container) {
    // Qualtrics-safe message formatting using pure DOM methods (no innerHTML)
    var sanitized = sanitizeHTML(value);
    var lines = sanitized.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) {
            if (i < lines.length - 1) {
                container.appendChild(document.createElement('br'));
            }
            continue;
        }

        // Handle anchor tags (preserve onclick for product recommendations)
        var anchorRegex = /<a\s+([^>]*)>(.*?)<\/a>/gi;
        var match;
        var lastIndex = 0;
        var hasAnchors = false;

        while ((match = anchorRegex.exec(line)) !== null) {
            hasAnchors = true;
            // Text before link
            if (match.index > lastIndex) {
                var beforeText = line.substring(lastIndex, match.index);
                container.appendChild(document.createTextNode(beforeText));
            }

            // Parse anchor attributes
            var attrString = match[1];
            var linkText = match[2];

            // Create anchor element
            var anchor = document.createElement('a');
            anchor.textContent = linkText;

            // Extract href attribute
            var hrefMatch = /href=["']([^"']*)["']/i.exec(attrString);
            if (hrefMatch) {
                anchor.href = hrefMatch[1];
            }

            // Extract onclick attribute (needed for showRecommendation)
            var onclickMatch = /onclick=["']([^"']*)["']/i.exec(attrString);
            if (onclickMatch) {
                anchor.setAttribute('onclick', onclickMatch[1]);
            }

            // Set standard attributes for external links
            if (anchor.href && /^https?:/i.test(anchor.href)) {
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
            }

            // Style matching ST02 design
            anchor.style.color = '#1A73E8';
            anchor.style.textDecoration = 'underline';

            container.appendChild(anchor);

            lastIndex = anchorRegex.lastIndex;
        }

        if (hasAnchors) {
            // Remaining text after last link
            if (lastIndex < line.length) {
                var remainingText = line.substring(lastIndex);
                container.appendChild(document.createTextNode(remainingText));
            }
            if (i < lines.length - 1) {
                container.appendChild(document.createElement('br'));
            }
            continue;
        }

        // Bullet list items
        if (line.startsWith('• ') || line.startsWith('- ')) {
            var bulletSpan = document.createElement('span');
            bulletSpan.textContent = '• ';
            bulletSpan.style.marginRight = '0.5em';
            container.appendChild(bulletSpan);

            var text = line.substring(2);
            container.appendChild(document.createTextNode(text));

            if (i < lines.length - 1) {
                container.appendChild(document.createElement('br'));
            }
            continue;
        }

        // Regular paragraph
        var p = document.createElement('p');
        p.style.margin = '0';
        p.style.marginBottom = i < lines.length - 1 ? '0.5em' : '0';
        p.textContent = line;
        container.appendChild(p);
    }
}

// Inject modern CSS styles
let globalStylesInjected = false;
function injectGlobalStyles() {
    if (globalStylesInjected) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'st02-global-styles';
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

        /* Keyframe animations */
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

        @media (prefers-reduced-motion: reduce) {
            .message,
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

// Apply styles inspired by the website
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.backgroundColor = documentBackgroundColor

function addChatHeader() {
    // Create and style the chat header container (for avatar and text)
    var chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = chatHeaderBackgroundColor;
    chatHeader.style.color = chatHeaderFontColor;
    chatHeader.style.padding = "clamp(8px, 2vw, 12px)";
    chatHeader.style.textAlign = "center";
    chatHeader.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.borderTopLeftRadius = "10px";
    chatHeader.style.borderTopRightRadius = "10px";
    chatHeader.style.display = "flex"; // Flexbox for alignment
    chatHeader.style.alignItems = "center"; // Center items vertically

    // Create the avatar image element
    var avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + 'Avatar';
    avatar.style.width = "clamp(50px, 8vw, 80px)"; // Responsive avatar size
    avatar.style.height = "clamp(50px, 8vw, 80px)"; // Responsive avatar size
    avatar.style.marginRight = "clamp(8px, 2vw, 12px)"; // Responsive space between avatar and text
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

async function loadConversationHistory() {
    try {
        console.log('Loading conversation history for session: ' + compositeSessionId);

        var historyEndpoint = chatbotURL.replace('/InsuranceRecommendation', '') + '/conversation/' + compositeSessionId;
        var response = await fetch(historyEndpoint);

        if (!response.ok) {
            console.log('No previous conversation found or error loading history');
            return;
        }

        var data = await response.json();
        var history = data.history || [];

        console.log('Retrieved ' + history.length + ' messages from backend');

        var chatWindow = document.getElementById('chat-window');
        if (!chatWindow) {
            console.error('Chat window not found');
            return;
        }

        chatHistoryJson = history.slice();

        for (var h = 0; h < history.length; h++) {
            var msg = history[h];
            if (msg.role === 'user') {
                chatHistory += 'User: ' + msg.content + '\n';
            } else if (msg.role === 'assistant') {
                chatHistory += 'Agent: ' + msg.content + '\n';
            }
        }

        // Render messages in UI
        for (var i = 0; i < history.length; i++) {
            var msg = history[i];

            if (msg.role === 'user') {
                var userMessageDiv = createMessageElement('user', msg.content);
                chatWindow.appendChild(userMessageDiv);
            } else if (msg.role === 'assistant') {
                // For no_handoff: always use 'collector' agent type (seamless single agent)
                var agentType = 'collector';

                var botMessageDiv = createMessageElement('assistant', msg.content, agentType);
                chatWindow.appendChild(botMessageDiv);
            }
        }

        chatWindow.scrollTop = chatWindow.scrollHeight;
        console.log('Successfully loaded and rendered ' + history.length + ' messages');

        if (history.length === 0) {
            console.log('Empty conversation detected, sending initialization request');
            await sendInitializationMessage();
        }

    } catch (error) {
        console.error('Error loading conversation history:', error);
    }
}

async function sendInitializationMessage() {
    try {
        console.log('Initializing conversation with welcome message');
        stampQualtricsTimestampOnce('BOT_WELCOME_TS');

        var chatWindow = document.getElementById('chat-window');
        if (!chatWindow) {
            console.error('Chat window not found');
            return;
        }

        var typingIndicator = createTypingIndicator();
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        var requestData = {
            message: [],
            session_id: compositeSessionId,
            qualtrics_response_id: "${e://Field/ResponseID}",
            show_handoff: false  // ST02 no handoff - seamless single agent experience
        };

        var response = await fetch(chatbotURL, {
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
            var data = await response.json();
            var responses = Array.isArray(data.response) ? data.response : [data.response];

            for (var r = 0; r < responses.length; r++) {
                var messageContent = responses[r];
                var botTimestamp = new Date().toISOString();

                chatHistory += 'Agent: ' + messageContent + '\n';
                chatHistoryJson.push({
                    role: 'assistant',
                    content: messageContent,
                    timestamp: botTimestamp,
                    agent_type: 'collector'
                });

                var botMessageDiv = createMessageElement('assistant', messageContent, 'collector');
                chatWindow.appendChild(botMessageDiv);
            }

            chatWindow.scrollTop = chatWindow.scrollHeight;
            console.log('Initialization complete');

            setQualtricsEmbeddedData('ChatHistory', chatHistory);
            setQualtricsEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        } else {
            console.error('Failed to initialize conversation:', response.status);
        }
    } catch (error) {
        console.error('Error initializing conversation:', error);
    }
}

async function sendMessage() {
    // Immediate guard: prevent double-send on rapid clicks
    if (isSending) {
        console.log("Already sending, ignoring duplicate click");
        return;
    }

    console.log("Send button clicked");
    var userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    // Set flag immediately to block subsequent clicks
    isSending = true;

    // Clear input field immediately
    document.getElementById('user-input').value = '';

    // Disable send button with visual feedback
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    sendButton.style.opacity = '0.6';
    
    var chatWindow = document.getElementById('chat-window');
    var timestamp = new Date().toISOString();
    chatHistory += "User: " + userInput + "\n";
    chatHistoryJson.push({ role: "user", content: userInput, timestamp: timestamp });

    // User message with modern styling
    var userMessageDiv = createMessageElement('user', userInput);
    chatWindow.appendChild(userMessageDiv);

    // Scroll immediately to show user message
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Typing indicator with animation
    var typingIndicator = createTypingIndicator();
    typingIndicator.id = 'loading-message';
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        var qualtricsResponseId = "${e://Field/ResponseID}";
        var requestData = {
            message: chatHistoryJson,
            session_id: compositeSessionId,
            qualtrics_response_id: qualtricsResponseId,
            show_handoff: false  // ST02 no handoff - seamless single agent experience
        };
        
        console.log("Sending request:", JSON.stringify(requestData, null, 2));
        
        var response = await fetch(chatbotURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        // Remove typing indicator
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        if (response.ok) {
            var data = await response.json();
            var botTimestamp = new Date().toISOString();
            
            // Handle multiple messages
            var responses = Array.isArray(data.response) ? data.response : [data.response];
            var isMultiMessage = responses.length > 1; // Multi-message response
            
            console.log("Received response:", data.response);
            console.log("Processed responses:", responses);
            console.log("Is multi-message:", isMultiMessage);
            
            // Display each message with a delay
            for (let i = 0; i < responses.length; i++) {
                var messageContent = responses[i];
                // INFO AGENT V2 CHANGE: Always use 'collector' (Information Agent)
                var agentType = 'collector';
                
                console.log(`Message ${i}:`, messageContent, "Type:", typeof messageContent, "Agent:", agentType);
                
                // Add delay for non-first messages
                if (i > 0) {
                    await wait(800);
                }
                
                chatHistory += "Agent: " + messageContent + "\n";
                chatHistoryJson.push({ 
                    role: "assistant", 
                    content: messageContent,
                    timestamp: botTimestamp 
                });

                console.log("Added to chatHistoryJson:", {
                    role: "assistant", 
                    content: messageContent,
                    timestamp: botTimestamp 
                });

                // Create bot message with agent-specific styling
                var botMessageDiv = createBotMessage(messageContent, agentType);
                chatWindow.appendChild(botMessageDiv);
                
                // Scroll to bottom after each message
                chatWindow.scrollTop = chatWindow.scrollHeight;
                
                // INFO AGENT V2 CHANGE: Remove handoff system message
                // if (isHandoff && i === 0) {
                //     addSystemMessage("🔄 Handing off → Recommendation Agent");
                //     await new Promise(resolve => setTimeout(resolve, 1000));
                // }
            }

            // Stamp RECOMMENDATION_RECEIVED_TS if response contains recommendation
            if (responses.some(msg => msg.includes('showRecommendation('))) {
                stampQualtricsTimestampOnce('RECOMMENDATION_RECEIVED_TS');
            }
        } else {
            showErrorMessage("Error from server.<br>Status code: " + response.status);
            console.error("Error from server: " + response.status);
        }
        
        try{
            setQualtricsEmbeddedData('ChatHistory', chatHistory);
            setQualtricsEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
            setQualtricsEmbeddedData('CompositeSessionId', compositeSessionId);
            setQualtricsEmbeddedData('ResponseID', "${e://Field/ResponseID}");
        } catch(error) {
            console.error("Error from Qualtrics: ", error);
            compositeSessionId = "DEBUG"
            qualtricsResponseId = "DEBUG"
        }
        
        // Re-enable send button and reset sending flag
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        isSending = false;
    } catch (error) {
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }
        showErrorMessage("Network error: " + error.message);
        console.error("Network error: ", error);

        // Re-enable send button on error and reset sending flag
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        isSending = false;
    }

    // Final scroll (input already cleared earlier)
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Create message element with modern styling
function createMessageElement(role, content, agentType) {
    const wrapper = document.createElement('div');
    const normalizedRole = role === 'assistant' ? 'bot' : role;
    wrapper.className = `message ${normalizedRole}-message`;

    const label = document.createElement('div');
    label.className = 'message-label';

    // Agent-specific inline styles with colored labels (for Qualtrics compatibility)
    if (normalizedRole === 'user') {
        wrapper.style.background = 'linear-gradient(135deg, #3c3abd, #4f4cd7)';
        wrapper.style.color = '#ffffff';
        wrapper.style.alignSelf = 'flex-end';
        label.textContent = 'You';
        label.style.background = 'rgba(255, 255, 255, 0.22)';
        label.style.color = '#ffffff';
    } else if (agentType === 'recommendation') {
        wrapper.classList.add('recommendation');
        wrapper.style.background = '#E8F4F8';
        wrapper.style.color = '#000000';
        wrapper.style.border = '1px solid rgba(41, 118, 221, 0.3)';
        wrapper.style.alignSelf = 'flex-start';
        label.textContent = 'Recommendation Agent';
        label.style.background = 'rgba(41, 118, 221, 0.18)';
        label.style.color = '#2976dd';
    } else {
        wrapper.style.background = '#F0F1F9';
        wrapper.style.color = '#111322';
        wrapper.style.border = '1px solid rgba(60, 58, 189, 0.2)';
        wrapper.style.alignSelf = 'flex-start';
        label.textContent = 'Information Agent';
        label.style.background = 'rgba(60, 58, 189, 0.12)';
        label.style.color = '#3c3abd';
    }

    const body = document.createElement('div');
    body.className = 'message-body';
    formatMessageContentSafe(content, body);

    wrapper.appendChild(label);
    wrapper.appendChild(body);
    return wrapper;
}

// Create typing indicator element
function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';

    const label = document.createElement('span');
    label.className = 'typing-label';
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

function createBotMessage(content, agentType = 'collector') {
    // Use modern createMessageElement instead of inline styling
    return createMessageElement('assistant', content, agentType);
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
        
        chatHistory += "System: " + eventType + "\n";
        chatHistoryJson.push(logEntry);
        
        // Set standard embedded data
        setQualtricsEmbeddedData('ChatHistory', chatHistory);
        setQualtricsEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        setQualtricsEmbeddedData('CompositeSessionId', compositeSessionId);
        setQualtricsEmbeddedData('ResponseID', "${e://Field/ResponseID}");
        
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
            currentRecommendationType = details.type || "single";
        }
        
        if (eventType.startsWith("accepted-recommended-product-")) {
            var productNum = eventType.replace("accepted-recommended-product-", "");
            currentAccepted = productNum;
            currentWasAccepted = "true";
            currentUserJourney = details.recommendationType === "single" ? "direct-accept" : "gallery-accept-recommended";
        }
        
        if (eventType.startsWith("accepted-alternative-product-")) {
            var productNum = eventType.replace("accepted-alternative-product-", "");
            currentAccepted = productNum;
            currentWasAccepted = "false";
            currentUserJourney = "decline-then-gallery-accept";
        }
        
        if (eventType.startsWith("rejected-recommended-product-")) {
            var productNum = eventType.replace("rejected-recommended-product-", "");
            currentRejected = productNum;
            currentDeclined = productNum;
        }
        
        if (eventType === "showed-product-gallery") {
            currentRecommendationType = details.type || "gallery";
        }

        if (eventType === "declined-all-products-from-gallery") {
            currentAccepted = "UNINSURED";
            currentWasAccepted = "false";
            currentUserJourney = "declined-all-remain-uninsured";
        }

        // Store display position if available in details
        var currentDisplayPosition = getQualtricsEmbeddedData('AcceptedProductDisplayPosition') || "";
        if (details.displayPosition) {
            currentDisplayPosition = details.displayPosition;
        }

        // Always set ALL variables to ensure consistent data structure
        setQualtricsEmbeddedData('RecommendedProduct', currentRecommended);
        setQualtricsEmbeddedData('AcceptedProduct', currentAccepted);
        setQualtricsEmbeddedData('AcceptedProductDisplayPosition', currentDisplayPosition);
        setQualtricsEmbeddedData('WasRecommendationAccepted', currentWasAccepted);
        setQualtricsEmbeddedData('UserJourney', currentUserJourney);
        setQualtricsEmbeddedData('RecommendationType', currentRecommendationType);
        setQualtricsEmbeddedData('RejectedRecommendation', currentRejected);
        setQualtricsEmbeddedData('DeclinedProduct', currentDeclined);

        // Store randomized product order when gallery is shown
        if (eventType === "showed-product-gallery" && shuffledProductOrder) {
            setQualtricsEmbeddedData('RandomizedProductOrder', JSON.stringify(shuffledProductOrder));
        }
        
    } catch(error) {
        console.error("Error logging event: ", error);
        compositeSessionId = "DEBUG";
        qualtricsResponseId = "DEBUG";
    }
}

try {
    addChatHeader();

    // Hide NextButton during chat interaction
    Qualtrics.SurveyEngine.addOnload(function () {
        // Inject modern CSS styles first (inside Qualtrics callback)
        injectGlobalStyles();

        // Add CSS classes to HTML elements (inside Qualtrics callback)
        setupLayout();

        // Load conversation history when page loads (inside Qualtrics callback - DOM is now ready)
        loadConversationHistory().then(function () {
            console.log("Conversation history load attempt completed");
        }).catch(function (err) {
            console.error("Failed to load conversation history:", err);
        });

        // Hide next button
        this.hideNextButton();
        stampQualtricsTimestampOnce('PAGE_LOAD_TS');

        var nextButton = document.getElementById('NextButton');
        if (nextButton) {
            var handleNextClick = function () {
                stampQualtricsTimestampOnce('NEXT_BUTTON_TS');
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

        // Add event listeners (styling now handled by CSS classes) - inside Qualtrics callback
        var sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }

        // Handle Enter key to send message and prevent default behavior - inside Qualtrics callback
        var userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();  // Prevent default behavior like form submission
                    if (document.getElementById('user-input').value.trim() !== "") {  // Ensure input is not empty
                        sendMessage();
                    }
                }
            });
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
    container.style.margin = '20px 0';

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

    // Track popup open count and timing
    recommendationPopupOpenCount++;
    currentPopupShownAt = new Date();

    // Stamp first-time timestamp
    stampQualtricsTimestampOnce('RECOMMENDED_PRODUCT_POPUP_TS');

    // Log reopen if applicable
    if (recommendationPopupOpenCount > 1) {
        logEvent("recommended-product-popup-reopened", {
            reopenCount: recommendationPopupOpenCount
        });
    }

    showProductOverlay()

    // Update close button to log close event
    let closeButton = document.querySelector(".modal-close-button");
    if (closeButton) {
        closeButton.onclick = () => {
            logEvent("recommended-product-popup-closed", {
                timeViewedMs: currentPopupShownAt ? (new Date() - currentPopupShownAt) : null
            });
            document.getElementById("recommendation").remove();
        };
    }

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
    acceptButton.textContent = '✅Accept Product';
    // Styling handled by CSS class
    acceptButton.onclick = function() {
        // Calculate durations
        var decisionTime = new Date();
        var timeOnProduct = currentPopupShownAt ? (decisionTime - currentPopupShownAt) : null;

        // Stamp decision timestamp
        setQualtricsEmbeddedData('RECOMMENDED_PRODUCT_DECISION_TS', decisionTime.toISOString());
        setQualtricsEmbeddedData('TIME_ON_RECOMMENDED_PRODUCT_MS', timeOnProduct);

        // Calculate total decision time from recommendation received
        var recReceivedTs = getQualtricsEmbeddedData('RECOMMENDATION_RECEIVED_TS');
        if (recReceivedTs) {
            var totalTime = decisionTime - new Date(recReceivedTs);
            setQualtricsEmbeddedData('TOTAL_DECISION_TIME_MS', totalTime);
        }

        // Log acceptance with context
        logEvent("accepted-recommended-product-" + productNumber, {
            acceptedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType,
            timeOnProductMs: timeOnProduct
        });

        alert('You accepted product ' + productNumber + '!');
        document.getElementById("NextButton").click();
    };

    // Decline button
    const declineButton = document.createElement('button');
    declineButton.textContent = '❌Decline & Browse';
    // Styling handled by CSS class
    declineButton.addEventListener('click', function () {
        // Calculate durations
        var decisionTime = new Date();
        var timeOnProduct = currentPopupShownAt ? (decisionTime - currentPopupShownAt) : null;

        // Stamp decision timestamp
        setQualtricsEmbeddedData('RECOMMENDED_PRODUCT_DECISION_TS', decisionTime.toISOString());
        setQualtricsEmbeddedData('TIME_ON_RECOMMENDED_PRODUCT_MS', timeOnProduct);

        // Log decline event
        logEvent("declined-recommended-product-" + productNumber, {
            declinedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType,
            timeOnProductMs: timeOnProduct
        });

        document.getElementById("recommendation").remove();
        showAllProducts("Choose a product below")
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

function showAllProducts(message) {
  console.log("showAllProducts() called with message:", message);

  // Update recommendation type if switching from single to gallery
  if (recommendationType === "single") {
    recommendationType = "gallery-after-decline";
  } else {
    recommendationType = "gallery";
  }

  // Track gallery open count and timing
  galleryOpenCount++;
  currentGalleryShownAt = new Date();

  // Stamp first-time timestamp
  stampQualtricsTimestampOnce('PRODUCT_GALLERY_SHOWN_TS');

  // Log reopen if applicable
  if (galleryOpenCount > 1) {
    logEvent("product-gallery-reopened", {
      reopenCount: galleryOpenCount
    });
  }

  showProductOverlay();

  // Update close button to log close event
  let closeButton = document.querySelector(".modal-close-button");
  if (closeButton) {
    closeButton.onclick = () => {
      logEvent("product-gallery-closed", {
        timeViewedMs: currentGalleryShownAt ? (new Date() - currentGalleryShownAt) : null
      });
      document.getElementById("recommendation").remove();
    };
  }

  // Set prompt text
  const alertMessage = document.getElementById("recommendationMessage");
  alertMessage.innerHTML = message;

  // Hide single-image container (we're in gallery mode)
  const singleImgContainer = document.getElementById("image-container");
  if (singleImgContainer) {
    singleImgContainer.innerHTML = "";
    singleImgContainer.style.display = "none";
  }

  const content = document.getElementById("product-overlay-content");

  // Remove any previous gallery / indicator / stray nodes
  content.querySelectorAll(".carousel, .carousel-indicator, .recommendation-buttons").forEach(el => el.remove());
  // Also strip stray text nodes that contain only "/" or whitespace
  [...content.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const t = n.textContent.trim();
      if (t === "/" || t === "") {
        console.log("Removing stray text node:", JSON.stringify(t));
        n.remove();
      }
    }
  });

  // Build carousel
  const carousel = document.createElement("div");
  carousel.className = "carousel";

  const prev = document.createElement("button");
  prev.className = "prev";
  prev.type = "button";
  prev.textContent = "‹";

  const track = document.createElement("div");
  track.className = "slides";

  // Create shuffled indexes for randomized display order
  const shuffledIndexes = shuffleArray(productImageData.map((_, i) => i));
  shuffledProductOrder = shuffledIndexes.map(idx => idx + 1); // Store as product numbers (1-16)

  console.log("Randomized product order:", shuffledProductOrder);

  shuffledIndexes.forEach((originalIndex, displayPosition) => {
    const data = productImageData[originalIndex];
    const originalProductNumber = originalIndex + 1;

    const slide = document.createElement("div");
    slide.className = "slide";

    // Store original product number as data attribute
    slide.setAttribute('data-original-index', originalProductNumber);
    slide.setAttribute('data-display-position', displayPosition + 1);

    if (originalRecommendation && originalProductNumber === originalRecommendation) {
      slide.classList.add("highlighted");
    }

    const img = document.createElement("img");
    img.src = data.src;
    img.alt = data.alertText;

    // img.addEventListener("click", () => {
    //   console.log(`Slide ${displayPosition+1} clicked:`, data.alertText);
    //   alert(data.alertText);
    //   const nb = document.getElementById("NextButton");
    //   if (nb) nb.click();
    // });

    slide.appendChild(img);
    track.appendChild(slide);
  });

  const next = document.createElement("button");
  next.className = "next";
  next.type = "button";
  next.textContent = "›";

  carousel.appendChild(prev);
  carousel.appendChild(track);
  carousel.appendChild(next);
  content.appendChild(carousel);

  // ===== Fraction Indicator (SPAN‑split to avoid Qualtrics sanitizing numbers) =====
  const total = Array.isArray(productImageData) ? productImageData.length : 0;

  // Find the display position of the originally recommended product
  let idx = 0;
  if (originalRecommendation) {
    const highlightedSlide = track.querySelector('.highlighted');
    if (highlightedSlide) {
      const displayPos = parseInt(highlightedSlide.getAttribute('data-display-position'));
      idx = displayPos - 1; // Convert to 0-indexed
      console.log("Starting gallery at originally recommended product position:", displayPos);
    }
  }

  const indicator = document.createElement("div");
  indicator.className = "carousel-indicator";
  indicator.innerHTML = `<span class="ci-current"></span> / <span class="ci-total"></span>`;
  const ciCurrent = indicator.querySelector(".ci-current");
  const ciTotal   = indicator.querySelector(".ci-total");
  content.appendChild(indicator);

  function updateIndicator() {
    // clamp
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;

    ciCurrent.textContent = String(idx + 1);
    ciTotal.textContent   = String(total);

    console.log("Carousel indicator update:", {
      idx,
      total,
      indicatorCurrent: ciCurrent.textContent,
      indicatorTotal: ciTotal.textContent
    });
  }

  // Function to update Accept button text with current display position
  function updateAcceptButtonText() {
    if (window.galleryAcceptButton) {
      const currentPos = idx + 1; // 1-indexed display position in randomized carousel
      window.galleryAcceptButton.textContent = '✅Accept Product ' + currentPos;
    }
  }

  updateIndicator();

  // Nav arrow behavior (scrollIntoView is robust under Qualtrics)
  const slides = Array.from(track.children);
  let hasNavigated = false; // Track if user has navigated at all

  function goTo(i) {
    // Track first navigation
    if (!hasNavigated) {
      stampQualtricsTimestampOnce('GALLERY_FIRST_NAVIGATION_TS');
      hasNavigated = true;
    }

    idx = (i + total) % total;
    slides[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    updateIndicator();
    updateAcceptButtonText();
  }
  prev.addEventListener("click", () => goTo(idx - 1));
  next.addEventListener("click", () => goTo(idx + 1));

  // Scroll to originally recommended product position on gallery open (without counting as navigation)
  if (idx > 0 && slides[idx]) {
    slides[idx].scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    console.log("Gallery scrolled to recommended product at position:", idx + 1);
  }

  // Sync when user scrolls manually
  let scrollRAF;
  track.addEventListener("scroll", () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => {
      const width = track.clientWidth || 1;
      const newIdx = Math.round(track.scrollLeft / width);
      if (newIdx !== idx) {
        // Track first navigation via scroll
        if (!hasNavigated) {
          stampQualtricsTimestampOnce('GALLERY_FIRST_NAVIGATION_TS');
          hasNavigated = true;
        }

        idx = Math.max(0, Math.min(total - 1, newIdx));
        updateIndicator();
        updateAcceptButtonText();
      }
    });
  });

  // ===== Accept/Decline Buttons =====
  const acceptButton = document.createElement('button');
  acceptButton.textContent = '✅Accept';
  acceptButton.className = "custom-recommendation-button";

  // Store reference globally for dynamic updates
  window.galleryAcceptButton = acceptButton;

  // Set initial product number
  updateAcceptButtonText();
  acceptButton.onclick = function() {
    var track = document.querySelector('.carousel .slides');
    var displayPosition = 0; // default fallback (0-indexed)
    if (track) {
      var width = track.clientWidth || 1;
      displayPosition = Math.round(track.scrollLeft / width);
    }

    // Get the actual slide element at this display position
    var currentSlideElement = track.children[displayPosition];

    // Retrieve the original product number from data attribute
    var originalProductNumber = parseInt(currentSlideElement.getAttribute('data-original-index'));
    var displayPos = parseInt(currentSlideElement.getAttribute('data-display-position'));

    // Calculate durations
    var decisionTime = new Date();
    var timeInGallery = currentGalleryShownAt ? (decisionTime - currentGalleryShownAt) : null;

    // Stamp decision timestamp
    setQualtricsEmbeddedData('GALLERY_DECISION_TS', decisionTime.toISOString());
    setQualtricsEmbeddedData('TIME_IN_GALLERY_MS', timeInGallery);

    // Calculate total decision time from recommendation received
    var recReceivedTs = getQualtricsEmbeddedData('RECOMMENDATION_RECEIVED_TS');
    if (recReceivedTs) {
      var totalTime = decisionTime - new Date(recReceivedTs);
      setQualtricsEmbeddedData('TOTAL_DECISION_TIME_MS', totalTime);
    }

    console.log("Accepted product:", {
      originalProductNumber: originalProductNumber,
      displayPosition: displayPos,
      wasRecommended: originalRecommendation === originalProductNumber,
      timeInGalleryMs: timeInGallery
    });

    // Determine if this matches the original recommendation
    var wasRecommended = (originalRecommendation === originalProductNumber);
    var eventType = wasRecommended ?
      "accepted-recommended-product-" + originalProductNumber :
      "accepted-alternative-product-" + originalProductNumber;

    // Log acceptance with full context including display position
    logEvent(eventType, {
      acceptedProduct: originalProductNumber,
      displayPosition: displayPos,
      originalRecommendation: originalRecommendation,
      wasRecommended: wasRecommended,
      recommendationType: recommendationType,
      timeInGalleryMs: timeInGallery
    });

    // If they chose alternative, also log the rejection of original
    if (!wasRecommended && originalRecommendation) {
      logEvent("rejected-recommended-product-" + originalRecommendation, {
        rejectedProduct: originalRecommendation,
        chosenInstead: originalProductNumber,
        chosenDisplayPosition: displayPos,
        recommendationType: recommendationType
      });
    }

    alert('You accepted product ' + originalProductNumber + '!');
    var nb = document.getElementById("NextButton");
    if (nb) nb.click();
  };

  /* DECLINE LOGIC - START */
  const declineButton = document.createElement('button');
  declineButton.textContent = '❌Remain Uninsured';
  declineButton.className = "custom-recommendation-button";
  declineButton.onclick = function() {
    // Calculate durations
    var decisionTime = new Date();
    var timeInGallery = currentGalleryShownAt ? (decisionTime - currentGalleryShownAt) : null;

    // Stamp decision timestamp
    setQualtricsEmbeddedData('GALLERY_DECISION_TS', decisionTime.toISOString());
    setQualtricsEmbeddedData('TIME_IN_GALLERY_MS', timeInGallery);

    // Calculate total decision time from recommendation received
    var recReceivedTs = getQualtricsEmbeddedData('RECOMMENDATION_RECEIVED_TS');
    if (recReceivedTs) {
      var totalTime = decisionTime - new Date(recReceivedTs);
      setQualtricsEmbeddedData('TOTAL_DECISION_TIME_MS', totalTime);
    }

    // Log decline from gallery
    logEvent("declined-all-products-from-gallery", {
      originalRecommendation: originalRecommendation,
      recommendationType: recommendationType,
      timeInGalleryMs: timeInGallery
    });

    document.getElementById("recommendation").remove();

    // Show decline message and proceed to next question
    alert('Thank you for your feedback. You have declined all products.');

    // Advance to next question
    var nb = document.getElementById("NextButton");
    if (nb) nb.click();
  };
  /* DECLINE LOGIC - END */

  // Wrap buttons in container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = "recommendation-buttons";
  buttonContainer.appendChild(acceptButton);
  
  /* DECLINE LOGIC - START */
  buttonContainer.appendChild(declineButton);
  /* DECLINE LOGIC - END */
  
  content.appendChild(buttonContainer);

  // Log the gallery display event
  logEvent("showed-product-gallery", {
    totalProducts: productImageData.length,
    type: recommendationType,
    originalRecommendation: originalRecommendation,
    message: message
  });
}




// Test errormessage on site load:
//showErrorMessage("Test")

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
      color: ${sendButtonColor};
    }

    #recommendationMessage {
      color: #b60000;
      margin-bottom: clamp(1rem, 3vw, 1.5rem);
      text-align: center;
      font-size: clamp(1.125rem, 2.5vw, 1.5rem);
      line-height: 1.3;
    }

    /* Container we originally used for a single image. We'll clear/hide it in the gallery case. */
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
      color: #FFFFFF !important;
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

    /* ===== Carousel ===== */
    .carousel {
      position: relative;
      width: 100%;
      margin: clamp(1.25rem, 4vw, 2rem) 0;
    }
    /* Scroll container */
    .carousel .slides {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;              /* Firefox */
      scrollbar-color: rgba(0,0,0,.3) transparent;
    }
    /* WebKit scrollbar styling */
    .carousel .slides::-webkit-scrollbar {
      height: 8px;
    }
    .carousel .slides::-webkit-scrollbar-track {
      background: transparent;
    }
    .carousel .slides::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.3);
      border-radius: 4px;
    }

    .carousel .slide {
      position: relative;
      flex: 0 0 100%;
      scroll-snap-align: center;
      box-sizing: border-box;
      padding: 0 clamp(2rem, 8vw, 4rem);
      overflow: hidden;
    }
    .carousel .slide img {
      width: 100%;
      display: block;
      border-radius: clamp(0.5rem, 1vw, 0.75rem);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      aspect-ratio: 16/9;
      object-fit: cover;
    }
    .carousel .slide.highlighted img {
      border: 6px solid #FFD700;
    }
    .carousel .slide.highlighted::after {
      content: "Originally suggested";
      position: absolute;
      top: clamp(0.5rem, 2vw, 1rem);
      left: clamp(0.5rem, 2vw, 1rem);
      background:rgba(255, 217, 0, 0.9);
      color: #000;
      font-weight: bold;
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .carousel .slide img:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Prev/Next Arrows */
    .carousel .prev,
    .carousel .next {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(75, 72, 236, 0.50);
      color: #fff;
      border: none;
      padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.25rem);
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      line-height: 1;
      cursor: pointer;
      z-index: 2;
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s ease, transform 0.1s ease;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .carousel .prev:hover,
    .carousel .next:hover {
      background: #3c3abd;
      transform: translateY(-50%) translateY(-1px);
    }
    .carousel .prev:active,
    .carousel .next:active {
      transform: translateY(-50%) translateY(0);
    }
    .carousel .prev { left: clamp(0.5rem, 2vw, 1.25rem); }
    .carousel .next { right: clamp(0.5rem, 2vw, 1.25rem); }

    /* Fraction Indicator */
    .carousel-indicator {
	  margin-top: clamp(0.75rem, 2vw, 1rem);
	  font-size: clamp(1rem, 2.5vw, 1.25rem) !important;
	  line-height: 1.3;
	  color: #333 !important;
	  text-align: center;
	  white-space: nowrap;
	  min-height: 1.3em;
	  font-weight: 500;
	}
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
}