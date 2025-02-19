// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, get, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

let selectedChatUserId = null;

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
            const user = userCredential.user;
            localStorage.setItem("loggedInUser", user.uid);
            alert("✅ Login Successful");
            window.location.href = "chat.html"; // Redirect to chat
        })
        .catch((error) => {
            console.error("❌ Login Failed:", error.code, error.message);
            alert(`Login Failed: ${error.message}`);
        });
};

// ✅ Load Chat List Function
export function loadChatList() {
    const userListRef = ref(db, "users");
    const chatList = document.getElementById("chatList");

    get(userListRef).then((snapshot) => {
        chatList.innerHTML = ""; // Clear previous list
        if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach((uid) => {
                const userItem = document.createElement("div");
                userItem.className = "chat-user";
                userItem.innerText = users[uid].name || users[uid].email;
                userItem.onclick = () => selectChat(uid);
                chatList.appendChild(userItem);
            });
        } else {
            chatList.innerHTML = "<p>No users found!</p>";
        }
    }).catch((error) => {
        console.error("❌ Error loading users:", error);
        chatList.innerHTML = "<p>Error loading users!</p>";
    });
}

// ✅ Select Chat Function
function selectChat(uid) {
    selectedChatUserId = uid;
    document.getElementById("chatHeader").innerText = `Chat with ${uid.replace(/_/g, '.')}`;
    loadMessages(uid);
}

// ✅ Send Message Function
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
    const sanitizedCurrentUser = currentUser.replace(/\./g, '_');
    const messagesRef = ref(db, `messages/${sanitizedCurrentUser}_${selectedChatUserId}`);

    push(messagesRef, {
        sender: currentUser,
        receiver: selectedChatUserId,
        message: message,
        timestamp: Date.now()
    });

    messageInput.value = "";
};

// ✅ Load Messages Between Users
function loadMessages(chatId) {
    const currentUser = localStorage.getItem("loggedInUser");
    const sanitizedCurrentUser = currentUser.replace(/\./g, '_');
    const messagesRef = ref(db, `messages/${sanitizedCurrentUser}_${chatId}`);

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = ""; // Clear previous messages

    onChildAdded(messagesRef, (snapshot) => {
        const msgData = snapshot.val();
        const msgElement = document.createElement("div");
        msgElement.className = msgData.sender === currentUser ? "message sent" : "message received";
        msgElement.innerText = msgData.message;
        chatBox.appendChild(msgElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// ✅ Logout Function
window.logout = function () {
    auth.signOut().then(() => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html"; // Redirect to login
    }).catch((error) => {
        console.error("❌ Logout Failed:", error);
    });
};
