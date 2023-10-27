//console.log("hii from feedback page");
var CandidateFeedbackList = "CandidateFeedbackList";
var AllQuestionsList = "AllQuestionList";
var QuestionsList = "QuestionsList";
//var questions = "";
var formData = [];
var totalScore = 0;
var interviewType = "";
var newRow = "";
var selectedScoreValue = 0;
var candidateId = "";
var position = "";
var title = "";
var Resumeid = '';
var techScore = "";
var AllEmails= '';
 var resumeID='';
var name='';
var practice ='';
var interviewer ='';
var formattedDate='';
$(document).ready(function () {

    //function to get admins email addresses
    
    getAdminEmails();
    
    Resumeid = GetParameterValues("candidateId");
    var CandidateFeedbackListUrl =_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" +CandidateFeedbackList +"')/items?$select=Title,Id,Created,CandidateResumeId,InterviewType,Tech_x0020_Score,InterviewerId,Interviewer/Title,PracticeId,Practice/Title,Tech_x0020_Score,StatusId,Status/Title,PositionAppliedFor&$expand=Interviewer,Practice,Status&$filter=Id eq '" +Resumeid +"'";
	var QuestionsListUl = _spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +QuestionsList +"')/items";
    var HRQuestionListUrl =_spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +AllQuestionsList +"')/items?$filter=InterviewType eq 'HR Interview'"; //?$filter=(InterviewType eq '"+interviewType+")and '
	var TRQuestionListUrl = _spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +AllQuestionsList +"')/items?$filter=InterviewType eq 'Technical Interview'"; //?$filter=InterviewType eq '"+interviewType+"'

//to show candidated details
  getData(CandidateFeedbackListUrl).done(function (data) {
    interviewType = data.d.results[0].InterviewType;
    candidateId = data.d.results[0].Id;
    techScore = data.d.results[0].Tech_x0020_Score;
    poition = data.d.results[0].PositionAppliedFor;
    title = data.d.results[0].Title;
    resumeID = data.d.results[0].CandidateResumeId;
    practice = data.d.results[0].Practice.Title;
    interviewer = data.d.results[0].Interviewer.Title;
    var date=data.d.results[0].Interviewer.Created;
    formattedDate = moment(date).format('DD MMMM YYYY HH:mm');
   // var newDate=new Date(date);
    name=title ;
    $("#totalScore").val(score);
    $("#resumeId").html(resumeID);
    $("#candidateName").html(title);
    $("#position").html(poition);
    $("#interviewType").html(interviewType);
    $("#interviewer").html(interviewer);
    $("#practice").html(practice);
    $("#date").html(formattedDate);
  });

  setTimeout(() => {
    if (interviewType == "HR Interview") {
      AllQuestionsListUrl = HRQuestionListUrl;
    } else {
      AllQuestionsListUrl = TRQuestionListUrl;
    }

    getData(AllQuestionsListUrl).done(function (data) {
      var formdata = data.d.results;
      var formData = $(formdata).filter(function (idx) {
        return formdata[idx].QuestionStatus == true;
      });

      if(techScore){
        $("#btnSave").css('display','none')
        $("#totalScore").val(techScore);
        $('#totalScore').prop('disabled', true)
        //location.reload(true);
         showCandidatesDetails();
         
         
      }else{
       $("#btnSave").css('display','inline')
        showForm(formData);
        var scoreDropdown = newRow.find(".score");
        scoreDropdown.on("change", function () {
        var selectedScoreValue = $(this).val();
        var questionIndex = $(this).closest(".programContent").index();
        var calculateScore = calculateTotalScore();
        $("#totalScore").val(score);
      });

      }
    });
  }, 500);

  $(".closeButton").click(function () {
    $(".modallg").css("display", "none");
  });
  
   $("#successbtn").click(function () {
        window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/Home.aspx"
  });

 
   $(".okButton").click(function () {
        
        var validateData = validateFunction();
        console.log("validateData ",validateData )
        if(validateData ){
        formData.forEach(function (item) {
        var objectData = {
          __metadata: {
            type: "SP.Data.QuestionsListListItem",
          },
          Title: item.questions,
          Score: item.score,
          Remarks: item.remark,
          InterviewType: item.interviewType,
          CandidateIDId: candidateId,
        };
        createNewItem(objectData, QuestionsListUl);
      });
      
       $(".modallg").css("display", "none");
       $(".successbtn ").css("display", "inline");
       $(".successModel").css("display", "block");
       $("#smBody").html("Data has been created successfully !");

      var from = "HR Team"; // Sender's emailject
      var cc = []; // CC recipients if needed
      var to = AllEmails.split(";");
      var subject = "Interview Feedback for " + name + "";
      var body = "Candidate Resume ID: " + resumeID+ "<br>" +
            "Candidate Name: " + name + "<br>" +
            "Interview Type: " + interviewType + "<br>" +
            "Interviewer: " + interviewer + "<br>" +
            "Position Applied For: " + poition + "<br>" +
            "Practice: " + practice + "<br>" +
            "Interview Date: " + formattedDate+ "<br>"+
            "Thank you"+"<br>"+
             "Note: This is an automated message - please do not reply.";
             console.log('to',to);
      
        sendEmail(from, to, cc, body, subject);
         
    }else{
     $(".modallg").css("display", "none");
     location.reload(true);
    }
   
  });

  //Back to home page
  $("#btnCancel").click(function () {
    window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/Home.aspx";
      
  });
 $(".closeButton ").click(function () {
        location.reload(true);
  });

  var score = "";

  function calculateTotalScore() {
    var totalScore = 0;
    $(".score").each(function () {
      var selectedscore = parseInt($(this).val());
      if (!isNaN(selectedscore)) {
        totalScore += selectedscore;
        score = totalScore;
      }
    });
  }

  $("#btnSave").click(function () {
    // questionContainer.empty();
 
    var validateData = validateFunction();
     $("#okbtn").css("display", "inline");
    if (validateData) {
      $("#myModal").css("display", "block");
      $("#mBody").html("Are you sure to proceed data");
      $(".okButton").css("display", "inline");
      var questionContainer = $("#questionContainer");
      questionContainer.find(".programContent").each(function (index) {
        var score = $(this).find(".score").val();
        var questions = $(this).find(".question").text();
        var remark = $(this).find(".remark").val();
        var question = questions.split(".");
        var objectData = {
          score: score,
          questions: question[1],
          remark: remark,
          interviewType: interviewType,
        };

        formData.push(objectData);
      });

      var updateData = {
        __metadata: {
          type: "SP.Data.CandidateFeedbackListListItem",
        },
        Tech_x0020_Score: score,
      };
      var CandidateFeedbackListURL = _spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +CandidateFeedbackList + "')/getItemByID('" +candidateId + "')";
      updateItem(updateData, CandidateFeedbackListURL);

    } else {
      $("#myModal").css("display", "block");
      $("#mBody").html("Please enter all fields.");
    }
  });
});

