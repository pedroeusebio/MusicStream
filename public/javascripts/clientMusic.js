$(document).ready(function () {
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
  var context = new AudioContext();
  var source = context.createBufferSource();
  var playing = false;
  var music = "";
  var mobile = false;
  
  
  
   $('#index_form').submit(function (event) {
    event.preventDefault();
    var data = {};
    data.path = $('#file_path').val();
    
    $.post('/music/path',data, function(result) {
      alert(result.message);
    });
  });
  
  $('#button_request').click(function () {
    if ($('.button_play')) {
      $('#button_request').nextAll('div').remove();
    }
    $.get("/music/loadList", function (data) {
      if (data.length >= 0) {
        data = data.split('%20%');
        for (var i = 0; i < data.length -1; i++ ){
          var name = data[i].split("/");
          name = name[name.length-1];
          var paragraph = "<div><label class='music_label'>" + name.split("%30")[0] + "</label>"+
          "<input type='button' value='play'  class='button_play' id='"+ name.split('%30')[1] +"'></input>"+
          "<input type='button' value='stop'  class='button_stop' id='"+ name.split('%30')[1] +"'></input></br></div>";
          $("#music_list").append(paragraph);   
        }
      }
    });
  });
  
  $('#music_list').on("click","input.button_play",function () {
    var data = {};
    var id = $(this).attr('id');
    if ($(this).attr('value') == 'play') {
      if(music != '' && music == id){
        context.resume();
      } else {
        if(music != '') {
          context.close();
          $(".button_play#"+ music).attr('value','play');
        }
        music = id;
        data.id = id;
        $.post('/music/start',data,function (result) {
          console.log(result);
        });
        loadSound();
      }
      $(this).attr('value','pause');
    } else if ($(this).attr('value') == 'pause' && music == id) {
      context.suspend();
      $(this).attr('value','play');
    }
    
  });
  
  $('#music_list').on("click","input.button_stop", function () {
    const id = $(this).attr('id');
    if ( id == music){ 
      context.close();
      music = '';
      $(".button_play#"+id).attr('value','play');
    }
  });
  
  function process(Data) {
    context = new AudioContext();
    source = context.createBufferSource(); // Create Sound Source
    context.decodeAudioData(Data, function(buffer){
      source.buffer = buffer;
      source.connect(context.destination);
      //source.noteOn(context.currentTime);
      source.start(context.currentTime);
    });    
  };
  
  function loadSound() {
    var request = new XMLHttpRequest();
    request.open("GET", "/music/play", true); 
    request.responseType = "arraybuffer"; 

    request.onload = function() {
        var Data = request.response;
        process(Data);
    };

    request.send();
  };
  
  function detectmob() {
    if( navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
      ){
        return true;
    } else {
      return false;
    }
  }
  
});