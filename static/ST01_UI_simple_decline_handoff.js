console.log('ST01_UI_simple_decline_handoff.js - Study 1: Simple Decline with Handoff');

var chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Comparabot Insurance Finder';
var avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png';

var productImageData = [
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_01.jpg', alertText: 'Professional Insurance Option 1' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_02.jpg', alertText: 'Professional Insurance Option 2' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_03.jpg', alertText: 'Professional Insurance Option 3' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_04.jpg', alertText: 'Professional Insurance Option 4' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_05.jpg', alertText: 'Professional Insurance Option 5' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_06.jpg', alertText: 'Professional Insurance Option 6' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_07.jpg', alertText: 'Professional Insurance Option 7' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_08.jpg', alertText: 'Professional Insurance Option 8' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_09.jpg', alertText: 'Professional Insurance Option 9' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_10.jpg', alertText: 'Professional Insurance Option 10' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_11.jpg', alertText: 'Professional Insurance Option 11' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_12.jpg', alertText: 'Professional Insurance Option 12' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_13.jpg', alertText: 'Professional Insurance Option 13' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_14.jpg', alertText: 'Professional Insurance Option 14' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_15.jpg', alertText: 'Professional Insurance Option 15' },
    { src: 'https://storage.googleapis.com/images-mobilab/product_sheet_16.jpg', alertText: 'Professional Insurance Option 16' }
];

var sessionId = generateSessionId();
var chatHistory = '';
var chatHistoryJson = [];
var globalStylesInjected = false;
var isSending = false;
var sendButtonElement = null;
var originalRecommendation = null;
var recommendationType = null;

function generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto && typeof crypto.randomUUID === 'function') {
        return 'session_' + crypto.randomUUID();
    }
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function injectChatStyles() {
    if (globalStylesInjected) {
        return;
    }

    var css = [
        '#chat-container {',
        '  --chat-shell-background: radial-gradient(circle at 20% 20%, rgba(60, 58, 189, 0.08), transparent 55%), radial-gradient(circle at 80% 0%, rgba(60, 58, 189, 0.06), transparent 45%), #f5f7fb;',
        '  --chat-surface: #ffffff;',
        '  --chat-border: rgba(32, 38, 50, 0.08);',
        '  --chat-shadow: 0 32px 60px rgba(15, 23, 42, 0.15);',
        '  --accent-primary: #3c3abd;',
        '  --accent-secondary: #4f4cd7;',
        '  --accent-tertiary: #2976dd;',
        '  --text-primary: #111322;',
        '  --text-secondary: rgba(17, 19, 34, 0.72);',
        '  --bot-message-surface: rgba(60, 58, 189, 0.06);',
        '  --handover-message-surface: linear-gradient(140deg, rgba(60, 58, 189, 0.08), rgba(41, 118, 221, 0.12));',
        '  --recommendation-surface: linear-gradient(135deg, rgba(41, 118, 221, 0.08), rgba(30, 147, 255, 0.12));',
        '  --system-message-surface: rgba(17, 19, 34, 0.06);',
        '  --step-background: rgba(255, 255, 255, 0.82);',
        '  --label-pill-radius: 999px;',
        '  font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;',
        '  color: var(--text-primary);',
        '}',
        '#chat-container * { box-sizing: border-box; }',
        '#chat-container.chat-shell { background: var(--chat-surface); border-radius: 24px; border: 1px solid var(--chat-border); box-shadow: var(--chat-shadow); display: flex; flex-direction: column; max-width: min(900px, 100%); margin: 0 auto; overflow: hidden; backdrop-filter: blur(8px); }',
        '#chat-container .chat-header { display: flex; align-items: center; gap: 16px; padding: clamp(18px, 4vw, 28px); background: linear-gradient(135deg, rgba(60, 58, 189, 0.95), rgba(41, 118, 221, 0.92)); color: #ffffff; }',
        '#chat-container .chat-header-avatar { width: clamp(48px, 6vw, 64px); height: clamp(48px, 6vw, 64px); border-radius: 14px; background: rgba(255, 255, 255, 0.2); display: grid; place-items: center; overflow: hidden; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2); }',
        '#chat-container .chat-header-avatar img { width: 100%; height: 100%; object-fit: cover; }',
        '#chat-container .chat-header-copy { display: flex; flex-direction: column; gap: 6px; }',
        '#chat-container .chat-header-title { font-size: clamp(1.15rem, 3vw, 1.4rem); font-weight: 600; letter-spacing: 0.01em; }',
        '#chat-container .chat-header-subtitle { font-size: clamp(0.85rem, 2.5vw, 0.95rem); opacity: 0.82; }',
        '#chat-window.chat-scroll-region { display: flex; flex-direction: column; gap: clamp(12px, 2.6vw, 18px); padding: clamp(18px, 4vw, 32px); background: var(--chat-surface); overflow-y: auto; max-height: min(70vh, 640px); }',
        '#chat-window.chat-scroll-region::-webkit-scrollbar { width: 10px; }',
        '#chat-window.chat-scroll-region::-webkit-scrollbar-thumb { background: rgba(60, 58, 189, 0.25); border-radius: 8px; }',
        '#chat-container .message { display: flex; flex-direction: column; gap: 8px; padding: clamp(14px, 3vw, 18px); border-radius: 18px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1); max-width: min(640px, 92%); position: relative; isolation: isolate; }',
        '#chat-container .message.user-message { align-self: flex-end; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: #ffffff; }',
        '#chat-container .message.bot-message { align-self: flex-start; background: var(--bot-message-surface); color: var(--text-primary); border: 1px solid rgba(60, 58, 189, 0.08); }',
        '#chat-container .message.bot-message::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: linear-gradient(145deg, rgba(60, 58, 189, 0.08), transparent 62%); mix-blend-mode: multiply; opacity: 0.45; }',
        '#chat-container .message.bot-message.recommendation { background: var(--recommendation-surface); border: 1px solid rgba(41, 118, 221, 0.22); box-shadow: 0 24px 48px rgba(41, 118, 221, 0.18); }',
        '#chat-container .message.bot-message.recommendation::before { background: linear-gradient(160deg, rgba(41, 118, 221, 0.18), transparent 58%); opacity: 0.4; mix-blend-mode: normal; }',
        '#chat-container .message.system-message { align-self: center; background: var(--system-message-surface); color: var(--text-secondary); box-shadow: none; padding-inline: clamp(16px, 4vw, 28px); text-align: center; }',
        '#chat-container .message.handover-message { align-self: center; background: transparent; border: none; box-shadow: none; max-width: min(420px, 92%); text-align: center; }',
        '#chat-container .message-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--label-pill-radius); background: rgba(17, 19, 34, 0.06); color: var(--text-secondary); align-self: flex-start; }',
        '#chat-container .message-label::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.7; }',
        '#chat-container .user-message .message-label { background: rgba(255, 255, 255, 0.22); color: #ffffff; }',
        '#chat-container .bot-message .message-label { background: rgba(60, 58, 189, 0.12); color: var(--accent-primary); }',
        '#chat-container .bot-message.recommendation .message-label { background: rgba(41, 118, 221, 0.18); color: var(--accent-tertiary); }',
        '#chat-container .handover-message .message-label { background: rgba(60, 58, 189, 0.16); color: var(--accent-primary); align-self: center; }',
        '#chat-container .message-body { font-size: clamp(0.9rem, 2.6vw, 1.05rem); line-height: 1.6; color: inherit; }',
        '#chat-container .message-body ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 6px; }',
        '#chat-container .message-body p { margin: 0; }',
        '#chat-container .message-body a { color: var(--accent-primary); text-decoration: underline; font-weight: 500; transition: color 0.2s ease, text-decoration-color 0.2s ease; }',
        '#chat-container .message-body a:hover, #chat-container .message-body a:focus { color: var(--accent-secondary); text-decoration: none; }',
        '#chat-container .typing-indicator { align-self: flex-start; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 14px; background: rgba(60, 58, 189, 0.08); box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12); color: var(--text-secondary); }',
        '#chat-container .typing-dots { display: flex; align-items: center; gap: 6px; }',
        '#chat-container .typing-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent-primary); opacity: 0.2; animation: typingPulse 1.3s ease-in-out infinite; }',
        '#chat-container .typing-dot:nth-child(2) { animation-delay: 0.16s; }',
        '#chat-container .typing-dot:nth-child(3) { animation-delay: 0.32s; }',
        '#input-row.chat-input-row { display: flex; gap: 12px; padding: clamp(16px, 4vw, 24px); background: rgba(60, 58, 189, 0.03); border-top: 1px solid rgba(60, 58, 189, 0.08); }',
        '#user-input.chat-input { flex: 1 1 auto; min-width: 0; border-radius: 14px; border: 1px solid rgba(17, 19, 34, 0.12); padding: 14px 18px; font-size: 1rem; line-height: 1.4; background: #ffffff; color: var(--text-primary); transition: border-color 0.2s ease, box-shadow 0.2s ease; box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06); }',
        '#user-input.chat-input:focus { outline: none; border-color: rgba(60, 58, 189, 0.48); box-shadow: 0 0 0 4px rgba(60, 58, 189, 0.12); }',
        '#user-input.chat-input::placeholder { color: rgba(17, 19, 34, 0.45); }',
        '#send-button.chat-send-button { flex: 0 0 auto; border-radius: 12px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: #ffffff; border: none; padding: 0 clamp(18px, 3vw, 26px); font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; min-height: 48px; transition: transform 0.18s ease, box-shadow 0.2s ease; position: relative; }',
        '#send-button.chat-send-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 18px 36px rgba(60, 58, 189, 0.25); }',
        '#send-button.chat-send-button:disabled { opacity: 0.65; cursor: wait; box-shadow: none; }',
        '#send-button.chat-send-button.is-loading::after { content: ""; position: absolute; right: clamp(12px, 3vw, 18px); width: 16px; height: 16px; border-radius: 999px; border: 2px solid rgba(255, 255, 255, 0.45); border-top-color: #ffffff; animation: spinner 0.75s linear infinite; }',
        '#chat-container .handover-sequence { display: flex; flex-direction: column; align-items: center; gap: 18px; }',
        '#chat-container .handover-title { font-weight: 600; font-size: clamp(0.95rem, 2.6vw, 1.08rem); color: var(--accent-primary); letter-spacing: 0.02em; }',
        '#chat-container .handover-subtitle { font-size: clamp(0.8rem, 2.3vw, 0.92rem); color: rgba(17, 19, 34, 0.68); max-width: 32ch; }',
        '#chat-container .handover-steps { position: relative; display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; padding-block: 8px 4px; }',
        '#chat-container .handover-steps::before { content: ""; position: absolute; top: 22px; bottom: 22px; left: 50%; transform: translateX(-50%); width: 2px; background: linear-gradient(180deg, rgba(60, 58, 189, 0.22), rgba(41, 118, 221, 0.18)); pointer-events: none; }',
        '#chat-container .handover-step { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 16px; background: var(--step-background); box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12); width: min(280px, 92%); }',
        '#chat-container .handover-step-marker { width: 18px; height: 18px; border-radius: 999px; border: 2px solid rgba(60, 58, 189, 0.35); display: inline-flex; align-items: center; justify-content: center; background: rgba(60, 58, 189, 0.12); position: relative; }',
        '#chat-container .handover-step-marker::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: rgba(60, 58, 189, 0.55); }',
        '#chat-container .handover-step.active { box-shadow: 0 24px 48px rgba(60, 58, 189, 0.22); }',
        '#chat-container .handover-step.active .handover-step-marker { border-color: rgba(60, 58, 189, 0.6); background: rgba(60, 58, 189, 0.16); }',
        '#chat-container .handover-step.completed .handover-step-marker { border-color: rgba(41, 118, 221, 0.6); background: rgba(41, 118, 221, 0.16); }',
        '#chat-container .handover-step.completed .handover-step-marker::after { background: rgba(41, 118, 221, 0.8); }',
        '#chat-container .handover-step-label { font-size: clamp(0.82rem, 2.4vw, 0.9rem); color: rgba(17, 19, 34, 0.7); }',
        '#chat-container .handover-message.handover-complete .handover-steps::before { opacity: 0; }',
        '#chat-container .chat-modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: none; align-items: center; justify-content: center; z-index: 1000; }',
        '#chat-container .chat-modal-backdrop.is-visible { display: flex; }',
        '#chat-container .chat-modal { background: #ffffff; border-radius: 18px; box-shadow: 0 32px 68px rgba(15, 23, 42, 0.24); width: clamp(320px, 90vw, 60rem); max-height: 90vh; overflow-y: auto; padding: clamp(24px, 4vw, 36px); display: flex; flex-direction: column; gap: clamp(16px, 4vw, 24px); position: relative; }',
        '#chat-container .chat-modal-close { position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: rgba(17, 19, 34, 0.5); font-size: 24px; cursor: pointer; }',
        '#chat-container .chat-modal-close:hover { color: var(--accent-primary); }',
        '#chat-container .chat-modal-message { font-size: clamp(1.05rem, 2.8vw, 1.25rem); color: var(--text-primary); text-align: center; }',
        '#chat-container .chat-modal-image img { width: 100%; max-width: min(50rem, 90vw); display: block; margin: 0 auto; border-radius: clamp(0.5rem, 1vw, 0.75rem); box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16); }',
        '#chat-container .chat-modal-buttons { display: flex; justify-content: center; gap: clamp(0.75rem, 2vw, 1.25rem); flex-wrap: wrap; }',
        '#chat-container .chat-modal-button { padding: clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 4vw, 2rem); background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: #ffffff; border: none; border-radius: clamp(0.25rem, 1vw, 0.5rem); font-size: clamp(1rem, 2.5vw, 1.125rem); cursor: pointer; min-height: 44px; min-width: 120px; transition: transform 0.1s ease, box-shadow 0.2s ease; }',
        '#chat-container .chat-modal-button:hover { transform: translateY(-1px); box-shadow: 0 18px 40px rgba(60, 58, 189, 0.2); }',
        '@keyframes typingPulse { 0%, 100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }',
        '@keyframes spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'qualtrics-chat-styles';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    globalStylesInjected = true;
}

function setupLayout() {
    injectChatStyles();

    var chatContainer = document.getElementById('chat-container');
    if (chatContainer && chatContainer.className.indexOf('chat-shell') === -1) {
        chatContainer.className = (chatContainer.className ? chatContainer.className + ' ' : '') + 'chat-shell';
    }

    var chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        if (chatWindow.className.indexOf('chat-scroll-region') === -1) {
            chatWindow.className = (chatWindow.className ? chatWindow.className + ' ' : '') + 'chat-scroll-region';
        }
        if (chatWindow.innerHTML && chatWindow.innerHTML.replace(/\s|&nbsp;/g, '') === '') {
            chatWindow.innerHTML = '';
        }
    }

    var inputRow = document.getElementById('input-row');
    if (inputRow && inputRow.className.indexOf('chat-input-row') === -1) {
        inputRow.className = (inputRow.className ? inputRow.className + ' ' : '') + 'chat-input-row';
    }

    var userInput = document.getElementById('user-input');
    if (userInput) {
        if (userInput.className.indexOf('chat-input') === -1) {
            userInput.className = (userInput.className ? userInput.className + ' ' : '') + 'chat-input';
        }
        if (!userInput.getAttribute('placeholder')) {
            userInput.setAttribute('placeholder', 'Ask for personalized insurance guidance…');
        }
    }

    var sendButton = document.getElementById('send-button');
    if (sendButton) {
        if (sendButton.className.indexOf('chat-send-button') === -1) {
            sendButton.className = (sendButton.className ? sendButton.className + ' ' : '') + 'chat-send-button';
        }
        sendButtonElement = sendButton;
    }
}

