// ✅ Import Firebase SDK Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// ✅ Firebase Configuration (Replace with Your Firebase Details)
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
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Global Login Function
window.login = function () {
    const email = document.getElementById("uid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("❌ Please enter both email and password!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            localStorage.setItem("loggedInUser", email);
            window.location.href = "chat.html"; // Redirect to chat page
        })
        .catch((error) => {
            alert("❌ Login Failed: " + error.message);
        });
};

// ✅ Ensure User is Logged In
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

// ✅ Start Chat with Selected User
window.startChat = function (user) {
    document.getElementById("chatHeader").innerText = "Chat with " + user;
    localStorage.setItem("currentChatUser", user);
    loadMessages(user);
};

// ✅ Load Messages in Real-Time
window.loadMessages = function (user) {
    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(db, "messages/" + chatID);
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
};

// ✅ Send Message
window.sendMessage = function () {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    const receiver = localStorage.getItem("currentChatUser");

    if (!receiver) {
        alert("❌ Please select a user to chat with!");
        return;
    }

    if (message !== "") {
        const chatID = getChatID(currentUser, receiver);
        push(ref(db, "messages/" + chatID), {
            sender: currentUser,
            text: message,
            timestamp: Date.now()
        });

        messageInput.value = "";
    }
};

// ✅ Display Messages in Chat
window.displayMessage = function (sender, text) {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = sender === currentUser ? "message sent" : "message received";
    messageElement.innerText = text;
    messagesDiv.appendChild(messageElement);
};

// ✅ Generate Unique Chat ID for Users
window.getChatID = function (user1, user2) {
    return [user1.replace(/[^a-zA-Z0-9]/g, ""), user2.replace(/[^a-zA-Z0-9]/g, "")].sort().join("_");
};

// ✅ Logout Function
window.logout = function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
};
