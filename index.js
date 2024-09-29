document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('chat-input');
    inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});

async function sendMessage() {
    const inputBox = document.getElementById('chat-input');
    const outputBox = document.getElementById('chat-output');
    const message = inputBox.value;

    if (message.trim() === '') {
        return;
    }

    // Display the user's message with you : and with a different colour
    const userMessageDiv = document.createElement('div');
    userMessageDiv.textContent = `You: ${message}`;
    userMessageDiv.classList.add('user-message');
    outputBox.appendChild(userMessageDiv);

    // Clear the input box once ask box is clikced
    inputBox.value = '';

    // Display the placeholder message 
    const placeholderDiv = document.createElement('div');
    placeholderDiv.textContent = 'Searching through my data...';
    placeholderDiv.classList.add('placeholder-message');
    outputBox.appendChild(placeholderDiv);

    // Scroll to the bottom of the chat output in order to handle when more responses are added
    outputBox.scrollTop = outputBox.scrollHeight;

    // Send the message to the backend in order to get the response from the api 
    try {
        const response = await fetch('http://localhost:3000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Remove the placeholder message
        outputBox.removeChild(placeholderDiv);

        // Format and display the bot's response
        const botMessageDiv = document.createElement('div');
        botMessageDiv.innerHTML = formatResponse(data.response);
        botMessageDiv.classList.add('bot-message');
        outputBox.appendChild(botMessageDiv);

        // Scroll to the bottom of the chat output
        outputBox.scrollTop = outputBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.textContent = `Error: ${error.message}`;
        errorMessageDiv.classList.add('error-message');
        outputBox.appendChild(errorMessageDiv);

        // Remove the placeholder message
        outputBox.removeChild(placeholderDiv);
    }
}

function formatResponse(response) {
    // creating the mark down like reposne in the case along with the bot: 
    return 'Bot: ' + response
        .replace(/##\s*(.+?)\s*\*\*/g, '<h2>$1</h2>') // Convert headings
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Convert bold text
        .replace(/\*\s(.+?)\s*\*/g, '<li>$1</li>') // Convert list items
        .replace(/\n/g, '<br>'); // Convert new lines to <br> tags
}