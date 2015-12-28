$(document).ready(function () {
  
   $('#index_form').submit(function (event) {
    event.preventDefault();
    var data = {};
    data.path = $('#file_path').val();
    
    $.post('/music/path',data, function(result) {
      console.log(result);
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
  
  $('div').on("click","input.button_play",function () {
    var id = $(this).attr('id');
  });
  
});