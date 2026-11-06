
// --- All documents by element ID and class --- 

const tutorialHeading = document.getElementById("tutorialHeading");
const tutorialVideo = document.getElementById("tutorialVideo");
const inputData = document.getElementById("LLMConversationData");
const llmRadios = document.querySelectorAll('input[name="llm_source"]');
const ratingTaskContainer = document.getElementById("rating-task");

const videoSources = {
    "chatgpt_value": "https://www.youtube.com/embed/HtwriatqbBc",
    "claude_value": "https://www.youtube.com/embed/8Lc-lhk04uE",
    "gemini_value": "https://www.youtube.com/embed/accQ1ashYdE"
};

const videoNames = {
    "chatgpt_value": "ChatGPT",
    "claude_value": "Claude",
    "gemini_value": "Gemini"
};


// --- List of functions ---

function handleUpdateJSON(e) {
	const file = e.target.files[0];
	if (!file) return;

	const selectedPlatform = document.querySelector('input[name="llm_source"]:checked');
    if (!selectedPlatform) {
        document.getElementById("fileContent").value = "Please select an AI platform first.";
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonObject = JSON.parse(e.target.result);
            
            document.getElementById("fileContent").value = JSON.stringify(jsonObject, null, 2);
            
            const userMessages = extractMessages(jsonObject, selectedPlatform.value);
            renderRatingUI(userMessages);

        } catch (error) {
            document.getElementById("fileContent").value = "Failed to load JSON file.";
            ratingTaskContainer.innerHTML = "Error parsing file. Please ensure it is a valid .JSON export.";
        }
    }
    reader.readAsText(file);
}

function extractMessages(jsonObject, platform) {
    let extracted = [];

    try {
        if (platform === "chatgpt_value") {
            // ChatGPT structure: Array of conversations -> mapping -> nodes -> message
            jsonObject.forEach(convo => {
                if (convo.mapping) {
                    Object.values(convo.mapping).forEach(node => {
                        const msg = node.message;
                        if (msg && msg.author && msg.author.role === 'user') {
                            let text = msg.content?.parts ? msg.content.parts.join("\n") : "";
                            let time = msg.create_time ? (msg.create_time * 1000) : Date.now();
                            if (text.trim()) extracted.push({ text, timestamp: time });
                        }
                    });
                }
            });
        } else if (platform === "claude_value") {
            // Claude structure: Array of conversations -> chat_messages -> sender: "human"
            jsonObject.forEach(convo => {
                if (convo.chat_messages) {
                    convo.chat_messages.forEach(msg => {
                        if (msg.sender === 'human' || msg.role === 'user') {
                            let time = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();
                            if (msg.text && msg.text.trim()) extracted.push({ text: msg.text, timestamp: time });
                        }
                    });
                }
            });
        } else if (platform === "gemini_value") {
            // Gemini structure: Varies by export method. Recursive search acts as a catch-all.
            function findGeminiMessages(obj) {
                if (Array.isArray(obj)) {
                    obj.forEach(findGeminiMessages);
                } else if (typeof obj === 'object' && obj !== null) {
                    const role = obj.role || obj.author;
                    if (role === 'user' || role === 'human') {
                        const text = obj.text || obj.content || (obj.parts && obj.parts.join('\n'));
                        const time = obj.timestamp || obj.created_at || Date.now();
                        if (text && typeof text === 'string' && text.trim()) {
                            let parsedTime = typeof time === 'number' ? time : new Date(time).getTime();
                            extracted.push({ text, timestamp: parsedTime });
                        }
                    } else {
                        Object.values(obj).forEach(findGeminiMessages);
                    }
                }
            }
            findGeminiMessages(jsonObject);
        }
    } catch (e) {
        console.error("Extraction error:", e);
    }

    return extracted.sort((a, b) => a.timestamp - b.timestamp);
}

function renderRatingUI(messages) {
    ratingTaskContainer.innerHTML = ""; 
    
    if (messages.length === 0) {
        ratingTaskContainer.innerHTML = "<em>No user messages were detected.</em>";
        return;
    }

    messages.forEach((msg, index) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = "message-rating-block";
        
        const timeStr = new Date(msg.timestamp).toLocaleString();
        
        msgDiv.innerHTML = `
            <div class="message-meta"><strong>Timestamp:</strong> ${timeStr}</div>
            <div class="message-content">${msg.text}</div>
            <div class="likert-scale">
                <label><input type="radio" name="rating_${index}" value="1" required> 1</label>
                <label><input type="radio" name="rating_${index}" value="2"> 2</label>
                <label><input type="radio" name="rating_${index}" value="3"> 3</label>
                <label><input type="radio" name="rating_${index}" value="4"> 4</label>
                <label><input type="radio" name="rating_${index}" value="5"> 5</label>
            </div>
            <hr>
        `;
        ratingTaskContainer.appendChild(msgDiv);
    });
}

// --- Main Code ---

llmRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        const selectedLLM = e.target.value;
        if (videoSources[selectedLLM]) {
            tutorialVideo.src = videoSources[selectedLLM];
			tutorialHeading.textContent = "The following is a video that demonstrates how to export your conversation data from " + videoNames[selectedLLM]+".";
        }
    });
});
inputData.addEventListener("change", (e) => handleUpdateJSON(e));
