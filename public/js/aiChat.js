document.getElementById('sendBtn').addEventListener('click', async () => {
    const userMessage = document.getElementById('userInput').value.trim();
    const chatBox = document.getElementById('chatBox');

    if (!userMessage) {
        chatBox.innerHTML += `<div><b>Error:</b> Message cannot be empty</div>`;
        return;
    }

    chatBox.innerHTML += `<div><b>You:</b> ${userMessage}</div>`;

    try {
        console.log("🔹 Sending message to server:", userMessage);

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'  // ✅ Ensure correct JSON format
            },
            body: JSON.stringify({ message: userMessage })  // ✅ Proper JSON structure
        });

        const data = await res.json();
        console.log("🔹 Response Data:", data);

        if (res.ok && data.reply) {
            chatBox.innerHTML += `<div><b>AI:</b> ${data.reply}</div>`;
        } else {
            chatBox.innerHTML += `<div><b>Error:</b> No response from AI</div>`;
        }
    } catch (error) {
        chatBox.innerHTML += `<div><b>Error:</b> AI service is unavailable</div>`;
        console.error('❌ Fetch Error:', error);
    }

    document.getElementById('userInput').value = ''; // Clear input field
});
