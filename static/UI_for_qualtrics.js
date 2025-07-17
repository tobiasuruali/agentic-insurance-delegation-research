console.log("Qualtrics UI script loaded");

// Configuration - Update these variables for your deployment
var chatbotURL = 'https://your-cloud-run-service-url.com/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Insurance Recommendation Chat';
var avatarImageURL = 'https://mtecethz.eu.qualtrics.com/ControlPanel/Graphic.php?IM=IM_C2TjVl3ky4o9ybv';

// Product image data (same as original)
const productImageData = [
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 1'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 2'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 3'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 4'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 5'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 6'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 7'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is image 8'
    }
];

// Colors
documentBackgroundColor = "#F5F5F5";
chatHeaderBackgroundColor = "#980033";
chatHeaderFontColor = "#FFF";
userMessageFontColor = "#333";
userMessageBackgroundColor = "#FFF";
loadingMessageFontColor = "#888";
botMessageFontColor = "#333";
botMessageBackgroundColor = "#EFEFEF";
sendButtonColor = "#970000";
sendButtonFontColor = "#FFF";

// Internal variables
var sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
var chatHistory = "";
var chatHistoryJson = [];

// Apply styles
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.backgroundColor = documentBackgroundColor;

function addChatHeader() {
    var chatHeader = document.createElement('div');
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

    var avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + 'Avatar';
    avatar.style.width = "120px";
    avatar.style.height = "120px";
    avatar.style.marginRight = "10px";
    avatar.style.borderRadius = "50%";

    var chatHeaderText = document.createElement('span');
    chatHeaderText.innerText = chatTitle;

    chatHeader.appendChild(avatar);
    chatHeader.appendChild(chatHeaderText);

    var chatWindow = document.getElementById('chat-window');
    chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
}

function sendMessage() {
    console.log("Send button clicked");
    var userInput = document.getElementById('user-input').value;
    var chatWindow = document.getElementById('chat-window');
    var timestamp = new Date().toISOString();
    
    chatHistory += "User: " + userInput + "\n";
    chatHistoryJson.push({ 
        role: "user", 
        content: userInput,
        timestamp: timestamp 
    });

    // User message styling
    var userMessageDiv = document.createElement('div');
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
    var loadingMessageDiv = document.createElement('div');
    loadingMessageDiv.style.fontSize = '12pt';
    loadingMessageDiv.style.fontStyle = 'italic';
    loadingMessageDiv.style.color = loadingMessageFontColor;
    loadingMessageDiv.style.marginBottom = "10px";
    loadingMessageDiv.style.maxWidth = "70%";
    loadingMessageDiv.style.alignSelf = "flex-start";
    loadingMessageDiv.id = 'loading-message';
    loadingMessageDiv.textContent = botName + ' is typing...';
    chatWindow.appendChild(loadingMessageDiv);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', chatbotURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var loadingDiv = document.getElementById('loading-message');
            loadingDiv && loadingDiv.remove();
            
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var botTimestamp = new Date().toISOString();
                
                chatHistory += "Agent: " + response.response + "\n";
                chatHistoryJson.push({ 
                    role: "assistant", 
                    content: response.response,
                    timestamp: botTimestamp 
                });

                // Bot message styling
                var botMessageDiv = document.createElement('div');
                botMessageDiv.style.fontSize = '14pt';
                botMessageDiv.style.color = botMessageFontColor;
                botMessageDiv.style.backgroundColor = botMessageBackgroundColor;
                botMessageDiv.style.padding = "10px";
                botMessageDiv.style.borderRadius = "10px";
                botMessageDiv.style.marginBottom = "10px";
                botMessageDiv.style.maxWidth = "70%";
                botMessageDiv.style.alignSelf = "flex-start";
                botMessageDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                botMessageDiv.innerHTML = '<strong>' + botName + ':</strong> ' + response.response;
                chatWindow.appendChild(botMessageDiv);
            } else {
                showErrorMessage("Error from server.<br>Status code: " + xhr.status);
                console.error("Error from server: " + xhr.status);
            }
            
            try {
                Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
                Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
                Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
                Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
            } catch(error) {
                console.error("Error from Qualtrics: ", error);
                sessionId = "DEBUG";
                qualtricsResponseId = "DEBUG";
            }
        }
    };
    
    var qualtricsResponseId = "${e://Field/ResponseID}";
    xhr.send(JSON.stringify({ 
        message: chatHistoryJson, 
        session_id: sessionId, 
        qualtrics_response_id: qualtricsResponseId 
    }));
    
    document.getElementById('user-input').value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Product recommendation functions (same as original implementation)
