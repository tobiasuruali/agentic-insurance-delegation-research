console.log("Local UI script loaded");

// Configuration
const chatbotURL = '/InsuranceRecommendation';
const botName = 'Comparabot';
const chatTitle = 'Agentic Insurance Chatbot';
const avatarImageURL = 'https://via.placeholder.com/120x120/970000/ffffff?text=CB'; // Placeholder avatar

// Product image data (same as original)
const productImageData = [
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 1'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 2'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 3'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 4'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 5'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 6'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 7'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 8'
    }
];

// Colors
const documentBackgroundColor = "#F5F5F5";
const chatHeaderBackgroundColor = "#980033";
const chatHeaderFontColor = "#FFF";
const userMessageFontColor = "#333";
const userMessageBackgroundColor = "#FFF";
const loadingMessageFontColor = "#888";
const botMessageFontColor = "#333";
const botMessageBackgroundColor = "#EFEFEF";
const sendButtonColor = "#970000";
const sendButtonFontColor = "#FFF";

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
    chatHeader.style.padding = "10px";
    chatHeader.style.textAlign = "center";
    chatHeader.style.fontSize = "14pt";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.borderTopLeftRadius = "10px";
    chatHeader.style.borderTopRightRadius = "10px";
    chatHeader.style.display = "flex";
    chatHeader.style.alignItems = "center";

    const avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + ' Avatar';
    avatar.style.width = "60px";
    avatar.style.height = "60px";
    avatar.style.marginRight = "10px";
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
    userMessageDiv.style.fontSize = '14pt';
    userMessageDiv.style.color = userMessageFontColor;
    userMessageDiv.style.backgroundColor = userMessageBackgroundColor;
    userMessageDiv.style.padding = "10px";
    userMessageDiv.style.borderRadius = "10px";
    userMessageDiv.style.marginBottom = "10px";
    userMessageDiv.style.maxWidth = "70%";
    userMessageDiv.style.alignSelf = "flex-end";
    userMessageDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    userMessageDiv.innerHTML = '<strong>You:</strong> ' + userInput;
    chatWindow.appendChild(userMessageDiv);

    // Loading message styling
    const loadingMessageDiv = document.createElement('div');
    loadingMessageDiv.style.fontSize = '12pt';
    loadingMessageDiv.style.fontStyle = 'italic';
    loadingMessageDiv.style.color = loadingMessageFontColor;
    loadingMessageDiv.style.marginBottom = "10px";
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
            
            console.log("Received response:", data.response);
            console.log("Processed responses:", responses);
            
            // Display each message with a delay
            for (let i = 0; i < responses.length; i++) {
                const messageContent = responses[i];
                
                console.log(`Message ${i}:`, messageContent, "Type:", typeof messageContent);
                
                // Add delay between messages (except for the first one)
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

                // Bot message styling
                const botMessageDiv = document.createElement('div');
                botMessageDiv.style.fontSize = '14pt';
                botMessageDiv.style.color = botMessageFontColor;
                botMessageDiv.style.backgroundColor = botMessageBackgroundColor;
                botMessageDiv.style.padding = "10px";
                botMessageDiv.style.borderRadius = "10px";
                botMessageDiv.style.marginBottom = "10px";
                botMessageDiv.style.maxWidth = "70%";
                botMessageDiv.style.alignSelf = "flex-start";
                botMessageDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                botMessageDiv.innerHTML = '<strong>' + botName + ':</strong> ' + messageContent;
                chatWindow.appendChild(botMessageDiv);
                
                // Scroll to bottom after each message
                chatWindow.scrollTop = chatWindow.scrollHeight;
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
    sendButton.style.padding = "10px 20px";
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "5px";
    sendButton.style.fontSize = "14pt";
    sendButton.style.cursor = "pointer";
    sendButton.addEventListener('click', sendMessage);

    const userInput = document.getElementById('user-input');
    userInput.style.padding = "10px";
    userInput.style.border = "1px solid #CCC";
    userInput.style.borderRadius = "5px";
    userInput.style.fontSize = "14pt";

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