function showForm(formData) {
  // questionContainer.empty();

  var formdata = formData.sort();
  var one = 1;
  var two = 2;
  var three = 3;
  var four = 4;
  var zero = 0;
  $.each(formdata, function (index, val) {
    var id = index + 1;

    newRow = $("<div>", { class: "row programContent border m-2" });
    newRow.html(
      '<div class="col-xs-12 col-sm-6 col-md-4"><div class="align-flex pt-5 program-value question" >' +
        val.Title +
        "</div></div>" +
        '<div class="col-xs-12 col-sm-3 col-md-2"><div class="align-flex pt-5 program-value">' +
        '<select class="score form-control" id="scoreDropdown" >' +
        "<option value=" +
        zero +
        ">Select Score</option><option value=" +
        one +
        " >Below Average</option><option value=" +
        two +
        " >Average</option> <option value=" +
        three +
        " >Good</option> <option value=" +
        four +
        " >Very Good</option>" +
        "</select>" +
        "</div></div>" +
        '<div class="col-xs-12 col-sm-3 col-md-4"><div class="align-flex pt-5 program-value"><textarea class="remark form-control" name="remark' +
        index +
        '"></textarea></div></div>'
    );
    $("#questionContainer").append(newRow);
  });
}

function validateFunction() {
  var arr = [];
  var questionContainer = $("#questionContainer");
  var flag = true;
  questionContainer.find(".programContent").each(function (index) {
    var score = $(this).find(".score").val();
    var questions = $(this).find(".question").text();
    var remark = $(this).find(".remark").val();
    arr.push(score);
    arr.push(remark);
    //console.log(score, remark, arr);
    if (score == 0 && remark == "") {
      flag = false;
    } else if (remark == "") {
      flag = false;
    } else if (score == 0) {
      flag = false;
    }
  });
  if (flag == false) {
    return false;
  } else {
    return true;
  }
}

