const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.cleanOldMessages = functions.pubsub.schedule("every 24 hours").onRun(async () => {
    const messagesRef = admin.database().ref("messages");

    const snapshot = await messagesRef.once("value");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    snapshot.forEach(chat => {
        chat.forEach(message => {
            if (now - message.val().timestamp > oneDay) {
                message.ref.remove();
            }
        });
    });

    return null;
});
