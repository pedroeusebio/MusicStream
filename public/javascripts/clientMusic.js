$(document).ready(function () {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  
  
   $('#index_form').submit(function (event) {
    event.preventDefault();
    var data = {};
    data.path = $('#file_path').val();
    
    $.post('/music/path',data, function(result) {
      alert(result.message);
    })
  });
  
  $('#button_request').click(function () {
    if($('.button_play')){
      $('#button_request').nextAll('div').remove();
    }
    $.get("/music/loadList", function (data) {
      if (data.length >= 0) {
        data = data.split('%20%');
        for (var i = 0; i < data.length; i++ ){
          var name = data[i].split("/");
          name = name[name.length-1];
          var paragraph = "<div><label class='music_label'>" + name + "</label><input type='button' value='start'  class='button_play' id='"+ name +"'></input></br></div>";
          $("#music_list").append(paragraph);
        }
      }
    });
  });
  
  $('#music_list').on("click","input.button_play",function () {
    var data = {};
    var id = $(this).attr('id');
    console.log(id);
    data.id = id;
    console.log(data);
    $.post('/music/start',data,function (result) {
      console.log(result);
    });
    loadSound();
  });
  
  function process(Data) {
    source = context.createBufferSource(); // Create Sound Source
    context.decodeAudioData(Data, function(buffer){
      source.buffer = buffer;
      source.connect(context.destination); 
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
  
});