function addChatHeader() {
    var chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    var previous = chatWindow.previousElementSibling;
    if (previous && previous.className && previous.className.indexOf('chat-header') !== -1) {
        return;
    }

    var chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';

    var avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'chat-header-avatar';

    var avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + ' Avatar';
    avatarWrapper.appendChild(avatar);

    var copyWrapper = document.createElement('div');
    copyWrapper.className = 'chat-header-copy';

    var title = document.createElement('div');
    title.className = 'chat-header-title';
    title.textContent = chatTitle;

    var subtitle = document.createElement('div');
    subtitle.className = 'chat-header-subtitle';
    subtitle.textContent = 'Powered by multi-agent intelligence';

    copyWrapper.appendChild(title);
    copyWrapper.appendChild(subtitle);

    chatHeader.appendChild(avatarWrapper);
    chatHeader.appendChild(copyWrapper);

    chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
}

function escapeHTML(value) {
    var str = value == null ? '' : String(value);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeHTML(value) {
    var container = document.createElement('div');
    container.innerHTML = value;

    var allowedElements = { P: true, BR: true, UL: true, OL: true, LI: true, STRONG: true, EM: true, B: true, I: true, A: true, SPAN: true };
    var allowedAnchorAttributes = { href: true, target: true, rel: true, onclick: true, title: true };

    function walk(node) {
        var childNodes = node.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--) {
            var child = childNodes[i];
            if (child.nodeType === 1) {
                var tagName = child.tagName;
                if (!allowedElements[tagName]) {
                    while (child.firstChild) {
                        node.insertBefore(child.firstChild, child);
                    }
                    node.removeChild(child);
                    continue;
                }

                if (tagName === 'A') {
                    var href = child.getAttribute('href');
                    if (href && /^\s*javascript:/i.test(href)) {
                        child.removeAttribute('href');
                    }
                    if (href && /^https?:/i.test(href) && !child.hasAttribute('target')) {
                        child.setAttribute('target', '_blank');
                        child.setAttribute('rel', 'noopener');
                    }
                    var attrList = child.attributes;
                    for (var a = attrList.length - 1; a >= 0; a--) {
                        var attr = attrList[a];
                        if (!allowedAnchorAttributes[attr.name]) {
                            child.removeAttribute(attr.name);
                        }
                    }
                } else {
                    var attributes = child.attributes;
                    for (var j = attributes.length - 1; j >= 0; j--) {
                        child.removeAttribute(attributes[j].name);
                    }
                }
                walk(child);
            } else if (child.nodeType === 8) {
                node.removeChild(child);
            }
        }
    }

    walk(container);
    return container.innerHTML;
}

