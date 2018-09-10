const {app, BrowserWindow} = require('electron')

const NodeID3 = require('node-id3');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');

const _tempDir = path.join(__dirname,'/temp');
const _mp3Dir = path.join(__dirname,'/mp3');

let win

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600})
  win.loadURL(url.format({
    pathname: path.join(__dirname,'index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

app.on('ready',createWindow);


/* ============================================================
    Function: Download Image
============================================================ */

const download_image = (url, image_path) =>
  axios({ url: url, responseType: 'stream' })
    .then(response => {
      response.data.pipe(fs.createWriteStream(image_path));

      return { status: true, error: '' };
    })
    .catch(error => ({ status: false, error: 'Error: ' + error.message }));

/* ============================================================
    Download Images in Order
============================================================ */

/* (async () =>
{
    let example_image_1 = await download_image( 'https://example.com/test-1.png', 'example-1.png' );

    console.log( example_image_1.status ); // true
    console.log( example_image_1.error );  // ''

    let example_image_2 = await download_image( 'https://example.com/does-not-exist.png', 'example-2.png' );

    console.log( example_image_2.status ); // false
    console.log( example_image_2.error );  // 'Error: Request failed with status code 404'

    let example_image_3 = await download_image( 'https://example.com/test-3.png', 'example-3.png' );

    console.log( example_image_3.status ); // true
    console.log( example_image_3.error );  // ''

})(); */

var _images = [];

dosearch = key => {
  return new Promise((resolve, reject) => {
    searchImage(key);
    resolve(_images);
  });
};


searchImage = key => {
  return new Promise((resolve, reject) => {
    var CSE_API_KEY = '007439388879951561867:3ragl0fkhpm';
    var CSE_ID = 'AIzaSyDYvQx76ZvFawwKOaDeGqRClb2RJlIcsXM';

    var parameters = '?q=' + encodeURIComponent(key);
    parameters += '&cx=' + CSE_API_KEY;
    parameters += '&imgSize=large';
    parameters += '&searchType=image';
    parameters += '&key=' + CSE_ID;
    parameters += '&lr=lang_fr';
    parameters += '&start=1';

    var path = 'https://www.googleapis.com/customsearch/v1' + parameters;
    //console.log(path)
    axios.get(path).then(response => {
      //console.log(response);
      var images = response.data.items;
      images.forEach((image, i) => {
        _images.push({
          url: image.link,
          width: image.image.width,
          height: image.image.height,
        });
      });
      resolve(_images);
    });
  });
};

let file = path.resolve(_mp3Dir,'Axel Bauer & Zaziz - A ma place.mp3');
//let filebuffer = new Buffer('Some Buffer of a (mp3) file');
//let filepath = './path/to/(mp3)file';

//let _tags;
function getTags () {
  NodeID3.read(file, function(err, tags) {
    tags.APIC = '';
    //_tags = tags;
    let success = NodeID3.update(tags, file);
    searchImage(tags.artist + ' ' + tags.title).then(images => {
      images.forEach((image, i) => {
        download_image(image.url, path.resolve(_tempDir,`${tags.title}${i}.jpg`));
      });
    });
  });
}

