/*
Olha Bevziuk
INM320
for Christopher Lewis
016234155
November 30, 2017
Template

*/


//ДОБРОЕ УТРО, МОЯ МИЛАШКА!!! ВЕСЬ ДЕНЬ ДУМАЮ О ТЕБЕ, МОЯ ЛЮБОВЬ! КОГДА Я ЭТО ПИШУ, МОЕ СОЛНЫШКЛ СЛАДКО СПИТ.
//КАК ЖЕ Я ХОЧУ УСНУТЬ В ТВОИХ ОБЪЯТИЯХ, СОЛНЫШКО♥
// НАДЕЮСЬ ТЫ СЕГОДНЯ ВСЕ ДОДЕЛАЕШЬ! ЕСЛИ ЧТО, Я ЗДЕСЬ И ВСЕГДА ГОТОВ ТЕБЕ ПОМОЧЬ
//ОЧЕНЬ СИЛЬНО ЛЮБЛЮ ТЕБЯ, МОЕ СЧАСТЬЕЧКО!!!
//СПАСИБО ЗА ТАКИЕ КРАСИВЫЕ ФОТО МОЕЙ МИЛАШКИ!!! КАКАЯ ЖЕ ВЫ У МЕНЯ КРАСИВАЯ.
//НУ А ВИДЕО, СЛОВ НЕТУ! ТАК СОСКУЧИЛСЯ ПО ВАШИМ КРАСИВЫМ НОЖКАМ

