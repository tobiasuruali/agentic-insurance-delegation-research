console.log("Qualtrics UI script loaded");
var chatbotURL = 'https://agentic-insurance-recom-chatbot-671115110734.europe-west1.run.app/InsuranceRecommendation';
// var chatbotURL = 'https://crimson-science.com/InsuranceRecommendation';
//var chatbotURL = 'http://127.0.0.1:5000/InsuranceRecommendation';
var botName = 'Comparabot';
var chatTitle = 'Agentic Insurance Chatbot';
var avatarImageURL = 'https://mtecethz.eu.qualtrics.com/ControlPanel/Graphic.php?IM=IM_C2TjVl3ky4o9ybv'; // Replace with your actual image URL (square image)

const productImageData = [
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/07/Recommended_Product_Insurance-1.png',
        alertText: 'This is product 1'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/07/Recommended_Product_Insurance-1.png',
        alertText: 'This is product 2'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/07/Recommended_Product_Insurance-1.png',
        alertText: 'This is product 3'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 4'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/07/Recommended_Product_Insurance-1.png',
        alertText: 'This is product 5'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/07/Recommended_Product_Insurance-1.png',
        alertText: 'This is product 6'
    },
    {
        src: 'https://mobiliarlab.ethz.ch/wp-content/uploads/2025/02/mobiliar-ctrl-alt-relax-visual-1024x461.webp',
        alertText: 'This is product 7'
    },
    {
        src: 'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww',
        alertText: 'This is product 8'
    }
];


// Colors
documentBackgroundColor     = "#F5F5F5";    // Light background color
chatHeaderBackgroundColor   = "#980033"     //Crimson Background
chatHeaderFontColor         =  "#FFF";      // White text
userMessageFontColor        = "#333"; // Darker text color
userMessageBackgroundColor  = "#FFF"; // White background
loadingMessageFontColor     = "#888"; // Grey text color
botMessageFontColor         = "#333"; // Darker text color
botMessageBackgroundColor    = "#EFEFEF"; // Light grey background
sendButtonColor             = "#970000"; // Red button
sendButtonFontColor         = "#FFF"; // White text

// Internal variables
var sessionId = 'session_' + crypto.randomUUID();
var chatHistory = "";
var chatHistoryJson = [];

// Apply styles inspired by the website
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.backgroundColor = documentBackgroundColor

