import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQgHnPTrPGRiaMm9z5bxS_XPToWkjysDo",
    authDomain: "chatmeto-7c232.firebaseapp.com",
    databaseURL: "https://chatmeto-7c232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatmeto-7c232",
    storageBucket: "chatmeto-7c232.firebasestorage.app",
    messagingSenderId: "332170549035",
    appId: "1:332170549035:web:ffea5dd965fdb3f6f5976e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ensure User is Logged In
let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser) {
    window.location.href = "index.html";
}

// Load Chat List
function loadChatList() {
    const chatListDiv = document.getElementById("chatList");
    chatListDiv.innerHTML = "";

    get(ref(db, "users")).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                if (user.key !== currentUser) {
                    const chatUser = document.createElement("div");
                    chatUser.className = "chat-user";
                    chatUser.innerText = user.key;
                    chatUser.setAttribute("data-user", user.key);
                    chatUser.onclick = () => startChat(user.key);
                    chatListDiv.appendChild(chatUser);
                }
            });
        }
    });
}

// Start Chat
function startChat(user) {
    document.getElementById("chatHeader").innerText = "Chat with " + user;

    document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active"));
    document.querySelector(`.chat-user[data-user='${user}']`).classList.add("active");

    localStorage.setItem("currentChatUser", user);
    loadMessages(user);
}

// Load Messages in Real-Time
function loadMessages(user) {
    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(db, "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
}

// Send Message
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    const receiver = localStorage.getItem("currentChatUser");

    if (message.trim() !== "" && receiver) {
        const chatID = getChatID(currentUser, receiver);
        push(ref(db, "messages/" + chatID), {
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

// Load chat users on page load
loadChatList();
