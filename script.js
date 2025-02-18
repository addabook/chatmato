// Sample Users
const users = {
    "risat27": "risat27",
    "nafisa27": "risat27"
};

// Function to handle login
function login() {
    const uid = document.getElementById("uid").value;
    const password = document.getElementById("password").value;

    if (users[uid] && users[uid] === password) {
        localStorage.setItem("loggedInUser", uid);
        window.location.href = "chat.html";
    } else {
        alert("Invalid credentials!");
    }
}

// Check if the user is authenticated
function checkAuth() {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
        window.location.href = "index.html";
    } else {
        loadChatList(user);
    }
}

// Logout function
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// Show profile popup
function showProfile() {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
        document.getElementById("profileInfo").innerText = `Username: ${user}`;
        document.getElementById("profilePopup").style.display = "block";
    }
}

// Close popup
function closePopup() {
    document.getElementById("profilePopup").style.display = "none";
}

// Load chat list for logged-in user
function loadChatList(user) {
    const chatList = document.getElementById("chatList");
    chatList.innerHTML = ""; // Clear old chats

    const usersArray = Object.keys(users);
    usersArray.forEach(uid => {
        if (uid !== user) {
            let chatItem = document.createElement("div");
            chatItem.className = "chat-item";
            chatItem.innerHTML = `<div class="chat-avatar"></div><span>${uid}</span>`;
            chatItem.onclick = () => openChat(uid, chatItem);
            chatList.appendChild(chatItem);
        }
    });
}

// Open Chat
function openChat(user, element) {
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById("chatHeader").innerText = `Chat with ${user}`;
    document.getElementById("messages").innerHTML = `<p>Chat started with ${user}</p>`;
}

// Send Message
function sendMessage() {
    let msg = document.getElementById("message").value;
    if (msg) {
        let chatWindow = document.getElementById("messages");
        let newMsg = document.createElement("p");
        newMsg.className = "message sent";
        newMsg.innerText = msg;
        chatWindow.appendChild(newMsg);
        document.getElementById("message").value = "";
    }
}
