import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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

// ✅ Ensure User is Logged In
let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser && window.location.pathname.includes("chat.html")) {
    window.location.href = "index.html";
}

// ✅ Load Chat List & Show Users
window.loadChatList = function () {
    const chatListDiv = document.getElementById("chatList");
    chatListDiv.innerHTML = "<p>Loading users...</p>";

    get(ref(db, "users")).then((snapshot) => {
        chatListDiv.innerHTML = "";
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const userId = childSnapshot.key;
                if (userId !== currentUser) {
                    const chatUser = document.createElement("div");
                    chatUser.className = "chat-user";
                    chatUser.innerText = userId;
                    chatUser.onclick = () => startChat(userId);
                    chatListDiv.appendChild(chatUser);
                }
            });
        } else {
            chatListDiv.innerHTML = "<p>No users found!</p>";
        }
    }).catch((error) => {
        console.error("Error loading users:", error);
    });
};

// ✅ Start Chat With Selected User
window.startChat = function (user) {
    localStorage.setItem("chatWith", user);
    document.getElementById("chatHeader").innerText = "Chat with " + user;
    loadMessages(user);
};

// ✅ Send Message
window.sendMessage = function () {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    const chatWith = localStorage.getItem("chatWith");

    if (message !== "" && chatWith) {
        const chatID = getChatID(currentUser, chatWith);
        push(ref(db, "messages/" + chatID), {
            sender: currentUser,
            text: message,
            timestamp: Date.now()
        });

        messageInput.value = "";
    }
};

// ✅ Logout
window.logout = function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
};

// ✅ Show Profile
window.showProfile = function () {
    alert("Logged in as: " + currentUser);
};

// ✅ Load Chat List on Page Load
if (window.location.pathname.includes("chat.html")) {
    window.onload = loadChatList;
}
