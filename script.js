import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// User Authentication
let currentUser = localStorage.getItem("loggedInUser");

// Load Messages in Real-Time
function loadMessages(user) {
    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(getDatabase(), "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
}

// Send Message
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    const receiver = document.getElementById("chatHeader").innerText.replace("Chat with ", "");

    if (message.trim() !== "") {
        const chatID = getChatID(currentUser, receiver);
        push(ref(getDatabase(), "messages/" + chatID), {
            sender: currentUser,
            text: message,
            timestamp: Date.now()
        });

        messageInput.value = "";
    }
}

// Display Messages
function displayMessage(sender, text) {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = sender === currentUser ? "message sent" : "message received";
    messageElement.innerText = text;
    messagesDiv.appendChild(messageElement);
}

// Generate Chat ID
function getChatID(user1, user2) {
    return [user1, user2].sort().join("_");
}