//SASS: https://www.youtube.com/watch?v=pw1DeLy2Xsw

 //once the document is ready the first tab("HOME") will be loaded
  $( document ).ready(function() {
    document.getElementById("defaultOpen").click();
  });

  /*----------------------------------------------------------TABS-------------------------------------------*/
  //Once the user clicks on the tab, the function is triggered. tabName - is the name of the tab was clicked on
  function openTab(evt, tabName) {
     // Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

     //if Tab is not by default, call the appropriate tab
    if(tabName==="schedule")
      displayByDay("26 April");
    if(tabName==="Speakers")
      displaySpeakers();
  }

  /*---------------------------------------FILTERS------------------------------------*/
  //Filter events by days
  function filterByDay(val){
    return val.date == this;
  }

  //Filter events by status (Attend/Going)
  function filterByStatus(val){
    return val.status == this;
  }

  //Filter events with a particular speaker
  function filterByName(val){
    return val.speaker == this;
  }

  /*---------------------------------------------EVENTS-----------------------------------*/

  //This function is fired when FILTER checkbox is checked/unchecked
  //If status.checked===true  - checkbox is active, else - not active
  function displayByStatus(status) {

    // status.checked is same as status.checked === true
    // if true we display events with "Going" status
    if(status.checked){
      //make buttons not active

      // document.getElementById("day1btn").className="";
      // document.getElementById("day2btn").className="";

      //get all events from firebase
      firebase.database().ref('event/').on('value', function(snapshot) {
        let result={};
        result = snapshot.val();
        //Filter only events with Going status
        result.events = snapshot.val().events.filter(filterByStatus,"Going");
        if(document.getElementById("day1btn").className==='selectedDay')
          result.events = result.events.filter(filterByDay,"26 April");
        else {
          result.events = result.events.filter(filterByDay,"27 April");
        }
        //get template
        let template = document.getElementById("mustacheTemplate").innerHTML;
        // render all data to template DOM element
        let resultMustache = Mustache.render(template,result);
        document.getElementById("output").innerHTML=resultMustache;
      })
    }
    //if we uncheck filter -> show all events on the page, both attend/going
    else {
      if(document.getElementById("day1btn").className==='selectedDay')
        displayByDay("26 April");
      else
        displayByDay("27 April");
    }
  }

  //The function receives the day parameter and displays the events of this day
  function displayByDay(day){
  //  document.getElementById("filterCheckBox").checked = false;

    if(day==="26 April"){
      document.getElementById("day1btn").className="selectedDay";
      document.getElementById("day2btn").className="notSelectedDay";
    }
    else{
      document.getElementById("day2btn").className="selectedDay";
      document.getElementById("day1btn").className="notSelectedDay";
    }

    if(document.getElementById("filterCheckBox").checked){
      displayByStatus(document.getElementById("filterCheckBox"));
    }

    else{
      //Get all events
      firebase.database().ref('event/').on('value', function(snapshot) {
        let result={};
        result = snapshot.val();
        //Filter events by a particular day
        result.events = snapshot.val().events.filter(filterByDay,day);
        let template = document.getElementById("mustacheTemplate").innerHTML;
        // render all data to template DOM element
        let resultMustache = Mustache.render(template,result);
        document.getElementById("output").innerHTML=resultMustache;
      })
    }
  }

  //The function is called when we click on the button
  //using e.target.getAttribute('data-index'); we can get an index of the event
  function changeEventStatus(e){
    e.preventDefault();
    //save index of the event. we will need it to update the status
    let index = e.target.getAttribute('data-index');
    let oldStatus = e.target.getAttribute('class');
    let newStatus="";

    //switch statuses
    if(oldStatus==="Attend")
      newStatus="Going"
    else {
      newStatus="Attend"
    }

    //save the changes in db. Here we need id(index) to know which one to update
    firebase.database().ref('event/events/' + index).update({
      status: newStatus
    });
  }

  //Once a user click on a particular event, the function is called and only ONE event with details is displayed
  function displayEventDetails(e){
    let scheduleTab = document.getElementById("schedule");
    scheduleTab.style.display="none";
    scheduleTab.className.replace(" active", "");

    //make event details tab active
    let detailsTab = document.getElementById("eventDetails").style.display = "block";
    detailsTab.className += " active";

    //get index/id of the event. we need it to get ONLY this event from Firebase
    let id = e.target.getAttribute("data-eventId");
    //get only one EVENT with all info
    firebase.database().ref('event/events/'+id).on('value', function(snapshot) {
      let details = {events:[]}
      details.events = snapshot.val();
      let template = document.getElementById("eventDetailsMustacheTemplate").innerHTML;
      // render all data to template DOM element
      let resultMustache = Mustache.render(template,details);
      console.log(resultMustache)
      document.getElementById("eventDetailsOutput").innerHTML=resultMustache;
    })
  }

  /*------------------------------------------------------------------------SPEAKERS------------------------------------------------------------------*/
  //Display all speakers for SPEAKERS TAB
  function displaySpeakers(){
    //get all speakers from Firebase DB
    firebase.database().ref('users/').on('value', function(snapshot) {
      let result={};
      result = snapshot.val();
      let template = document.getElementById("speakersMustacheTemplate").innerHTML;
      // render all data to template DOM element
      let resultMustache = Mustache.render(template,result);
      document.getElementById("speakersOutput").innerHTML=resultMustache;
    })
  }

  //Display ONLY ONE SPEAKER with Details
  function displaySpeakerDetails(e){
    let speakerTab = document.getElementById("Speakers");
    speakerTab.style.display="none";
    speakerTab.className.replace(" active", "");

    //Make Speaker Details page active
    let detailsTab = document.getElementById("speakerDetails").style.display = "block";
    detailsTab.className += " active";

    //We need id to get ONLY ONE speaker we need
    let id = e.target.getAttribute("data-speakerId");
    let name = e.target.getAttribute("data-speakerName");

    //GET ONE SPEAKER AND DISPLAY ALL DETAILS
    firebase.database().ref('users/speakers/'+id).on('value', function(snapshot) {
      let details = {speakers:[]}
      details.speakers = snapshot.val();
      let template = document.getElementById("speakerDetailsMustacheTemplate").innerHTML;
      // render all data to template DOM element
      let resultMustache = Mustache.render(template,details);
      document.getElementById("speakerDetailsOutput").innerHTML=resultMustache;
    })

    //The function gets all events and filter them by a speaker name
    firebase.database().ref('event/').on('value', function(snapshot) {
      let result={};
      result = snapshot.val();
      //fiter all events by speaker
      result.events = snapshot.val().events.filter(filterByName,name);

      let template = document.getElementById("speakerEventsMustacheTemplate").innerHTML;
      // render all data to template DOM element
      let resultMustache = Mustache.render(template,result);
      document.getElementById("speakerEventsOutput").innerHTML=resultMustache;
    })
  }
