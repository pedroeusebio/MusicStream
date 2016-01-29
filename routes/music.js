var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var fpath = require('path');
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

function listAllKeys(musics){
  var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  AWS.config.credentials = credentials;
  AWS.config.update({region: 'us-east-1'});
  var s3 =  new AWS.S3();
  var params = {Bucket: 'musicstreamming'};
  s3.listObjects(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else{
      for( var i = 0; i < data.Contents.length; i++){
        musics.push("s3bucket/" + data.Contents[i].Key);
      }
    }
  });
}

router.get('/', function (req,res) {
  res.render('music', {title: 'Music Stream'});
});

router.get('/loadList', function (req, res) {
  var string_files= "";
  if(path.length > 0){
    walk(path, function (err, results) {
      if (err) throw err;
      for (var i = 0 ; i < results.length; i++){
         string_files += results[i]+ "%30" + i + "%20%";
        musics.push(results[i]);
      }
      /*listAllKeys(musics);
      console.log(musics);*/
      res.json(string_files);
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
  var readStream = fs.createReadStream(music_path);
  readStream.pipe(res);
});

module.exports = router;