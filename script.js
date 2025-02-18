// Sample Users
const users = {
    "risat27": "risat27",
    "nafisa27": "risat27"
};

// Login Function
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

// Check Auth
function checkAuth() {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
        window.location.href = "index.html";
    } else {
        loadChatList(user);
    }
}

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// Show Profile
function showProfile() {
    const user = localStorage.getItem("loggedInUser");
    document.getElementById("profileInfo").innerText = `Username: ${user}`;
    document.getElementById("profilePopup").style.display = "block";
}

// Close Popup
function closePopup() {
    document.getElementById("profilePopup").style.display = "none";
}