function formatMessageContent(value) {
    var normalized = value == null ? '' : String(value);
    normalized = normalized.replace(/\r\n?/g, '\n');
    if (!/\S/.test(normalized)) {
        return '';
    }

    var paragraphs = normalized.split(/\n{2,}/);
    var formatted = [];

    for (var i = 0; i < paragraphs.length; i++) {
        var paragraph = paragraphs[i];
        var trimmed = paragraph.replace(/^\s+|\s+$/g, '');
        if (!trimmed) {
            continue;
        }

        if (/<[^>]+>/.test(trimmed)) {
            formatted.push(trimmed);
            continue;
        }

        var lines = trimmed.split(/\n/);
        var bulletLines = lines.length > 1;
        for (var j = 0; j < lines.length; j++) {
            var line = lines[j].replace(/^\s+/, '');
            if (!/^[-*]\s+/.test(line)) {
                bulletLines = false;
                break;
            }
        }

        if (bulletLines) {
            var items = [];
            for (var k = 0; k < lines.length; k++) {
                var cleanLine = lines[k].replace(/^\s*[-*]\s+/, '');
                if (cleanLine) {
                    items.push('<li>' + escapeHTML(cleanLine) + '</li>');
                }
            }
            formatted.push('<ul>' + items.join('') + '</ul>');
        } else {
            var escapedLines = [];
            for (var l = 0; l < lines.length; l++) {
                escapedLines.push(escapeHTML(lines[l]));
            }
            formatted.push('<p>' + escapedLines.join('<br>') + '</p>');
        }
    }

    return sanitizeHTML(formatted.join(''));
}