function showRecommendation(productNumber) {
    showProductOverlay();
    var message = "Here is your recommended product: " + productNumber;
    var alertMessage = document.getElementById("recommendationMessage");
    alertMessage.innerHTML = message;

    var container = document.getElementById("image-container");
    var img = document.createElement('img');
    img.src = productImageData[productNumber-1].src;
    img.alt = 'Description of image';
    img.style.width = '100%';
    img.style.maxWidth = '600px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    container.appendChild(img);

    var acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.style.backgroundColor = sendButtonColor;
    acceptButton.style.color = sendButtonFontColor;
    acceptButton.style.padding = "10px 20px";
    acceptButton.style.border = "none";
    acceptButton.style.borderRadius = "5px";
    acceptButton.style.fontSize = "14pt";
    acceptButton.style.cursor = "pointer";
    acceptButton.onclick = function() {
        alert('You accepted!');
    };

    var declineButton = document.createElement('button');
    declineButton.textContent = 'Decline';
    declineButton.style.backgroundColor = sendButtonColor;
    declineButton.style.color = sendButtonFontColor;
    declineButton.style.padding = "10px 20px";
    declineButton.style.border = "none";
    declineButton.style.borderRadius = "5px";
    declineButton.style.fontSize = "14pt";
    declineButton.style.cursor = "pointer";
    declineButton.addEventListener('click', function () {
        document.getElementById("recommendation").remove();
        showAllProducts("Choose a product below");
    });

    acceptButton.className = "custom-recommendation-button";
    declineButton.className = "custom-recommendation-button";

    var buttonContainer = document.createElement('div');
    buttonContainer.className = "recommendation-buttons";
    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(declineButton);

    var alertContent = document.getElementById('product-overlay-content');
    alertContent.appendChild(buttonContainer);
    
    try {
        var botTimestamp = new Date().toISOString();
        chatHistory += "System: clicked-recommendation\n";
        chatHistoryJson.push({ 
            role: "system", 
            content: "clicked-recommendation",
            timestamp: botTimestamp 
        });

        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
    } catch(error) {
        console.error("Error from Qualtrics: ", error);
        sessionId = "DEBUG";
        qualtricsResponseId = "DEBUG";
    }
}

function showProductOverlay() {
    applyCustomRecommendationStyles();
    var chatWindow = document.getElementById('chat-window');

    var alertBox = document.createElement("div");
    alertBox.id = "recommendation";
    alertBox.className = "custom-recommendation";
    alertBox.style.display = "flex";

    var alertContent = document.createElement("div");
    alertContent.id = "product-overlay-content";
    alertContent.className = "custom-recommendation-content";

    var alertMessage = document.createElement("p");
    alertMessage.id = "recommendationMessage";
    alertMessage.style.color = "#b60000";
    alertMessage.innerHTML = "message";

    var container = document.createElement('div');
    container.id = 'image-container';
    container.style.margin = '20px 0';

    alertContent.appendChild(alertMessage);
    alertContent.appendChild(container);
    alertBox.appendChild(alertContent);
    chatWindow.appendChild(alertBox);
}

function showAllProducts(message) {
    showProductOverlay();
    var alertMessage = document.getElementById("recommendationMessage");
    alertMessage.innerHTML = message;

    var container = document.getElementById("image-container");
    productImageData.forEach(function(data) {
        var button = document.createElement('button');
        button.className = 'image-button';

        var img = document.createElement('img');
        img.src = data.src;
        img.alt = 'Description of image';
        button.appendChild(img);
        button.addEventListener('click', function() {
            alert(data.alertText);
        });

        container.appendChild(button);
    });
    
    try {
        var botTimestamp = new Date().toISOString();
        chatHistory += "System: clicked-overview\n";
        chatHistoryJson.push({ 
            role: "system", 
            content: "clicked-overview",
            timestamp: botTimestamp 
        });

        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
    } catch(error) {
        console.error("Error from Qualtrics: ", error);
        sessionId = "DEBUG";
        qualtricsResponseId = "DEBUG";
    }
}

function showErrorMessage(message) {
    applyCustomAlertStyles();
    var chatWindow = document.getElementById('chat-window');

    var alertBox = document.createElement("div");
    alertBox.id = "customAlertBox";
    alertBox.className = "custom-alert";

    var alertContent = document.createElement("div");
    alertContent.className = "custom-alert-content";

    var closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = function() { alertBox.remove(); };

    var alertMessage = document.createElement("p");
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
    var customAlertStyle = document.createElement("style");
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

function applyCustomRecommendationStyles() {
    var customRecommendationStyle = document.createElement("style");
    customRecommendationStyle.innerHTML = `
        .custom-recommendation {
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
        .custom-recommendation-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 20px auto;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 650px;
            width: 100%;
            height: fit-content;
            box-sizing: border-box;
        }
        #recommendationMessage {
            color: #b60000;
            margin-bottom: 15px;
            text-align: center;
        }
        #image-container {
            margin: 20px 0;
        }
        #image-container img {
            width: 100%;
            max-width: 600px;
            display: block;
            margin: 0 auto;
        }
        .recommendation-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        .custom-recommendation-button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-size: 14pt;
            cursor: pointer;
        }
        button.image-button {
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
            display: block;
            margin: 0 auto;
        }
        button.image-button img {
            width: 100%;
            max-width: 600px;
            display: block;
            filter: brightness(70%);
            transition: filter 0.3s ease;
        }
        button.image-button:hover img {
            filter: brightness(100%);
        }
    `;
    document.head.appendChild(customRecommendationStyle);
}

// Initialize the chat interface
try {
    addChatHeader();

    var sendButton = document.getElementById('send-button');
    sendButton.style.backgroundColor = sendButtonColor;
    sendButton.style.color = sendButtonFontColor;
    sendButton.style.padding = "10px 20px";
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "5px";
    sendButton.style.fontSize = "14pt";
    sendButton.style.cursor = "pointer";
    sendButton.addEventListener('click', sendMessage);

    document.getElementById('user-input').style.padding = "10px";
    document.getElementById('user-input').style.border = "1px solid #CCC";
    document.getElementById('user-input').style.borderRadius = "5px";
    document.getElementById('user-input').style.fontSize = "14pt";

    document.getElementById('user-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (document.getElementById('user-input').value.trim() !== "") {
                sendMessage();
            }
        }
    });
} catch (error) {
    showErrorMessage("Error setting up event listeners: " + error.message);
    console.error("Error setting up event listeners: ", error);
}