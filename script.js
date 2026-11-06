
// --- All documents by element ID and class --- 

const tutorialVideo = document.getElementById("tutorialVideo");
const inputData = document.getElementById("LLMConversationData");
const llmRadios = document.querySelectorAll('input[name="llm_source"]');

const videoSources = {
    "chatgpt_value": "https://www.youtube.com/embed/HtwriatqbBc",
    "claude_value": "https://www.youtube.com/embed/8Lc-lhk04uE",
    "gemini_value": "https://www.youtube.com/embed/accQ1ashYdE"
};

// --- List of functions ---

function handleUpdateJSON(e) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const jsonObject = JSON.parse(e.target.result);
			document.getElementById("output").value = JSON.stringify(jsonObject, null, 2);
		} catch (error) {
			document.getElementById("output").value = "Failed to load.";
		}
	}
	reader.readAsText(file);
}

// --- Main Code ---

llmRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        const selectedLLM = e.target.value;
        if (videoSources[selectedLLM]) {
            tutorialVideo.src = videoSources[selectedLLM];
        }
    });
});
inputData.addEventListener("change", (e) => handleUpdateJSON(e));
