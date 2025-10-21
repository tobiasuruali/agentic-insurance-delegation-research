console.log("ST02_UI_highlight_gallery_no_handoff.js - Study 2: Highlight Gallery without Handoff");
var chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
// var chatbotURL = 'https://crimson-science.com/InsuranceRecommendation';
//var chatbotURL = 'http://127.0.0.1:5000/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Comparabot Insurance Finder';
var avatarImageURL = 'https://storage.googleapis.com/images-mobilab/avatar_icon_chatbot.png'; // Replace with your actual image URL (square image)

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
var sessionId = 'session_' + crypto.randomUUID();
var chatHistory = "";
var chatHistoryJson = [];

// Recommendation tracking variables
var originalRecommendation = null;
var recommendationType = null;
var shuffledProductOrder = null; // Stores the randomized display order

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

    // User message styling
    var userMessageDiv = document.createElement('div');
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
    
    // Scroll immediately to show user message
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Loading message styling
    var loadingMessageDiv = document.createElement('div');
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
        var qualtricsResponseId = "${e://Field/ResponseID}";
        var requestData = {
            message: chatHistoryJson,
            session_id: sessionId,
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

        var loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();

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
        } else {
            showErrorMessage("Error from server.<br>Status code: " + response.status);
            console.error("Error from server: " + response.status);
        }
        
        try{
            Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
            Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
            Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
            Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
        } catch(error) {
            console.error("Error from Qualtrics: ", error);
            sessionId = "DEBUG"
            qualtricsResponseId = "DEBUG"
        }
        
        // Re-enable send button and reset sending flag
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        isSending = false;
    } catch (error) {
        var loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();
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

function createBotMessage(content, agentType = 'collector') {
    var botMessageDiv = document.createElement('div');
    
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
        botMessageDiv.style.backgroundColor = botMessageBackgroundColor;
        botMessageDiv.style.color = botMessageFontColor;
        botMessageDiv.style.border = '1px solid #E9ECEF';
        botMessageDiv.style.borderLeft = '4px solid #3c3abd';
        botMessageDiv.innerHTML = '<strong>Information Agent:</strong> ' + content;
    } else if (agentType === 'recommendation') {
        botMessageDiv.style.backgroundColor = '#E8F4F8';
        botMessageDiv.style.color = '#000000';
        botMessageDiv.style.border = '1px solid #D4E8F3';
        botMessageDiv.style.borderLeft = '4px solid #1A73E8';
        botMessageDiv.innerHTML = '<strong>Recommendation Agent:</strong> ' + content;
    }
    
    return botMessageDiv;
}

function addSystemMessage(message) {
    var chatWindow = document.getElementById('chat-window');
    var systemMessageDiv = document.createElement('div');
    
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
    
    systemMessageDiv.innerHTML = '<em>' + message + '</em>';
    chatWindow.appendChild(systemMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
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
        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
        
        // Initialize all variables to ensure consistent data structure
        var currentRecommended = Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendedProduct') || "";
        var currentAccepted = Qualtrics.SurveyEngine.getJSEmbeddedData('AcceptedProduct') || "";
        var currentWasAccepted = Qualtrics.SurveyEngine.getJSEmbeddedData('WasRecommendationAccepted') || "";
        var currentUserJourney = Qualtrics.SurveyEngine.getJSEmbeddedData('UserJourney') || "";
        var currentRecommendationType = Qualtrics.SurveyEngine.getJSEmbeddedData('RecommendationType') || "";
        var currentRejected = Qualtrics.SurveyEngine.getJSEmbeddedData('RejectedRecommendation') || "";
        var currentDeclined = Qualtrics.SurveyEngine.getJSEmbeddedData('DeclinedProduct') || "";
        
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
        
        // Store display position if available in details
        var currentDisplayPosition = Qualtrics.SurveyEngine.getJSEmbeddedData('AcceptedProductDisplayPosition') || "";
        if (details.displayPosition) {
            currentDisplayPosition = details.displayPosition;
        }

        // Always set ALL variables to ensure consistent data structure
        Qualtrics.SurveyEngine.setJSEmbeddedData('RecommendedProduct', currentRecommended);
        Qualtrics.SurveyEngine.setJSEmbeddedData('AcceptedProduct', currentAccepted);
        Qualtrics.SurveyEngine.setJSEmbeddedData('AcceptedProductDisplayPosition', currentDisplayPosition);
        Qualtrics.SurveyEngine.setJSEmbeddedData('WasRecommendationAccepted', currentWasAccepted);
        Qualtrics.SurveyEngine.setJSEmbeddedData('UserJourney', currentUserJourney);
        Qualtrics.SurveyEngine.setJSEmbeddedData('RecommendationType', currentRecommendationType);
        Qualtrics.SurveyEngine.setJSEmbeddedData('RejectedRecommendation', currentRejected);
        Qualtrics.SurveyEngine.setJSEmbeddedData('DeclinedProduct', currentDeclined);

        // Store randomized product order when gallery is shown
        if (eventType === "showed-product-gallery" && shuffledProductOrder) {
            Qualtrics.SurveyEngine.setJSEmbeddedData('RandomizedProductOrder', JSON.stringify(shuffledProductOrder));
        }
        
    } catch(error) {
        console.error("Error logging event: ", error);
        sessionId = "DEBUG";
        qualtricsResponseId = "DEBUG";
    }
}

