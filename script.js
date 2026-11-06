const inputData = document.getElementById("LLMConversationData");

function handleUpdateJSON(e) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const jsonObject = JSON.parse(e.target.result);
			document.getElementById("output").textContent = JSON.stringify(jsonObject, null, 2);
		} catch (error) {
			document.getElementById("output").textContent = "Failed to load.";
		}
	}
	reader.readAsText(file);
}

inputData.addEventListener("change", (e) => handleUpdateJSON(e));