function createMessageElement(role, content, agentType) {
    var wrapper = document.createElement('div');
    var normalizedRole = role === 'assistant' ? 'bot' : role;
    wrapper.className = 'message ' + normalizedRole + '-message';

    if (normalizedRole === 'bot' && agentType === 'recommendation') {
        wrapper.className += ' recommendation';
    }
    if (normalizedRole === 'system') {
        wrapper.className = 'message system-message';
    }
    if (normalizedRole === 'handover') {
        wrapper.className = 'message handover-message';
    }

    var label = document.createElement('div');
    label.className = 'message-label';

    if (normalizedRole === 'user') {
        label.textContent = 'You';
    } else if (normalizedRole === 'bot' && agentType === 'recommendation') {
        label.textContent = 'Recommendation Agent';
    } else if (normalizedRole === 'bot') {
        label.textContent = 'Information Agent';
    } else if (normalizedRole === 'system') {
        label.textContent = 'System';
    } else if (normalizedRole === 'handover') {
        label.textContent = 'Agent Handoff';
    }

    var body = document.createElement('div');
    body.className = 'message-body';
    body.innerHTML = formatMessageContent(content);

    wrapper.appendChild(label);
    wrapper.appendChild(body);

    return wrapper;
}

function createTypingIndicator() {
    var indicator = document.createElement('div');
    indicator.className = 'typing-indicator';

    var label = document.createElement('span');
    label.textContent = botName + ' is thinking';

    var dots = document.createElement('div');
    dots.className = 'typing-dots';

    for (var i = 0; i < 3; i++) {
        var dot = document.createElement('span');
        dot.className = 'typing-dot';
        dots.appendChild(dot);
    }

    indicator.appendChild(label);
    indicator.appendChild(dots);

    return indicator;
}

function scrollChatToBottom() {
    var chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function setSendButtonState(isDisabled, isLoading) {
    if (!sendButtonElement) {
        return;
    }
    sendButtonElement.disabled = !!isDisabled;
    if (isLoading) {
        if (sendButtonElement.className.indexOf('is-loading') === -1) {
            sendButtonElement.className += ' is-loading';
        }
    } else if (sendButtonElement.className.indexOf('is-loading') !== -1) {
        sendButtonElement.className = sendButtonElement.className.replace(/\bis-loading\b/, '').replace(/\s+/g, ' ').trim();
    }
}

function appendMessage(role, content, agentType) {
    var chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return null;
    }
    var element = createMessageElement(role, content, agentType);
    chatWindow.appendChild(element);
    scrollChatToBottom();
    return element;
}

