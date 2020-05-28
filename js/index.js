/* List of variables */
const filterArray = ['brightness', 'hue', 'contrast', 'saturation', 'exposure'];
let mediaStream = {};

    // Buttons
const openCameraButton = document.querySelector('#open-camera--button');
const takePhotoButton = document.querySelector('#take-photo--button');
const resetButton = document.querySelector('#reset--button');
const saveButton = document.querySelector('#save--button');

openCameraButton.addEventListener("click", openCamera);
takePhotoButton.addEventListener("click", createPhoto);
resetButton.addEventListener("click", filter.resetFilters);
saveButton.addEventListener("click", saveImage);

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
        console.log('Got error: ')
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

    console.log(imgProperties);
    
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
    });
}

function createPhoto() {
    const track = mediaStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    imageCapture.takePhoto()
    .then( function(blob) {
        const imgURL = URL.createObjectURL(blob);
        console.log(URL.createObjectURL(blob));

        addPhotoToDOM(imgURL);
        closeCamera(track);

    }).catch(function(error) {
        console.log('takePhoto() error: ', error);
    });
}

function openCamera() {
    let imgCanvas = document.querySelector('.canvas--container');
    let video = document.querySelector('video');
    let videoContainer = document.querySelector('.video--container');

    imgCanvas.style.display = 'none';
    videoContainer.style.display = 'flex';
    this.style.display = 'none';
    takePhotoButton.style.display = 'flex';

    console.log('Open video');

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
    let canvasURL = canvas.toDataURL().replace("image/png", "image/octet-stream");

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

import * as filter from './filters.js';