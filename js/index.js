    // List of variables
const filterArray = ['brightness', 'hue', 'contrast', 'saturation', 'exposure'];
let mediaStream = {};
let serviceW;
const publicKey = 'BDa4UWwW77sOdakipgCnc-WehUillhgk4NCo93zjn5AbjXHkQSFaysAYc6tgLikg6ik8Zx7eMIkDYfN3CicSGHs';

    // Buttons
const openCameraButton = document.querySelector('#open-camera--button');
const takePhotoButton = document.querySelector('#take-photo--button');
const resetButton = document.querySelector('#reset--button');
const saveButton = document.querySelector('#save--button');
const notificationButton = document.querySelector('#notification--button');

    // Set eventListener to filter sliders and buttons
for(let i = 0; i < filterArray.length; i++) {
    let filterButtonId = filterArray[i] + '-button';

    document.getElementById(filterArray[i]).addEventListener("change", function() {
        filter.changeFilter(filterArray[i], this.value);
    });
    document.getElementById(filterButtonId).addEventListener("click", function() {
        console.log(filterButtonId);
        filter.showFilter(filterArray[i], filterButtonId);
    });
}


/* Video stream functions */
function createMediaStream(video) {
    let constraints = {
        audio: false,
        video: true
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
    .then( function(stream) {
        mediaStream = stream;
        video.srcObject = mediaStream;
        video.onloadedmetadata = function(e) {
            video.play();
        };
    })
    .catch(function(err) {
        console.log('Got error: ', err);
    });
}

function cropImage(img){
    let container = document.querySelector('.canvas--container');    
    let imgWidth = img.naturalWidth;
    let imgHeight = img.naturalHeight;
    let cropSize;
    let imgProperties = {
        newWidth: 0,
        newHeight: 0,
        x: 0,
        y: 0,
        container: container.offsetWidth
    }
    
    if(imgWidth > imgHeight) {
        //Landscape image
        cropSize = imgWidth - imgHeight;
        imgProperties.newWidth = imgHeight;
        imgProperties.newHeight = imgHeight;
        imgProperties.x = cropSize / 2;
        imgProperties.y = 0;
        console.log('crop size: ' + cropSize);
    } else {
        //Portrait image
        cropSize = imgHeight - imgWidth;
        imgProperties.newWidth = imgWidth;
        imgProperties.newHeight = imgWidth;
        imgProperties.x = 0;
        imgProperties.y = cropSize / 2;
    }
    
    return imgProperties;
}

function addPhotoToDOM(imgSrc) {    
    let imageCanvas = document.querySelector('#image-canvas');
    let ctx = imageCanvas.getContext('2d');
    let img = new Image();
    
    img.src = imgSrc;
    img.addEventListener('load', function() {
        let cropProp = cropImage(img);
               
        imageCanvas.width = cropProp.container;
        imageCanvas.height = cropProp.container;

        ctx.translate(cropProp.container, 0);
        ctx.scale(-1, 1);

        ctx.drawImage(img, cropProp.x, cropProp.y, cropProp.newWidth, cropProp.newHeight, 0, 0, cropProp.container, cropProp.container);
        filter.resetFilters();
    });
}

function createPhoto() {
    const track = mediaStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const filterContainer = document.querySelector('.filter--container');
    const footerButtons = document.querySelectorAll('.primary-button');

    imageCapture.takePhoto()
    .then( function(blob) {
        const imgURL = URL.createObjectURL(blob);

        addPhotoToDOM(imgURL);
        closeCamera(track);
        filterContainer.style.visibility = 'visible';
        for(let i = 0; i < footerButtons.length; i++) {
            footerButtons[i].style.visibility = 'visible';
        }

    }).catch(function(error) {
        console.log('takePhoto() error: ', error);
    });
}

function openCamera() {
    let imgCanvas = document.querySelector('.canvas--container');
    let video = document.querySelector('video');
    let videoContainer = document.querySelector('.video--container');
    const filterContainer = document.querySelector('.filter--container');
    const footerButtons = document.querySelectorAll('.primary-button');

    imgCanvas.style.display = 'none';
    videoContainer.style.display = 'flex';
    this.style.display = 'none';
    takePhotoButton.style.display = 'flex';
    filterContainer.style.visibility = 'hidden';
    for(let i = 0; i < footerButtons.length; i++) {
        footerButtons[i].style.visibility = 'hidden';
    }

    createMediaStream(video);
}

function closeCamera(track) {
    let imgCanvas = document.querySelector('.canvas--container');
    let videoContainer = document.querySelector('.video--container');

    track.stop();

    imgCanvas.style.display = 'block';
    videoContainer.style.display = 'none';

    takePhotoButton.style.display = 'none';
    openCameraButton.style.display = 'flex';
}

function saveImage() {
    let saveLink = document.querySelector("#save-link");
    let canvas = document.querySelector('#image-canvas');
    let canvasURL = canvas.toDataURL().replace("image/jpeg", "image/octet-stream");

    saveLink.setAttribute("href", canvasURL);
}

/* Service Worker registration */
function registerServiceWorker() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then( () => console.log('registered service worker'))
            .catch( error => console.log('could not register', error));
    }
}
registerServiceWorker();


/* PUSH NOTIFICATIONS */
const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
        serviceW = sw;
    });
}

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    
    if(permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
    } else {
        return { permissionGranted: true };
    }
}

const saveSubscription = async subscription => {
    const SERVER_URL = "http://localhost:4000/save-subscription";
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(subscription)
    });
    const data = await response.json();
    console.log(data);
};

const deleteSubscription = async subscription => {
    const SERVER_URL = "http://localhost:4000/delete-subscription";
    const response = await fetch(SERVER_URL, {
      method: "DELETE"
    });
    const data = await response.json();
    console.log(data);    
};

function toggleNotificationButton() {
    let bellIcon = document.querySelector('.notification--icon');
    
    if(bellIcon.classList.contains('fa-bell')) {
        bellIcon.classList.remove('fa-bell');
        bellIcon.classList.add('fa-bell-slash');    
    } else if(bellIcon.classList.contains('fa-bell-slash')) {
        bellIcon.classList.remove('fa-bell-slash');
        bellIcon.classList.add('fa-bell');
    }
}

const toggleSubscription = async () => {
    const permission =  await requestNotificationPermission();
    serviceW.pushManager.getSubscription().then(async (subscription) => {
        if(subscription) {
            deleteSubscription();
            subscription.unsubscribe().then(function(successful){
                console.log('Unsubscribed from subscription');
                console.log(successful);        
                toggleNotificationButton();
            })
            .catch(function(err){
                console.log('Error', err);
            })
        } else {
            try {
                const applicationServerKey = urlB64ToUint8Array(publicKey);
                const options = { 
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey 
                };
                const subscription = await serviceW.pushManager.subscribe(options);
                saveSubscription(subscription);
                console.log(subscription);
        
                toggleNotificationButton();
            } catch (err) {
                console.log('Error', err);
            }  
        }  
    })
}


/* Button calls */
openCameraButton.addEventListener("click", openCamera);
takePhotoButton.addEventListener("click", createPhoto);
resetButton.addEventListener("click", filter.resetFilters);
saveButton.addEventListener("click", saveImage);
notificationButton.addEventListener("click", toggleSubscription);

import * as filter from './filters.js';