var PUSH_COMPLETE = false;
//Инициализируем Firebase
firebase.initializeApp({
    apiKey: "AIzaSyAUfD4eM4LgaDvbTqTs4Q1Ym7ir40G4N8w",
    authDomain: "amus2ch.firebaseapp.com",
    databaseURL: "https://amus2ch.firebaseio.com",
    projectId: "amus2ch",
    storageBucket: "amus2ch.appspot.com",
    messagingSenderId: "216951909879",
    appId: "1:216951909879:web:dd09dc46ca2821b45c12f2",
    measurementId: "G-SCTSFRKB9Z"
});

if ('Notification' in window && 'serviceWorker' in navigator && 'localStorage' in window) {
    var messaging = firebase.messaging();
    
    messaging.onMessage(function(payload) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js');
        Notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(function(registration) {
                    payload.data.data = JSON.parse(JSON.stringify(payload.data));
                    payload.data.tag = payload.data.title;
                    payload.data.renotify = true;
                    registration.showNotification(payload.data.title, payload.data);
                }).catch(function(error) {
                    console.log('ServiceWorker registration failed', error);
                });
            }
        });
    });
} else {
    console.warn('This browser does not support desktop notification.');
    console.log('Is HTTPS', window.location.protocol === 'https:');
    console.log('Support Notification', 'Notification' in window);
    console.log('Support ServiceWorker', 'serviceWorker' in navigator);
    console.log('Support LocalStorage', 'localStorage' in window);
}

function Subscribe(_this){
    var code = _this.getAttribute('room');
    getToken().then(function(token) {
        _this.parentNode.lastChild.className = 'loading';
        PushApi(token,code).then(function(answer) {
            try {
                result = JSON.parse(answer);
                
                if( result[0] == 200 ) {
                    _this.parentNode.lastChild.className = '';
                    _this.checked = ( result[1].find((str) => str === code) === code );
                    window.localStorage.setItem('AmongSubs', (result[1].length > 0 ? '1' : '0') )
                }else{
                    _this.parentNode.lastChild.className = '';
                }
            }
            catch (ex) {
                _this.parentNode.lastChild.className = '';
            }
        }).catch(function() {
            _this.parentNode.lastChild.className = '';
        });
    });
}


function PushApi(token,room) {
    return new Promise(function(resolve, reject) {
        let push_req = new XMLHttpRequest();
        push_req.open('GET', window.location.protocol + '//api.' + window.location.hostname + '/push/'+token+'/'+room + '?' + NO_CACHE, true);
        push_req.onload = function() {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                reject(new Error());
            }
        };
        push_req.onerror = function() {
            reject(new Error());
        };
        push_req.send();
    });
}

function CheckSubs() {
    if( window.localStorage.getItem('AmongSubs') === '1' ) {
        var timerCheckSubs = setInterval(() => {
            if(LIVE_COMPLETE == true  && PUSH_COMPLETE == false) {
                PUSH_COMPLETE = true;
                clearInterval(timerCheckSubs);
                getToken().then(function(token) {
                    PushApi(token,'[SELECT]').then(function(answer) {
                        sub_rooms = [];
                        try {
                            result = JSON.parse(answer);
                            
                            if( result[0] == 200 ) {
                                sub_rooms = result[1];
                                window.localStorage.setItem('AmongSubs', (result[1].length > 0 ? '1' : '0') );
                            }
                        } catch (ex) {}
                        
                        if( sub_rooms.length > 0) {
                            let li_arr = document.getElementsByClassName('table-row');
                            if(li_arr.length > 0) {
                                for(let i=0; i<li_arr.length; i++){
                                    let code = li_arr[i].id.substr(0, 8);
                                    if( sub_rooms.find((str) => str === code) === code ) {
                                        li_arr[i].getElementsByTagName('input')[0].checked = true;
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }, 500);
    }
}

    
function getToken() {
    return new Promise(function(resolve, reject) {
        if( typeof firebase.currentToken === "undefined" ) {
            let vapid_key = { vapidKey: 'BMmvv-F598-FMHZH0hQErb2Cp-qnsp8nwzQK0AM4dK7NroAnLvamsBn7snNap_-wZEhTXfzlj0-tBBuLfNDf2rE' }
            messaging.requestPermission().then(function() {
                messaging.getToken(vapid_key).then(function(currentToken) {
                    if (currentToken) {
                        firebase.currentToken = currentToken;
                        resolve(currentToken);
                    } else {
                        reject(new Error('No Instance ID token available. Request permission to generate one'));
                    }
                }).catch(function(error) {
                    reject(new Error('An error occurred while retrieving token. ' + error));
                });
            }).catch(function(error) {
                reject(new Error('Unable to get permission to notify. '+ error));
            });
        }else{
            resolve(firebase.currentToken);
        }
    });
}

if( document.readyState !== 'loading' ) {
    CheckSubs();
} else {
    document.addEventListener('DOMContentLoaded', CheckSubs);
}
