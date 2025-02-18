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

// ✅ Load Chat List & Show Users
window.loadChatList = function () {
    const chatListDiv = document.getElementById("chatList");
    chatListDiv.innerHTML = "<p>Loading users...</p>";

    get(ref(db, "users")).then((snapshot) => {
        chatListDiv.innerHTML = ""; // Clear loading message
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const userId = childSnapshot.key;

                // Prevent showing the logged-in user in their own list
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
    window.location.href = "chatroom.html"; // Redirect to chatroom
};

// ✅ Load Messages in Real-Time
window.loadMessages = function () {
    const chatWith = localStorage.getItem("chatWith");
    if (!chatWith) {
        document.getElementById("messages").innerHTML = "<p>Select a user to chat.</p>";
        return;
    }

    const chatID = getChatID(currentUser, chatWith);
    const messagesRef = ref(db, "messages/" + chatID);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.sender, message.text);
    });
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

// ✅ Display Messages in Chat UI
function displayMessage(sender, text) {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = sender === currentUser ? "message sent" : "message received";
    messageElement.innerText = text;
    messagesDiv.appendChild(messageElement);
}

// ✅ Generate Chat ID (Ensures unique chat room between 2 users)
function getChatID(user1, user2) {
    return [user1, user2].sort().join("_");
}
