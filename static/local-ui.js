console.log("Local UI script loaded");

// Configuration
const chatbotURL = '/InsuranceRecommendation';
const botName = 'Comparabot';
const chatTitle = 'Comparabot Insurance Finder';
const avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png'; // Placeholder avatar

// Product image data (same as original)
const productImageData = Array.from({ length: 16 }, (_, i) => ({
    src: `https://storage.googleapis.com/images-mobilab/Final%20Product%20Sheet_${i + 1}.jpg`,
    alertText: `Product ${i + 1} - Professional Insurance Option`
}));

// Colors - Professional Palette
const documentBackgroundColor = "#F6F5F2";      // Main page background
const chatHeaderBackgroundColor = "#3c3abd";    // Accent color (header background)
const chatHeaderFontColor = "#FFFFFF";          // White text
const userMessageFontColor = "#000000";         // Primary black text
const userMessageBackgroundColor = "#FFFFFF";   // White card background
const loadingMessageFontColor = "#6E6E6E";     // Secondary gray text
const botMessageFontColor = "#000000";          // Primary black text
const botMessageBackgroundColor = "#F8F9FA";    // Light gray card background
const sendButtonColor = "#3c3abd";              // Accent button color
const sendButtonFontColor = "#FFFFFF";          // White text

// Internal variables
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
let chatHistory = "";
let chatHistoryJson = [];

// Apply styles
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.backgroundColor = documentBackgroundColor;

function addChatHeader() {
    const chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = chatHeaderBackgroundColor;
    chatHeader.style.color = chatHeaderFontColor;
    chatHeader.style.padding = "clamp(8px, 2vw, 12px)";
    chatHeader.style.textAlign = "center";
    chatHeader.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.borderTopLeftRadius = "10px";
    chatHeader.style.borderTopRightRadius = "10px";
    chatHeader.style.display = "flex";
    chatHeader.style.alignItems = "center";

    const avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + ' Avatar';
    avatar.style.width = "clamp(50px, 8vw, 80px)";
    avatar.style.height = "clamp(50px, 8vw, 80px)";
    avatar.style.marginRight = "clamp(8px, 2vw, 12px)";
    avatar.style.borderRadius = "50%";

    const chatHeaderText = document.createElement('span');
    chatHeaderText.innerText = chatTitle;

    chatHeader.appendChild(avatar);
    chatHeader.appendChild(chatHeaderText);

    const chatWindow = document.getElementById('chat-window');
    chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
}

