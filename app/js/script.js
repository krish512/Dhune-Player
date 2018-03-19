const electron = require('electron');
electron.webFrame.setZoomLevelLimits(1, 1);
const { ipcRenderer } = electron;

const brandLogo = document.querySelector('.brand>.fas');
const audio = document.querySelector('audio');
const seek = document.querySelector('#audioSeek');
const play = document.querySelector('#play');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');

const ol = document.querySelector('#songItems');


ipcRenderer.on('songs:add', function (event, song) {

    let li = document.createElement('li');
    let liText = document.createTextNode(song.title);
    let img = document.createElement('img');
    if (song.picture != "") {
        img.setAttribute('class', 'songgrid');
        img.setAttribute('src', "data:" + song.picture.type + ";base64," + window.btoa(song.picture.data));
    } else {
        img.setAttribute('src', 'assets/img/default_album_art_50px.png');
    }
    li.appendChild(img);
    li.appendChild(liText);
    ol.appendChild(li);
});

// Toggle play/pause on event received
ipcRenderer.on('controls:playToggle', function (event) { play.click(); });


play.onclick = () => {
    if (play.classList.contains("fa-play")) {
        play.classList.remove("fa-play");
        play.classList.add("fa-pause");
        audio.play();
        brandLogo.classList.add('play');
        setInterval(() => {
            seek.value = parseInt((audio.currentTime / audio.duration) * 10000);
        }, 50);
    }
    else {
        play.classList.remove("fa-pause");
        play.classList.add("fa-play");
        audio.pause();
        brandLogo.classList.remove('play');
    }
}