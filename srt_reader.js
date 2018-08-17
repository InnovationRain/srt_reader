var SRT_READER = {
   SRT : "",
   PARSED : "",
   OBJECT : [],
   PLAYING_INTERVAL : "",
   SRT_INDEX : 0,
   STATE : "NONE",
   SHOW_ELEMENT_ID: "",
   SRT_GET : function (path) {
       var CLASS = this;
       CLASS.STATE = "PROGRESSING";
       var xmlhttp = new XMLHttpRequest();
       xmlhttp.onreadystatechange  = function () {
           if(this.readyState === 4 && this.status === 200){
              CLASS.SRT = this.responseText;
              CLASS.STATE = "LOADED";
              CLASS.PARSE_SRT(CLASS.SRT);
           }
       };

       xmlhttp.open("GET",path,true);
       xmlhttp.send();
   },
   PARSE_SRT : function (string) {
       var tmp = 0;
       this.STATE = "PARSING";
       this.PARSED = string.split("\r\n");
       for(var i = 0;i < this.PARSED.length;i++){
          tmp++;
          if(this.PARSED[i] == ""){
              var obj = {};
              if(tmp === 4){
                obj.id = this.PARSED[i - 3];
                obj.time = this.PARSE_SRT_TIME(this.PARSED[i-2]);
                obj.text = this.PARSED[i - 1];
              }
              if(tmp === 5){
                  obj.id = this.PARSED[i -4];
                  obj.time = this.PARSE_SRT_TIME(this.PARSED[i-3]);
                  obj.text = this.PARSED[i - 2] + "\n" + this.PARSED[i-1];
              }
              tmp = 0;
              this.OBJECT.push(obj);
          }
       }

       this.STATE = "PARSED";
   },
   PARSE_SRT_TIME:function(time){
       var obj = {};
       time = time.split(" --> ");
       obj.start_time = time[0].split(',')[0];
       obj.end_time = time[1].split(",")[0];
       obj.start_miliseconds = time[0].split(",")[1];
       obj.end_miliseconds = time[1].split(",")[1];
       return obj;
   },
   //CURRENT PLAYER TIME FORMAT hh:mm:ss
   PLAY_SRT: function(current_player_time,duration){
      if(current_player_time >= duration){
          this.STATE = "ENDED";
      }else{
          this.STATE = "RENDERING";
          var time = this.SECONDS_TO_TIME(current_player_time);
          var nowSpeech = SRT_READER.OBJECT[SRT_READER.SRT_INDEX];
          if(time == nowSpeech.time.start_time){
              document.getElementById('speech').innerHTML = nowSpeech.text;
              clearTimeout(SRT_READER.PLAYING_INTERVAL);
              this.PLAYING_INTERVAL = setTimeout(function () {
                  if(SRT_READER.SRT_INDEX > SRT_READER.OBJECT.length){
                      clearTimeout(SRT_READER.PLAYING_INTERVAL);
                  }else{
                      SRT_READER.SRT_INDEX++;
                  }
              },parseInt(nowSpeech.time.end_miliseconds));
          }
      }

   },
   SECONDS_TO_TIME : function (seconds) {
       var sec_num = parseInt(seconds, 10); // don't forget the second param
       var hours   = Math.floor(sec_num / 3600);
       var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
       var seconds = sec_num - (hours * 3600) - (minutes * 60);

       if (hours   < 10) {hours   = "0"+hours;}
       if (minutes < 10) {minutes = "0"+minutes;}
       if (seconds < 10) {seconds = "0"+seconds;}
       return hours+':'+minutes+':'+seconds;
   },
   FIND_INDEX_BY_TIME : function(current_video_time){
      for(var i = 0;i < this.OBJECT.length;i++){
          var start = this.HHMMSS_TO_SECONDS(SRT_READER.OBJECT[i].time.start_time);
          var end = this.HHMMSS_TO_SECONDS(SRT_READER.OBJECT[i].time.end_time);
          console.log("----")
          if(current_video_time <= end && current_video_time >= start){
              this.SRT_INDEX = i;
          }
      }
   },

   HHMMSS_TO_SECONDS:function (time) {
       var a = time.split(':');
       var seconds = (+parseInt(a[0],10)) * 60 * 60 + (+parseInt(a[1],10)) * 60 + (+parseInt(a[2],10));
       return seconds;
   }
};

document.getElementById('video').addEventListener('timeupdate',function () {
   var currentTime = this.currentTime;
   SRT_READER.PLAY_SRT(currentTime,this.duration);
});


SRT_READER.SHOW_ELEMENT = "speech";
SRT_READER.SRT_GET("http://c2.mggcdn.net/81/866004961/original_ru_0.srt");

SRT_READER.HHMMSS_TO_SECONDS("00:00:60");