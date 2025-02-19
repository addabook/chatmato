import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth(app);

// ✅ Login Function with Firebase Authentication
window.login = function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("❌ Please enter both Email and Password!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            localStorage.setItem("loggedInUser", userCredential.user.uid);
            window.location.href = "chat.html"; // Redirect to chat page
        })
        .catch((error) => {
            alert("❌ Error: " + error.message);
        });
};

// ✅ Register Function (Optional)
window.register = function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("❌ Please enter both Email and Password!");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("✅ Registration Successful!");
            localStorage.setItem("loggedInUser", userCredential.user.uid);
            window.location.href = "chat.html"; // Redirect to chat page
        })
        .catch((error) => {
            alert("❌ Error: " + error.message);
        });
};

// ✅ Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    }).catch((error) => {
        alert("❌ Error: " + error.message);
    });
};

// ✅ Ensure User is Logged In for Chat Page
let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser && window.location.pathname.includes("chat.html")) {
    window.location.href = "index.html";
}

// ✅ Load Users in Chat List
window.loadChatUsers = function () {
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
function loadMessages(user) {
    const chatID = getChatID(currentUser, user);
    const messagesRef = ref(db, "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
}

// ✅ Start Chat Function (Fixes Selection & Hover Issue)
window.startChat = function (user) {
    document.getElementById("chatHeader").innerText = `Chat with ${user}`;
    document.querySelectorAll(".chat-user").forEach((el) => el.classList.remove("selected"));
    document.querySelectorAll(".chat-user").forEach((el) => {
        if (el.innerText === user) el.classList.add("selected");
    });
    loadMessages(user);
};

// ✅ Send Message
window.sendMessage = function () {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    const receiver = document.getElementById("chatHeader").innerText.replace("Chat with ", "");

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