function addSystemMessage(message) {
    appendMessage('system', message, null);
}

function ensureQualtricsData(key, value) {
    try {
        if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine && typeof Qualtrics.SurveyEngine.setJSEmbeddedData === 'function') {
            Qualtrics.SurveyEngine.setJSEmbeddedData(key, value);
        }
    } catch (error) {
        console.error('Qualtrics data error:', error);
    }
}

function logEvent(eventType, details) {
    try {
        var timestamp = new Date().toISOString();
        var logEntry = { role: 'system', content: eventType, timestamp: timestamp, details: details || {} };
        chatHistory += 'System: ' + eventType + '\n';
        chatHistoryJson.push(logEntry);

        ensureQualtricsData('ChatHistory', chatHistory);
        ensureQualtricsData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        ensureQualtricsData('SessionId', sessionId);
        ensureQualtricsData('ResponseID', '${e://Field/ResponseID}');

        var canRead = typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine && typeof Qualtrics.SurveyEngine.getJSEmbeddedData === 'function';
        var currentRecommended = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendedProduct') || '') : '';
        var currentAccepted = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('AcceptedProduct') || '') : '';
        var currentWasAccepted = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('WasRecommendationAccepted') || '') : '';
        var currentUserJourney = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('UserJourney') || '') : '';
        var currentRecommendationType = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendationType') || '') : '';
        var currentRejected = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('RejectedRecommendation') || '') : '';
        var currentDeclined = canRead ? (Qualtrics.SurveyEngine.getJSEmbeddedData('DeclinedProduct') || '') : '';

        if (eventType.indexOf('recommended-product-') === 0) {
            var productNum = eventType.replace('recommended-product-', '');
            currentRecommended = productNum;
            currentRecommendationType = 'single';
        }
        if (eventType.indexOf('accepted-recommended-product-') === 0) {
            var acceptedNum = eventType.replace('accepted-recommended-product-', '');
            currentAccepted = acceptedNum;
            currentWasAccepted = 'true';
            currentUserJourney = 'direct-accept';
        }
        if (eventType.indexOf('declined-recommended-product-') === 0) {
            var declinedNum = eventType.replace('declined-recommended-product-', '');
            currentAccepted = '';
            currentWasAccepted = 'false';
            currentUserJourney = 'decline-only';
            currentDeclined = declinedNum;
            currentRejected = declinedNum;
        }

        ensureQualtricsData('RecommendedProduct', currentRecommended);
        ensureQualtricsData('AcceptedProduct', currentAccepted);
        ensureQualtricsData('WasRecommendationAccepted', currentWasAccepted);
        ensureQualtricsData('UserJourney', currentUserJourney);
        ensureQualtricsData('RecommendationType', currentRecommendationType);
        ensureQualtricsData('RejectedRecommendation', currentRejected);
        ensureQualtricsData('DeclinedProduct', currentDeclined);
    } catch (error) {
        console.error('Error logging event:', error);
    }
}

async function renderHandoverSequence(chatWindow) {
    if (!chatWindow) {
        return;
    }

    var handoverMessage = createMessageElement('handover', '');
    var body = handoverMessage.querySelector('.message-body');
    if (!body) {
        body = document.createElement('div');
        body.className = 'message-body';
        handoverMessage.appendChild(body);
    }
    body.innerHTML = '';

    var sequenceContainer = document.createElement('div');
    sequenceContainer.className = 'handover-sequence';

    var title = document.createElement('div');
    title.className = 'handover-title';
    title.textContent = 'Handing over';

    var subtitle = document.createElement('div');
    subtitle.className = 'handover-subtitle';
    subtitle.textContent = "We're routing your conversation to the right specialist.";

    var stepsWrapper = document.createElement('div');
    stepsWrapper.className = 'handover-steps';

    var steps = [
        { label: 'Handing over to Insurance Specialist' },
        { label: 'Thinking' },
        { label: 'Getting top recommendation' }
    ];

    var stepElements = [];

    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        var stepElement = document.createElement('div');
        stepElement.className = 'handover-step';

        var marker = document.createElement('span');
        marker.className = 'handover-step-marker';
        marker.setAttribute('aria-hidden', 'true');

        var label = document.createElement('span');
        label.className = 'handover-step-label';
        label.textContent = step.label;

        stepElement.appendChild(marker);
        stepElement.appendChild(label);
        stepsWrapper.appendChild(stepElement);
        stepElements.push(stepElement);
    }

    sequenceContainer.appendChild(title);
    sequenceContainer.appendChild(subtitle);
    sequenceContainer.appendChild(stepsWrapper);
    body.appendChild(sequenceContainer);
    chatWindow.appendChild(handoverMessage);
    scrollChatToBottom();

    for (var j = 0; j < stepElements.length; j++) {
        var currentStep = stepElements[j];
        await wait(j === 0 ? 200 : 850);
        currentStep.className += currentStep.className.indexOf('active') === -1 ? ' active' : '';
        if (j > 0) {
            var previousStep = stepElements[j - 1];
            previousStep.className = previousStep.className.replace(' active', ' completed');
            previousStep.className = previousStep.className.indexOf('completed') === -1 ? previousStep.className + ' completed' : previousStep.className;
        }
        scrollChatToBottom();
    }

    await wait(850);

    var lastStep = stepElements[stepElements.length - 1];
    lastStep.className = lastStep.className.replace(' active', ' completed');
    if (handoverMessage.className.indexOf('handover-complete') === -1) {
        handoverMessage.className += ' handover-complete';
    }
    scrollChatToBottom();
}