async function sendMessage() {
    console.log("Send button clicked");
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    const chatWindow = document.getElementById('chat-window');
    const timestamp = new Date().toISOString();
    
    chatHistory += "User: " + userInput + "\n";
    chatHistoryJson.push({ 
        role: "user", 
        content: userInput,
        timestamp: timestamp 
    });

    // User message styling
    const userMessageDiv = document.createElement('div');
    userMessageDiv.style.fontSize = 'clamp(0.875rem, 2.5vw, 1rem)';
    userMessageDiv.style.color = userMessageFontColor;
    userMessageDiv.style.backgroundColor = userMessageBackgroundColor;
    userMessageDiv.style.padding = "clamp(8px, 2vw, 12px)";
    userMessageDiv.style.borderRadius = "10px";
    userMessageDiv.style.marginBottom = "clamp(8px, 2vw, 12px)";
    userMessageDiv.style.maxWidth = "70%";
    userMessageDiv.style.alignSelf = "flex-end";
    userMessageDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    userMessageDiv.innerHTML = '<strong>You:</strong> ' + userInput;
    chatWindow.appendChild(userMessageDiv);

    // Loading message styling
    const loadingMessageDiv = document.createElement('div');
    loadingMessageDiv.style.fontSize = 'clamp(0.75rem, 2vw, 0.875rem)';
    loadingMessageDiv.style.fontStyle = 'italic';
    loadingMessageDiv.style.color = loadingMessageFontColor;
    loadingMessageDiv.style.marginBottom = "clamp(8px, 2vw, 12px)";
    loadingMessageDiv.style.maxWidth = "70%";
    loadingMessageDiv.style.alignSelf = "flex-start";
    loadingMessageDiv.id = 'loading-message';
    loadingMessageDiv.textContent = botName + ' is typing...';
    chatWindow.appendChild(loadingMessageDiv);

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

        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();

        if (response.ok) {
            const data = await response.json();
            const botTimestamp = new Date().toISOString();
            
            // Handle multiple messages
            const responses = Array.isArray(data.response) ? data.response : [data.response];
            const isHandoff = responses.length > 1; // Multi-message response indicates handoff
            
            console.log("Received response:", data.response);
            console.log("Processed responses:", responses);
            console.log("Is handoff:", isHandoff);
            
            // Display each message with a delay
            for (let i = 0; i < responses.length; i++) {
                const messageContent = responses[i];
                // For handoff: first message is Information Agent, second is Recommendation Agent
                const agentType = isHandoff && i === 1 ? 'recommendation' : 'collector';
                
                console.log(`Message ${i}:`, messageContent, "Type:", typeof messageContent, "Agent:", agentType);
                
                // Add delay for non-first messages
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
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
                const botMessageDiv = createBotMessage(messageContent, agentType);
                chatWindow.appendChild(botMessageDiv);
                
                // Scroll to bottom after each message
                chatWindow.scrollTop = chatWindow.scrollHeight;
                
                // Add system message AFTER the first message in handoff scenario
                if (isHandoff && i === 0) {
                    addSystemMessage("🔄 Connecting you with our Insurance Specialist...");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } else {
            showErrorMessage("Error from server.<br>Status code: " + response.status);
            console.error("Error from server: " + response.status);
        }
    } catch (error) {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();
        showErrorMessage("Network error: " + error.message);
        console.error("Network error: ", error);
    }

    document.getElementById('user-input').value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addSystemMessage(message) {
    const chatWindow = document.getElementById('chat-window');
    const systemMessageDiv = document.createElement('div');
    
    systemMessageDiv.style.fontSize = 'clamp(0.75rem, 2vw, 0.875rem)';
    systemMessageDiv.style.fontStyle = 'italic';
    systemMessageDiv.style.color = '#666';
    systemMessageDiv.style.backgroundColor = '#f8f9fa';
    systemMessageDiv.style.padding = '8px 12px';
    systemMessageDiv.style.borderRadius = '15px';
    systemMessageDiv.style.marginBottom = 'clamp(8px, 2vw, 12px)';
    systemMessageDiv.style.maxWidth = '60%';
    systemMessageDiv.style.alignSelf = 'center';
    systemMessageDiv.style.border = '1px solid #dee2e6';
    systemMessageDiv.style.textAlign = 'center';
    
    systemMessageDiv.innerHTML = `<em>${message}</em>`;
    chatWindow.appendChild(systemMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createBotMessage(content, agentType = 'collector') {
    const botMessageDiv = document.createElement('div');
    
    // Base styling
    botMessageDiv.style.fontSize = 'clamp(0.875rem, 2.5vw, 1rem)';
    botMessageDiv.style.padding = 'clamp(8px, 2vw, 12px)';
    botMessageDiv.style.borderRadius = '10px';
    botMessageDiv.style.marginBottom = 'clamp(8px, 2vw, 12px)';
    botMessageDiv.style.maxWidth = '70%';
    botMessageDiv.style.alignSelf = 'flex-start';
    botMessageDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Agent-specific styling
    if (agentType === 'collector') {
        botMessageDiv.style.backgroundColor = '#EFEFEF';
        botMessageDiv.style.color = '#333';
        botMessageDiv.style.borderLeft = '4px solid #970000';
        botMessageDiv.innerHTML = `<strong>Information Agent:</strong> ${content}`;
    } else if (agentType === 'recommendation') {
        botMessageDiv.style.backgroundColor = '#e8f4f8';
        botMessageDiv.style.color = '#333';
        botMessageDiv.style.borderLeft = '4px solid #0066cc';
        botMessageDiv.innerHTML = `<strong>Recommendation Agent:</strong> ${content}`;
    }
    
    return botMessageDiv;
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
    addChatHeader();

    const sendButton = document.getElementById('send-button');
    sendButton.style.backgroundColor = sendButtonColor;
    sendButton.style.color = sendButtonFontColor;
    sendButton.style.padding = "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 20px)";
    sendButton.style.minHeight = "44px";
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "5px";
    sendButton.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    sendButton.style.cursor = "pointer";
    sendButton.addEventListener('click', sendMessage);

    const userInput = document.getElementById('user-input');
    userInput.style.padding = "clamp(8px, 2vw, 12px)";
    userInput.style.minHeight = "44px";
    userInput.style.border = "1px solid #CCC";
    userInput.style.borderRadius = "5px";
    userInput.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";

    // Handle Enter key to send message
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (userInput.value.trim() !== "") {
                sendMessage();
            }
        }
    });
} catch (error) {
    showErrorMessage("Error setting up event listeners: " + error.message);
    console.error("Error setting up event listeners: ", error);
}