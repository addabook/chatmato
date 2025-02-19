// ✅ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getDatabase, ref, push, onChildAdded, get, set 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { 
    getAuth, signInWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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

// ✅ Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ✅ Helper Function: Convert Email to Firebase Safe Key
function sanitizeEmail(email) {
    return email.replace(/\./g, ",");
}

// ✅ Login Function
window.login = function () {
    const email = document.getElementById("uid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("❌ Please enter both Email and Password!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const sanitizedEmail = sanitizeEmail(email);
            localStorage.setItem("loggedInUser", sanitizedEmail);
            window.location.href = "chat.html"; // Redirect to chat
        })
        .catch((error) => {
            console.error("Login Error:", error.message);
            alert("❌ Login Failed: " + error.message);
        });
};

// ✅ Ensure User is Logged In for Chat
let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser && window.location.pathname.includes("chat.html")) {
    window.location.href = "index.html";
}

// ✅ Load Chat Users in Sidebar
function loadChatList() {
    const chatListDiv = document.getElementById("chatList");
    chatListDiv.innerHTML = "";

    get(ref(db, "users")).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                if (user.key !== currentUser) {
                    const chatUser = document.createElement("div");
                    chatUser.className = "chat-user";
                    chatUser.innerText = user.val().displayName || user.key;
                    chatUser.onclick = () => startChat(user.key);
                    chatListDiv.appendChild(chatUser);
                }
            });
        }
    });
}

// ✅ Start Chat with Selected User
let selectedUser = null;

function startChat(user) {
    selectedUser = user;
    document.getElementById("chatHeader").innerText = `Chat with ${user}`;
    document.getElementById("messages").innerHTML = ""; // Clear previous chat
    loadMessages(user);
}

// ✅ Load Messages in Real-Time
function loadMessages(user) {
    if (!user) return;

    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(db, "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
}

// ✅ Send Message Function
window.sendMessage = function () {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (!selectedUser) {
        alert("❌ Please select a user to chat with!");
        return;
    }

    if (message === "") return;

    const chatID = getChatID(currentUser, selectedUser);
    push(ref(db, "messages/" + chatID), {
        sender: currentUser,
        text: message,
        timestamp: Date.now()
    });

    messageInput.value = "";
};

// ✅ Display Messages in Chat Box
function displayMessage(sender, text) {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = sender === currentUser ? "message sent" : "message received";
    messageElement.innerText = text;
    messagesDiv.appendChild(messageElement);
}

// ✅ Generate Unique Chat ID
function getChatID(user1, user2) {
    return [user1, user2].sort().join("_");
}

// ✅ Load Chat List on Page Load
if (window.location.pathname.includes("chat.html")) {
    loadChatList();
}