function closeModalById(id) {
    var existing = document.getElementById(id);
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }
}

function triggerNextButton() {
    var nextButton = document.getElementById('NextButton');
    if (nextButton) {
        nextButton.click();
    }
}

function showProductOverlay(productNumber, message) {
    var chatContainer = document.getElementById('chat-container');
    if (!chatContainer) {
        return;
    }

    closeModalById('chat-product-overlay');

    originalRecommendation = productNumber;
    recommendationType = 'single';

    var backdrop = document.createElement('div');
    backdrop.className = 'chat-modal-backdrop is-visible';
    backdrop.id = 'chat-product-overlay';

    var modal = document.createElement('div');
    modal.className = 'chat-modal';

    var closeButton = document.createElement('button');
    closeButton.className = 'chat-modal-close';
    closeButton.type = 'button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function () {
        closeModalById('chat-product-overlay');
    };

    var messageBlock = document.createElement('div');
    messageBlock.className = 'chat-modal-message';
    messageBlock.innerHTML = formatMessageContent(message || 'Here is your recommended product.');

    var imageWrapper = document.createElement('div');
    imageWrapper.className = 'chat-modal-image';

    var product = productImageData[productNumber - 1];
    if (product) {
        var img = document.createElement('img');
        img.src = product.src;
        img.alt = product.alertText || 'Recommended product';
        imageWrapper.appendChild(img);
    }

    var buttonRow = document.createElement('div');
    buttonRow.className = 'chat-modal-buttons';

    var acceptButton = document.createElement('button');
    acceptButton.className = 'chat-modal-button';
    acceptButton.type = 'button';
    acceptButton.textContent = '✅ Accept';
    acceptButton.onclick = function () {
        closeModalById('chat-product-overlay');
        logEvent('accepted-recommended-product-' + productNumber, {
            acceptedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType
        });
        addSystemMessage('✅ You accepted product ' + productNumber + '. Moving to the next step.');
        triggerNextButton();
    };

    var declineButton = document.createElement('button');
    declineButton.className = 'chat-modal-button';
    declineButton.type = 'button';
    declineButton.textContent = '❌ Decline';
    declineButton.onclick = function () {
        closeModalById('chat-product-overlay');
        logEvent('declined-recommended-product-' + productNumber, {
            declinedProduct: productNumber,
            originalRecommendation: originalRecommendation,
            wasRecommended: true,
            recommendationType: recommendationType
        });
        addSystemMessage('Thanks for the feedback. You declined product ' + productNumber + '.');
        triggerNextButton();
    };

    buttonRow.appendChild(acceptButton);
    buttonRow.appendChild(declineButton);

    modal.appendChild(closeButton);
    modal.appendChild(messageBlock);
    modal.appendChild(imageWrapper);
    modal.appendChild(buttonRow);

    backdrop.appendChild(modal);
    chatContainer.appendChild(backdrop);

    logEvent('recommended-product-' + productNumber, {
        productNumber: productNumber,
        type: 'single',
        recommendationType: 'single'
    });
}

function showRecommendation(productNumber, message) {
    showProductOverlay(productNumber, message);
}