function getAdminEmails() {
  var AdminConfig = "AdminConfig";
  var AdminConfigURL = _spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +AdminConfig +"')/items?$select=AdminEmails";

  getData(AdminConfigURL).done(function (data) {
  
    var emails = data.d.results;
     AllEmails=emails[0].AdminEmails;
    console.log(AllEmails)
     });
}

async function getUserGroups() {
  try {
    const response = await fetch(
      _spPageContextInfo.webAbsoluteUrl +
        "/_api/web/currentuser/?$expand=Groups",
      {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user groups");
    }
    const data = await response.json();
    //console.log("data", data);
    const currentUser = data.d.Title;
    const userGroups = data.d.Groups.results;
   // console.log("userGroups", userGroups);
    let admin = false;
    let visitor = false;
    for (const group of userGroups) {
      if (group.Title === "Admin") {
        admin = true;
        // getAdminEmail();
      }
    }
  } catch (error) {
    // alert("Error occurred: " + error.message);
  }
}

 function GetParameterValues(param) {
  var url = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
  for (var i = 0; i < url.length; i++) {
    var urlparam = url[i].split("=");
    if (urlparam[0] == param) {
    //console.log(urlparam[1])
      return urlparam[1];
    }
   }
  }
  
  
  function  showCandidatesDetails(){
  
  var Qlisturl = _spPageContextInfo.webAbsoluteUrl +"/_api/web/lists/GetByTitle('" +QuestionsList +"')/items?$filter=CandidateID eq ('"+Resumeid +"')";
  var feedbackdata='';
  getData(Qlisturl).done(function (data) {
      feedbackdata = data.d.results;
      console.log('formdata ',feedbackdata)
   })
   
   setTimeout(()=>{

     $.each(feedbackdata , function (index, val) {
    var id = index + 1;
   // console.log('feedbackdata ',feedbackdata )
    newRow = $("<div>", { class: "row programContent border m-2" });
      newRow.html(
      '<div class="col-xs-12 col-sm-6 col-md-4"><div class="align-flex pt-5 program-value question" >'+id+'. ' +
        val.Title +
        "</div></div>" +
        '<div class="col-xs-12 col-sm-3 col-md-2"><div class="align-flex pt-5 program-value">' +
        '<span disabled class="score form-control text-dark" id="scoreDropdown" >' +
         val.Score+
        "</span>" +
        "</div></div>" +
        '<div class="col-xs-12 col-sm-3 col-md-4"><div class="align-flex pt-5 program-value"><textarea disabled readonly  class="remark form-control text-dark" name="remark' +
        index +
        '"> '+val.Remarks+'</textarea></div></div>'
    );
    $("#questionContainer").append(newRow)
    
     });

   },500)

  }
  
/*
function getUserEmail(userId) {
  var url =
    _spPageContextInfo.webAbsoluteUrl +
    "/_api/web/getuserbyid(" +
    userId +
    ")?$select=Email";
  var userEmail = null;

  // Send GET request to SharePoint REST API
  $.ajax({
    url: url,
    type: "GET",
    async: false, // Make the request synchronous
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      if (data.d.Email) {
        userEmail = data.d.Email;
      }
    },
    error: function (error) {
      console.log("Error retrieving user email: " + JSON.stringify(error));
    },
  });

  return userEmail;
}

function getAdminEmail(){
$.ajax({
    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers/getByEmail('user@example.com')",
    method: "GET",
    headers: { "Accept": "application/json; odata=verbose" },
    success: function(data) {
        var userEmail = data.d.Email;
        console.log("User Email:", userEmail);
    },
    error: function(error) {
        console.log("Error:", error);
    }
});



}
*/
