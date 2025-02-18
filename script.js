import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQgHnPTrPGRiaMm9z5bxS_XPToWkjysDo",
    authDomain: "chatmeto-7c232.firebaseapp.com",
    databaseURL: "https://chatmeto-7c232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatmeto-7c232",
    storageBucket: "chatmeto-7c232.firebasestorage.app",
    messagingSenderId: "332170549035",
    appId: "1:332170549035:web:ffea5dd965fdb3f6f5976e"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Global Login Function (Fixes "login is not defined" error)
window.login = function () {
    const uid = document.getElementById("uid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (uid === "" || password === "") {
        alert("❌ Please enter both User ID and Password!");
        return;
    }

    const usersRef = ref(db, "users/" + uid);

    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                localStorage.setItem("loggedInUser", uid);
                window.location.href = "chat.html"; // Redirect to chat page
            } else {
                alert("❌ Incorrect Password!");
            }
        } else {
            alert("❌ User not found!");
        }
    }).catch((error) => {
        console.error("Firebase Error:", error);
        alert("⚠ Error connecting to the database!");
    });
};

// ✅ Ensure User is Logged In for Chat
let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser && window.location.pathname.includes("chat.html")) {
    window.location.href = "index.html";
}

// ✅ Load Chat List
window.loadChatList = function () {
    const chatListDiv = document.getElementById("chatList");
    chatListDiv.innerHTML = "";

    get(ref(db, "users")).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                if (user.key !== currentUser) {
                    const chatUser = document.createElement("div");
                    chatUser.className = "chat-user";
                    chatUser.innerText = user.key;
                    chatUser.onclick = () => startChat(user.key);
                    chatListDiv.appendChild(chatUser);
                }
            });
        }
    });
};

// ✅ Load Messages in Real-Time
window.loadMessages = function (user) {
    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(db, "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
};

// ✅ Send Message
window.sendMessage = function () {
    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    const receiver = document.getElementById("chatHeader").innerText.replace("Chat with ", "");

    if (message.trim() !== "") {
        const chatID = getChatID(currentUser, receiver);
        push(ref(db, "messages/" + chatID), {
            sender: currentUser,
            text: message,
            timestamp: Date.now()
        });

        messageInput.value = "";
    }
};

// ✅ Display Messages
window.displayMessage = function (sender, text) {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = sender === currentUser ? "message sent" : "message received";
    messageElement.innerText = text;
    messagesDiv.appendChild(messageElement);
};

// ✅ Generate Chat ID
window.getChatID = function (user1, user2) {
    return [user1, user2].sort().join("_");
};