try {
    addChatHeader();

    // Hide NextButton during chat interaction
    Qualtrics.SurveyEngine.addOnload(function () {
      this.hideNextButton();      // built‑in helper
      //  … any other per‑page setup
    });
    
    var sendButton = document.getElementById('send-button');
    sendButton.style.backgroundColor = sendButtonColor;
    sendButton.style.color = sendButtonFontColor;
    sendButton.style.padding = "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 20px)";
    sendButton.style.minHeight = "44px"; // Minimum touch target
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "5px";
    sendButton.style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";
    sendButton.style.cursor = "pointer";
    sendButton.addEventListener('click', sendMessage);

    document.getElementById('user-input').style.padding = "clamp(8px, 2vw, 12px)";
    document.getElementById('user-input').style.minHeight = "44px"; // Minimum touch target
    document.getElementById('user-input').style.border = "1px solid #CCC";
    document.getElementById('user-input').style.borderRadius = "5px";
    document.getElementById('user-input').style.fontSize = "clamp(0.875rem, 2.5vw, 1rem)";

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
    // Styling handled by CSS class
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

    // Decline button
    const declineButton = document.createElement('button');
    declineButton.textContent = '❌Decline';
    // Styling handled by CSS class
    declineButton.addEventListener('click', function () {
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
  
  showProductOverlay();

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
  let idx = 0;

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
  updateIndicator();

  // Nav arrow behavior (scrollIntoView is robust under Qualtrics)
  const slides = Array.from(track.children);
  function goTo(i) {
    idx = (i + total) % total;
    slides[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    updateIndicator();
  }
  prev.addEventListener("click", () => goTo(idx - 1));
  next.addEventListener("click", () => goTo(idx + 1));

  // Sync when user scrolls manually
  let scrollRAF;
  track.addEventListener("scroll", () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => {
      const width = track.clientWidth || 1;
      const newIdx = Math.round(track.scrollLeft / width);
      if (newIdx !== idx) {
        idx = Math.max(0, Math.min(total - 1, newIdx));
        updateIndicator();
      }
    });
  });

  // ===== Accept/Decline Buttons =====
  const acceptButton = document.createElement('button');
  acceptButton.textContent = '✅Accept';
  acceptButton.className = "custom-recommendation-button";
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

    console.log("Accepted product:", {
      originalProductNumber: originalProductNumber,
      displayPosition: displayPos,
      wasRecommended: originalRecommendation === originalProductNumber
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
      recommendationType: recommendationType
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
  declineButton.textContent = '❌Decline';
  declineButton.className = "custom-recommendation-button";
  declineButton.onclick = function() {
    document.getElementById("recommendation").remove();
    // Could add additional decline logic here if needed
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