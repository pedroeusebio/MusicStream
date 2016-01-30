var express = require('express');
var router = express.Router();
var fs = require('fs');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var R = require('ramda');

var path = "";
var music_path = '';
var musics = new Array();


function walk(dir,done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + "/" + file;
      fs.stat(file, function(err,stat){
        if (stat && stat.isDirectory()){
          walk(file, function(err, res){
            results = results.concat(res);
            next();
          });
        } else {
          var arq = file.split('/');
          arq = arq[arq.length -1];
          if(arq.split(".")[1] === "mp3"){
            results.push(file);
          }
          next();
        }
      });
    })();
  });
  return results;
};

function connects3 () {
  let credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  AWS.config.credentials = credentials;
  AWS.config.update({region: 'us-east-1'});
}

function getListBucket (content, listMusic) {
  let bucketPath = "/s3bucket/" + content.Key;
  listMusic.push(bucketPath);
}

function listAllKeys(){
  connects3();
  const s3 = new Promise.promisifyAll(new AWS.S3());
  const params = {Bucket: 'musicstreamming'}; 
  return s3.listObjectsAsync(params).then( function (data) {
    let listMusic = [];
    R.map(content => getListBucket(content, listMusic), data.Contents);
    return listMusic;
  });
  
}

function getObjectBucket(key) {
  connects3();
  const s3 = new AWS.S3();
  const params = {Bucket: 'musicstreamming', Key: key};
  return s3.getObject(params).createReadStream();
}

router.get('/', function (req,res) {
  res.render('music', {title: 'Music Stream'});
});

router.get('/loadList', function (req, res) {
  var listMusic = [];
  if(path.length > 0){
    walk(path, function (err, results) {
      if (err) throw err;
      R.map(result => musics.push(result), results);
      listAllKeys().then(function (listMusic) {
        R.map(music => musics.push(music), listMusic);
        res.json(musics);
      });
    }); 
  }
});

router.post('/path', function (req,res) {
  var data = req.body.path;
  musics = [];
  fs.exists(data , function (exists) {
    if(exists){
      path = data;
      res.json( {message :"Path added with sucess !"});
    } else {
      path = "";
      res.json( {message :"Path do not exists !"});
    }
  });
});

router.post('/start', function (req,res) {
  let data = req.body.id;
  music_path = musics[data];
  music_path = music_path.replace(" ", "\ ");
  res.json("sucess !");
});

router.get('/play', function (req,res) {
  res.set({'Content-Type': 'audio/mpeg'});
  if(music_path.split('/')[1] == "s3bucket") {
    let name = music_path.split('/');
    let key = name[name.length-1];
    res.attachment(key);
    let fileStream = getObjectBucket(key);
    fileStream.pipe(res);    
  } else {
    let readStream = fs.createReadStream(music_path);
    readStream.pipe(res);
  }
});

module.exports = router;