function showErrorMessage(message) {
    addSystemMessage('⚠️ ' + message);
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

function extractMessagePayload(raw) {
    if (raw == null) {
        return { text: '' };
    }
    if (typeof raw === 'string') {
        return { text: raw };
    }
    if (typeof raw === 'object') {
        var text = '';
        if (typeof raw.text === 'string') {
            text = raw.text;
        } else if (typeof raw.message === 'string') {
            text = raw.message;
        } else {
            text = String(raw.content || '');
        }
        return {
            text: text,
            productNumber: raw.productNumber || raw.product || null,
            raw: raw
        };
    }
    return { text: String(raw) };
}

async function handleBotResponses(data, typingIndicator) {
    removeTypingIndicator(typingIndicator);

    var chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        return;
    }

    if (!data || typeof data !== 'object') {
        showErrorMessage('Received an empty response from the assistant.');
        return;
    }

    var responses = [];
    if (Array.isArray(data.response)) {
        responses = data.response.slice();
    } else if (data.response != null) {
        responses = [data.response];
    }

    if (!responses.length) {
        showErrorMessage('No messages returned by the assistant.');
        return;
    }

    var isHandoff = responses.length > 1;
    var botTimestamp = new Date().toISOString();

    for (var i = 0; i < responses.length; i++) {
        if (i > 0) {
            await wait(300);
        }

        var payload = extractMessagePayload(responses[i]);
        var agentType = isHandoff && i === responses.length - 1 ? 'recommendation' : 'collector';
        var textContent = payload.text || '';

        chatHistory += 'Agent: ' + textContent + '\n';
        chatHistoryJson.push({ role: 'assistant', content: textContent, timestamp: botTimestamp, agent: agentType });

        appendMessage('assistant', textContent, agentType);
        ensureQualtricsData('ChatHistory', chatHistory);
        ensureQualtricsData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        ensureQualtricsData('SessionId', sessionId);
        ensureQualtricsData('ResponseID', '${e://Field/ResponseID}');

        if (isHandoff && i === 0) {
            addSystemMessage('🔄 Handing off → Recommendation Agent');
            await renderHandoverSequence(chatWindow);
        }

        if (agentType === 'recommendation') {
            var productNumber = null;
            if (payload.productNumber) {
                productNumber = parseInt(payload.productNumber, 10);
            } else {
                var match = textContent.match(/(?:product|option)\s*(\d+)/i);
                if (match) {
                    productNumber = parseInt(match[1], 10);
                }
            }
            if (productNumber && !isNaN(productNumber)) {
                showRecommendation(productNumber, textContent);
            }
        }
    }
}

async function sendMessage() {
    if (isSending) {
        return;
    }

    var input = document.getElementById('user-input');
    if (!input) {
        return;
    }

    var userInput = input.value;
    if (!userInput || !userInput.trim()) {
        return;
    }

    isSending = true;
    input.value = '';
    setSendButtonState(true, true);

    var timestamp = new Date().toISOString();
    chatHistory += 'User: ' + userInput + '\n';
    chatHistoryJson.push({ role: 'user', content: userInput, timestamp: timestamp });
    ensureQualtricsData('ChatHistory', chatHistory);
    ensureQualtricsData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
    ensureQualtricsData('SessionId', sessionId);
    ensureQualtricsData('ResponseID', '${e://Field/ResponseID}');

    appendMessage('user', userInput, null);

    var typingIndicator = createTypingIndicator();
    var chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.appendChild(typingIndicator);
        scrollChatToBottom();
    }

    try {
        var requestData = {
            message: chatHistoryJson,
            session_id: sessionId,
            qualtrics_response_id: '${e://Field/ResponseID}'
        };

        var response = await fetch(chatbotURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            removeTypingIndicator(typingIndicator);
            showErrorMessage('The assistant returned an error (status ' + response.status + ').');
        } else {
            var data = await response.json();
            await handleBotResponses(data, typingIndicator);
        }
    } catch (error) {
        console.error('Network error:', error);
        removeTypingIndicator(typingIndicator);
        showErrorMessage('Network error: ' + error.message);
    }

    setSendButtonState(false, false);
    isSending = false;
    scrollChatToBottom();
}

function attachEventListeners() {
    var sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', function () {
            sendMessage();
        });
    }

    var userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine && typeof Qualtrics.SurveyEngine.addOnload === 'function') {
        Qualtrics.SurveyEngine.addOnload(function () {
            if (this && typeof this.hideNextButton === 'function') {
                this.hideNextButton();
            }
        });
    }
}

try {
    setupLayout();
    addChatHeader();
    attachEventListeners();
} catch (error) {
    console.error('Error initializing chat:', error);
    showErrorMessage('There was a problem initializing the chat experience.');
}