function addChatHeader() {
    // Create and style the chat header container (for avatar and text)
    var chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = chatHeaderBackgroundColor;
    chatHeader.style.color = chatHeaderFontColor;
    chatHeader.style.padding = "10px";
    chatHeader.style.textAlign = "center";
    chatHeader.style.fontSize = "14pt";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.borderTopLeftRadius = "10px";
    chatHeader.style.borderTopRightRadius = "10px";
    chatHeader.style.display = "flex"; // Flexbox for alignment
    chatHeader.style.alignItems = "center"; // Center items vertically

    // Create the avatar image element
    var avatar = document.createElement('img');
    avatar.src = avatarImageURL;
    avatar.alt = botName + 'Avatar';
    avatar.style.width = "80px"; // Set the size of the avatar
    avatar.style.height = "80px"; // Set the size of the avatar
    avatar.style.marginRight = "10px"; // Space between avatar and text
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
    console.log("Send button clicked");
    var userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;
    
    var chatWindow = document.getElementById('chat-window');
    var timestamp = new Date().toISOString();
    chatHistory += "User: " + userInput + "\n";
    chatHistoryJson.push({ role: "user", content: userInput, timestamp: timestamp });

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

    try {
        var qualtricsResponseId = "${e://Field/ResponseID}";
        var requestData = {
            message: chatHistoryJson,
            session_id: sessionId,
            qualtrics_response_id: qualtricsResponseId
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
            var isHandoff = responses.length > 1; // Multi-message response indicates handoff
            
            console.log("Received response:", data.response);
            console.log("Processed responses:", responses);
            console.log("Is handoff:", isHandoff);
            
            // Display each message with a delay
            for (let i = 0; i < responses.length; i++) {
                var messageContent = responses[i];
                // For handoff: first message is Information Agent, second is Recommendation Agent
                var agentType = isHandoff && i === 1 ? 'recommendation' : 'collector';
                
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
    } catch (error) {
        var loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) loadingDiv.remove();
        showErrorMessage("Network error: " + error.message);
        console.error("Network error: ", error);
    }

    document.getElementById('user-input').value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createBotMessage(content, agentType = 'collector') {
    var botMessageDiv = document.createElement('div');
    
    // Base styling
    botMessageDiv.style.fontSize = '14pt';
    botMessageDiv.style.padding = '10px';
    botMessageDiv.style.borderRadius = '10px';
    botMessageDiv.style.marginBottom = '10px';
    botMessageDiv.style.maxWidth = '70%';
    botMessageDiv.style.alignSelf = 'flex-start';
    botMessageDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Agent-specific styling
    if (agentType === 'collector') {
        botMessageDiv.style.backgroundColor = botMessageBackgroundColor;
        botMessageDiv.style.color = botMessageFontColor;
        botMessageDiv.style.borderLeft = '4px solid #970000';
        botMessageDiv.innerHTML = '<strong>Information Agent:</strong> ' + content;
    } else if (agentType === 'recommendation') {
        botMessageDiv.style.backgroundColor = '#e8f4f8';
        botMessageDiv.style.color = '#333';
        botMessageDiv.style.borderLeft = '4px solid #0066cc';
        botMessageDiv.innerHTML = '<strong>Recommendation Agent:</strong> ' + content;
    }
    
    return botMessageDiv;
}

function addSystemMessage(message) {
    var chatWindow = document.getElementById('chat-window');
    var systemMessageDiv = document.createElement('div');
    
    systemMessageDiv.style.fontSize = '12pt';
    systemMessageDiv.style.fontStyle = 'italic';
    systemMessageDiv.style.color = '#666';
    systemMessageDiv.style.backgroundColor = '#f8f9fa';
    systemMessageDiv.style.padding = '8px 12px';
    systemMessageDiv.style.borderRadius = '15px';
    systemMessageDiv.style.marginBottom = '10px';
    systemMessageDiv.style.maxWidth = '60%';
    systemMessageDiv.style.alignSelf = 'center';
    systemMessageDiv.style.border = '1px solid #dee2e6';
    systemMessageDiv.style.textAlign = 'center';
    
    systemMessageDiv.innerHTML = '<em>' + message + '</em>';
    chatWindow.appendChild(systemMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

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

        alertMessage.style.color = "#b60000"
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
    alertMessage.style.color = "#b60000";
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
    acceptButton.style.padding = "10px 20px";
    acceptButton.style.border = "none";
    acceptButton.style.borderRadius = "5px";
    acceptButton.style.fontSize = "14pt";
    acceptButton.style.cursor = "pointer";
    acceptButton.onclick = function() {
        alert('You accepted!');
    // → Advance Qualtrics immediately:
    document.getElementById("NextButton").click();
    };

    // Decline button
    const declineButton = document.createElement('button');
    declineButton.textContent = '❌Decline';
    declineButton.style.backgroundColor = sendButtonColor;
    declineButton.style.color = sendButtonFontColor;
    declineButton.style.padding = "10px 20px";
    declineButton.style.border = "none";
    declineButton.style.borderRadius = "5px";
    declineButton.style.fontSize = "14pt";
    declineButton.style.cursor = "pointer";
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
    
    try{
        var botTimestamp = new Date().toISOString();
        chatHistory += "System: clicked-recommendation\n";
        chatHistoryJson.push({ role: "system", content: "clicked-recommendation", timestamp: botTimestamp });

        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistory', chatHistory);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ChatHistoryJson', JSON.stringify(chatHistoryJson));
        Qualtrics.SurveyEngine.setJSEmbeddedData('SessionId', sessionId);
        Qualtrics.SurveyEngine.setJSEmbeddedData('ResponseID', "${e://Field/ResponseID}");
    } catch(error) {
        console.error("Error from Qualtrics: ", error);
        sessionId = "DEBUG"
        qualtricsResponseId = "DEBUG"
    }
}

function showAllProducts(message) {
  console.log("showAllProducts() called with message:", message);
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

  productImageData.forEach((data, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";

    const img = document.createElement("img");
    img.src = data.src;
    img.alt = data.alertText;

    img.addEventListener("click", () => {
      console.log(`Slide ${i+1} clicked:`, data.alertText);
      alert(data.alertText);
      const nb = document.getElementById("NextButton");
      if (nb) nb.click();
    });

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

  // Qualtrics embedded data logging (unchanged)
  try {
    const botTimestamp = new Date().toISOString();
    console.log("Logging 'clicked-overview' at", botTimestamp);
    chatHistory += "System: clicked-overview\n";
    chatHistoryJson.push({
      role:      "System",
      timestamp: botTimestamp,
      content:   "clicked-overview"
    });
    Qualtrics.SurveyEngine.setJSEmbeddedData("ChatHistory",     chatHistory);
    Qualtrics.SurveyEngine.setJSEmbeddedData("ChatHistoryJson", JSON.stringify(chatHistoryJson));
    Qualtrics.SurveyEngine.setJSEmbeddedData("SessionId",       sessionId);
    Qualtrics.SurveyEngine.setJSEmbeddedData("ResponseID",      "${e://Field/ResponseID}");
  } catch (error) {
    console.error("Error setting embedded data:", error);
    sessionId = "DEBUG";
  }
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
      max-width: 85vw;
      width: 100%;
      padding: 20px;
      margin: 40px auto;
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
      margin-bottom: 15px;
      text-align: center;
      font-size: 1.25rem;
      line-height: 1.2;
    }

    /* Container we originally used for a single image. We’ll clear/hide it in the gallery case. */
    #image-container {
      margin: 20px 0;
      width: 100%;
      text-align: center;
    }
    #image-container img {
      width: 100%;
      max-width: 750px;
      display: block;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* ===== Accept/Decline Button Row ===== */
    .recommendation-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .custom-recommendation-button {
      padding: 10px 20px;
      background-color: ${sendButtonColor};
      color: ${sendButtonFontColor};
      border: none;
      border-radius: 5px;
      font-size: 14pt;
      cursor: pointer;
    }

    /* ===== Carousel ===== */
    .carousel {
      position: relative;
      width: 100%;
      margin: 20px 0;
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
      flex: 0 0 100%;
      scroll-snap-align: center;
      box-sizing: border-box;
      padding: 0 60px;
      overflow: hidden;
    }
    .carousel .slide img {
      width: 100%;
      display: block;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
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
      background: ${sendButtonColor};
      color: #fff;
      border: none;
      padding: 16px 20px;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      z-index: 2;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s ease;
    }
    .carousel .prev:hover,
    .carousel .next:hover {
      background: #800000;
    }
    .carousel .prev { left: 20px; }
    .carousel .next { right: 20px; }

    /* Fraction Indicator */
    .carousel-indicator {
	  margin-top: 12px;
	  font-size: 18px !important;    /* increased from 16px for better visibility */
	  line-height: 1.3;
	  color: #333 !important;         /* dark text */
	  text-align: center;
	  white-space: nowrap;            /* keep 1 / 8 on one line */
	  min-height: 1.3em;              /* reserve space, prevent collapse */
	  font-weight: 500;               /* slightly bolder for better readability */
	}
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
}