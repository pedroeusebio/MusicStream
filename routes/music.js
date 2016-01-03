var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var fpath = require('path');
var path = "";
var music_path = '';

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
          results.push(file);
          next();
        }
      });
    })();
  });
  return results;
};

router.get('/', function (req,res) {
  res.render('music', {title: 'Music Stream'});
});

router.get('/loadList', function (req, res) {
  var string_files= "";
  if(path.length > 0){
    walk(path, function (err, results) {
      if (err) throw err;
      for (var i = 0 ; i < results.length; i++){
         string_files += results[i] + "%20%";
      }
      res.json(string_files);
    });
  }
});

router.post('/path', function (req,res) {
  var data = req.body.path;
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
  console.log(data);
  music_path = fpath.join(path,data);
  console.log(music_path);
  //music_path = path + "/" + data;
});

router.get('/play', function (rq,res) {
  res.set({'Content-Type': 'audio/mpeg'});
  var readStream = fs.createReadStream(music_path);
  readStream.pipe(res);
});

module.exports = router;