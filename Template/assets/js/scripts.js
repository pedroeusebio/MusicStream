$(document).ready(function () {
    initMenu();
    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });

    song = new Audio('http://tonycuffe.com/mp3/tailtoddle_lo.mp3');
    songName = "Tail Toddle";

    if (song.canPlayType('audio/mpeg;')) {
        song.type = 'audio/mpeg';
        song.src = 'http://tonycuffe.com/mp3/tailtoddle_lo.mp3';
    } else {
        song.type = 'audio/ogg';
        song.src = 'http://tonycuffe.com/mp3/tailtoddle_lo.ogg';
    }

    song.ontimeupdate = function () {
        updateTime();
    };
    song.onloadedmetadata = function () {
        setDuration();
    };
    
    $('#volume').on("change mousemove", function() {
        console.log("OI " + $('#volume').val());
        song.volume = $('#volume').val() / 100;
        
        if($('#volume').val() > 66) {
            $('#volumeIcon').removeClass('fa fa-volume-down fa-volume-off glyphicon glyphicon-volume-off');
            $('#volumeIcon').addClass('fa fa-volume-up');
            
        } else if( ($('#volume').val() < 33) && ($('#volume').val() > 0)) {
            $('#volumeIcon').removeClass('fa fa-volume-down fa-volume-up glyphicon glyphicon-volume-off');
            $('#volumeIcon').addClass('fa fa-volume-off');
            
        }else if($('#volume').val() == 0) {
            $('#volumeIcon').removeClass('fa fa-volume-down fa-volume-up fa-volume-off');
            $('#volumeIcon').addClass('glyphicon glyphicon-volume-off');
            
        } else {
            $('#volumeIcon').removeClass('fa fa-volume-off fa-volume-up glyphicon glyphicon-volume-off');
            $('#volumeIcon').addClass('fa fa-volume-down');
        }
    });

});


function formatTime(seconds) {
    minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}

$('#seek').click(function (e) {
    var value_clicked = e.offsetX * this.max / this.offsetWidth;
    $('#seek').attr("value", value_clicked);
    console.log(this.value);
    console.log(song.currentTime);
    song.currentTime = value_clicked * song.duration;
});


$("#play").click(function (e) {
    var playIcon = $('#playIcon');
    if (playIcon.hasClass('fa-play')) {
        playIcon.removeClass('fa-play');
        playIcon.addClass('fa-pause');
        song.play();
    } else {
        playIcon.removeClass('fa-pause');
        playIcon.addClass('fa-play');
        song.pause();
    }
});

$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$("#menu-toggle-2").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled-2");
    $('#menu ul').hide();
});

$(".btn-rightMenu").click(function () {
    $('#page-content-wrapper').scrollTop(0);
    $('#page-content-wrapper').toggleClass('actived');
    return false;
   
});

function updateTime() {
    $("#elapsedtime").text(formatTime(song.currentTime));
    $('#seek').attr("value", song.currentTime / song.duration);
}

function setDuration() {
    duration = song.duration;
    $("#totaltime").text(formatTime(duration));
    $(".song-name").text(songName);
}

function initMenu() {
    $('#menu ul').hide();
    $('#menu ul').children('.current').parent().show();
    //$('#menu ul:first').show();
    $('#menu li a').click(
        function () {
            var checkElement = $(this).next();
            if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
                return false;
            }
            if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
                $('#menu ul:visible').slideUp('normal');
                checkElement.slideDown('normal');
                return false;
            }
        }
    );
}