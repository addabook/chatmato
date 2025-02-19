// ✅ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, get, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQgHnPTrPGRiaMm9z5bxS_XPToWkjysDo",
    authDomain: "chatmeto-7c232.firebaseapp.com",
    databaseURL: "https://chatmeto-7c232-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatmeto-7c232",
    storageBucket: "chatmeto-7c232.appspot.com", // ✅ Fixed storage bucket
    messagingSenderId: "332170549035",
    appId: "1:332170549035:web:ffea5dd965fdb3f6f5976e",
    measurementId: "G-SZ69WQGKQZ"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Login Function
window.login = function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // ✅ Check for input elements before accessing
    if (!emailInput || !passwordInput) {
        console.error("❌ Email or Password input not found in DOM");
        alert("Internal Error. Please refresh the page.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        alert("❌ Please enter both Email and Password!");
        return;
    }

    // ✅ Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem("loggedInUser", user.uid);
            alert("✅ Login Successful");
            window.location.href = "chat.html"; // Redirect to chat page
        })
        .catch((error) => {
            console.error("❌ Login Failed:", error.code, error.message);
            alert(`Login Failed: ${error.message}`);
        });
};

// ✅ Check if User is Authenticated on Page Load
window.onload = function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ User Logged In:", user.email);
        } else {
            console.log("⚠ No user is logged in");
        }
    });
};

// ✅ Send Message Function (for Chat Page)
window.sendMessage = function () {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) {
        alert("⚠ Cannot send empty message");
        return;
    }

    const currentUser = localStorage.getItem("loggedInUser");
    if (!currentUser) {
        alert("⚠ You are not logged in");
        return;
    }

    const messagesRef = ref(db, `messages/${currentUser}`);

    push(messagesRef, {
        sender: currentUser,
        message: message,
        timestamp: Date.now()
    });

    messageInput.value = "";
};

// ✅ Logout Function
window.logout = function () {
    auth.signOut().then(() => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html"; // Redirect to login page
    }).catch((error) => {
        console.error("❌ Logout Failed:", error);
    });
};
