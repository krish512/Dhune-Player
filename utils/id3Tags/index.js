const jsmediatags = require("jsmediatags");

// Fetches tags from a mp3 file path
let getSongsTags = async (songFile) => {

    let tag = await new Promise(function (resolve, reject) {
        jsmediatags.read(songFile, { onSuccess: resolve, onError: reject })
    });
    if (tag && tag.tags) {
        tag = tag.tags;
        songTags = {
            title: tag.title || "",
            artist: tag.artist || "",
            album: tag.album || "",
            year: tag.year || "",
            track: tag.track || "",
            genre: tag.genre || "",
            location: songFile
        }
        if (tag.picture) {
            let base64String = "";
            for (let i = 0; i < tag.picture.data.length; i++) {
                base64String += String.fromCharCode(tag.picture.data[i]);
            }
            songTags.picture = { type: tag.picture.type, data: base64String };
        }
    }
    else {
        songTags = {}
    }
    return songTags;
}

module.exports = {
    getSongsTags: getSongsTags
}