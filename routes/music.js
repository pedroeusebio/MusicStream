var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var fpath = require('path');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
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

function listAllKeys(){
  connects3();
  var s3 = new Promise.promisifyAll(new AWS.S3());
  var params = {Bucket: 'musicstreamming'};
  
  return s3.listObjectsAsync(params).then( function (data) {
    var listMusic = [];
    data.Contents.map(function(content) {
      var bucketPath = "/s3bucket/" + content.Key;
      listMusic.push(bucketPath);
    });
    return listMusic;
  });
  
}

router.get('/', function (req,res) {
  res.render('music', {title: 'Music Stream'});
});

router.get('/loadList', function (req, res) {
  var string_files= "";
  var listMusic = [];
  if(path.length > 0){
    walk(path, function (err, results) {
      if (err) throw err;
      var i = 0;
      results.map(function(result) {
        string_files += result + "%30" + i + "%20%";
        musics.push(result);
        i++;
      });
      listAllKeys().then(function (listMusic) {
        listMusic.map(function (music) {
          string_files += music + "%30" + i + "%20%";
          musics.push(music);
          i++;
        });
        res.json(string_files);
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
  var data = req.body.id;
  music_path = musics[data];
  music_path = music_path.replace(" ", "\ ");
  //music_path = path + "/" + data;
  res.json("sucess !");
});

router.get('/play', function (req,res) {
  res.set({'Content-Type': 'audio/mpeg'});
  console.log(music_path.split('/'));
  if(music_path.split('/')[1] == "s3bucket") {
    connects3();
    var name = music_path.split('/');
    var key = name[name.length-1];
    
    var s3 = new AWS.S3();
    var params = {Bucket: 'musicstreamming', Key: key};
    res.attachment(key);
    var fileStream = s3.getObject(params).createReadStream();
    fileStream.pipe(res);    
  } else {
    var readStream = fs.createReadStream(music_path);
    readStream.pipe(res);
  }
});

function connects3 () {
  var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  AWS.config.credentials = credentials;
  AWS.config.update({region: 'us-east-1'});
}

module.exports = router;