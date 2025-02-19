// ✅ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQgHnPTrPGRiaMm9z5bxS_XPToWkjysDo",
    authDomain: "chatmeto-7c232.firebaseapp.com",
    databaseURL: "https://chatmeto-7c232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatmeto-7c232",
    storageBucket: "chatmeto-7c232.appspot.com",
    messagingSenderId: "332170549035",
    appId: "1:332170549035:web:ffea5dd965fdb3f6f5976e",
    measurementId: "G-SZ69WQGKQZ"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Check user authentication on load
window.onload = function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ User Logged In:", user.email);
            loadChatList();  // ✅ Call loadChatList after login
        } else {
            console.log("⚠ No user is logged in");
            window.location.href = "index.html";  // Redirect to login if not logged in
        }
    });
};

// ✅ Load Chat List
function loadChatList() {
    const userListRef = ref(db, "users");
    get(userListRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            const chatList = document.getElementById("chatList");
            chatList.innerHTML = "";

            Object.keys(users).forEach((uid) => {
                const userItem = document.createElement("div");
                userItem.className = "chat-user";
                userItem.innerText = users[uid].name;
                userItem.onclick = () => selectChat(uid, users[uid].name);
                chatList.appendChild(userItem);
            });
        } else {
            console.log("⚠ No users found");
        }
    }).catch((error) => {
        console.error("❌ Error loading users:", error);
    });
}

// ✅ Select Chat
let selectedChatUserId = null;

function selectChat(uid, userName) {
    selectedChatUserId = uid;
    document.getElementById("chatHeader").innerText = `Chat with ${userName}`;
    loadMessages(uid);
}

// ✅ Load Messages
function loadMessages(uid) {
    const currentUser = localStorage.getItem("loggedInUser");
    const messagesRef = ref(db, `messages/${currentUser}_${uid}`);

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    onChildAdded(messagesRef, (snapshot) => {
        const msgData = snapshot.val();
        const msgElement = document.createElement("div");
        msgElement.className = msgData.sender === currentUser ? "message sent" : "message received";
        msgElement.innerText = msgData.message;
        chatBox.appendChild(msgElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// ✅ Send Message
window.sendMessage = function () {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!selectedChatUserId) {
        alert("⚠ Please select a user to chat with");
        return;
    }

    if (message === "") {
        alert("⚠ Cannot send empty message");
        return;
    }

    const currentUser = localStorage.getItem("loggedInUser");
    const messagesRef = ref(db, `messages/${currentUser}_${selectedChatUserId}`);

    push(messagesRef, {
        sender: currentUser,
        receiver: selectedChatUserId,
        message: message,
        timestamp: Date.now()
    });

    messageInput.value = "";
};

// ✅ Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html"; // Redirect to login
    }).catch((error) => {
        console.error("❌ Logout Failed:", error);
    });
};
