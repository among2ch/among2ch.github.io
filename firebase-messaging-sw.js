importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyAUfD4eM4LgaDvbTqTs4Q1Ym7ir40G4N8w",
    authDomain: "amus2ch.firebaseapp.com",
    databaseURL: "https://amus2ch.firebaseio.com",
    projectId: "amus2ch",
    storageBucket: "amus2ch.appspot.com",
    messagingSenderId: "216951909879",
    appId: "1:216951909879:web:dd09dc46ca2821b45c12f2",
    measurementId: "G-SCTSFRKB9Z",
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Handling background message', payload);
  payload.data.data = JSON.parse(JSON.stringify(payload.data));
  return self.registration.showNotification(payload.data.title, payload.data);
});

self.addEventListener('notificationclick', function(event) {
  const target = event.notification.data.click_action || '/';
  event.notification.close();
  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === target && 'focus' in client) {
        return client.focus();
      }
    }
    return clients.openWindow(target);
  }));
});
