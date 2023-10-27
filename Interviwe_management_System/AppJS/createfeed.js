console.log("Hello");

// Function to validate the form fields
 const validateForm = ()=>{
    var isValid = true;
  // Reset any previous error messages
  $(".invalid-feedback").remove();
    // Validate Candidate Resume Id
    var candidateResumeId = $("#candidateResumeId").val();
    if (!candidateResumeId) {
     
      $("#candidateResumeId").addClass("is-invalid");
       $("#candidateResumeId").after('<div class="invalid-feedback">This field is required.</div>');
        isValid = false;
    } else {
      $("#candidateResumeId").removeClass("is-invalid");
    }

    // Validate Candidate Name
    var candidateName = $("#candidateName").val();
    if (candidateName.trim() === "") {
      isValid = false;
      $("#candidateName").addClass("is-invalid");
       $("#candidateName").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#candidateName").removeClass("is-invalid");
    }

    // Validate Interview Type
    var interviewType = $("#interviewType").val();
    if (interviewType === "") {
      isValid = false;
      $("#interviewType").addClass("is-invalid");
       $("#interviewType").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#interviewType").removeClass("is-invalid");
    }

    // Validate Interviewer
    var interviewer = getSelectedUserEmail("peoplepicker");
    if (!interviewer) {
      isValid = false;
      $("#peoplepicker_TopSpan").addClass("is-invalid");
       $("#peoplepicker_TopSpan").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#peoplepicker_TopSpan").removeClass("is-invalid");
    }

    // Validate Position Applied For
    var positionAppliedFor = $("#positionAppliedFor").val();
    if (positionAppliedFor.trim() === "") {
      isValid = false;
      $("#positionAppliedFor").addClass("is-invalid");
      $("#positionAppliedFor").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#positionAppliedFor").removeClass("is-invalid");
    }

    // Validate Practice
    var practice = $("#practice").val();
    if (practice === "") {
      isValid = false;
      $("#practice").addClass("is-invalid");
      $("#practice").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#practice").removeClass("is-invalid");
    }

    // Validate Interview Date
    var interviewDate = $("#interviewDate").val();
    
    if (interviewDate.trim() === "") {
      isValid = false;
      $("#interviewDate").addClass("is-invalid");
        $("#interviewDate").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#interviewDate").removeClass("is-invalid");
    }

    return isValid;
   
  }   
//clear the input 
const  clearPopulatedFields =()=>{
    $("#candidateResumeId").val("");
    $("#candidateName").val("");
    $("#peoplepicker").val("");
    $("#interviewType").val("");
    $("#positionAppliedFor").val("");
    $("#practice").val("");
    $("#interviewDate").val("");
}


//people picker for interviewer field


// People picker for interviewer field
const initializePeoplePicker = (peoplePickerElementId, allowMultipleValues, PeopleorGroup, GroupID) => {  
    // Create a schema to store picker properties, and set the properties.
    const schema = {
        SearchPrincipalSource: 15, // Search source
        ResolvePrincipalSource: 15, // Resolve source
        MaximumEntitySuggestions: 50, // Maximum suggestions
        Width: '220px', // Width of the control
        AllowMultipleValues: allowMultipleValues, // Allow multiple values
        PrincipalAccountType: PeopleorGroup === 'PeopleOnly' ? 'User' : 'User,DL,SecGroup,SPGroup', // Account types
        SharePointGroupID: GroupID > 0 ? GroupID : undefined // SharePoint group ID
    };
    
    // Initialize the people picker control
    SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
};


// Function to get user information from a People Picker control.
const getUserInfo = (PeoplepickerId) => {
    const peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];
    
    if (!peoplePicker.IsEmpty()) {
        if (peoplePicker.HasInputError || !peoplePicker.HasResolvedUsers()) {
            return false;
        }
        
        const users = peoplePicker.GetAllUserInfo();
        let UsersID = ''; // Declare UsersID here
        
        for (let i = 0; i < users.length; i++) {
            UsersID += GetUserID(users[i].Key);
        }
        
        return UsersID; // Return UsersID here
    } else {
        return '';
    }
};

// Function to get the user ID using an AJAX call.
const GetUserID = async (logonName) => {
    const item = { logonName };
    
    try {
        const response = await $.ajax({
            url: `${_spPageContextInfo.siteAbsoluteUrl}/_api/web/ensureuser`,
            type: "POST",
            async: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        });
        
        console.log("Users", response);
        return response.Id;
    } catch (error) {
        failure(error);
    }
};

// Function to initialize a People Picker control with a user name.
const initializePeoplePickerWithUserID = (peoplePickerId, userName) => {
    const peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId + "_TopSpan"];
    
    if (peoplePicker) {
        // Clear existing users and add new user by key
        peoplePicker.DeleteProcessedUser();
        peoplePicker.AddUserKeys(userName, false);
    }
};


// Function to clear a People Picker control.
const clearPeoplePicker = (peoplePickerId) => {
    const peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId + "_TopSpan"];
    
    if (peoplePicker && peoplePicker.HasResolvedUsers()) {
        // Clear processed user and any server error
        peoplePicker.DeleteProcessedUser();
        peoplePicker.ClearServerError();
    }
};

const getUserIdByTitle = async (userTitle) => {
    const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/siteusers?$filter=Title eq '${userTitle}'`;
    
    try {
        const response = await $.ajax({
            url: url,
            type: "GET",
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose"
            }
        });
        
        if (response.d.results.length > 0) {
            return response.d.results[0].Id;
        }
    } catch (error) {
        console.log("Error retrieving user ID: " + JSON.stringify(error));
    }
    
    return null;
};


//function to get email Id
const  getSelectedUserEmail = (peoplePickerId) => {
    var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId + "_TopSpan"];
    console.log("peoplePicker",peoplePicker);
    if (peoplePicker) {
        var users = peoplePicker.GetAllUserInfo();
        if (users.length > 0) {
            return users[0].EntityData.Email;
        }
    }
    return null;
}

// Initialize the people picker when the document is ready
$(document).ready(() => {
    initializePeoplePicker('peoplepicker', false, 'PeopleOnly', 44);
});

// Document ready function with additional UI modifications.
$(document).ready(() => {
    // Style the people picker for better presentation
    $("#peoplepicker_TopSpan").addClass("form-control");
    $("#peoplepicker_TopSpan_InitialHelpText").css("padding-top", "10px");
    $("#peoplepicker_TopSpan_InitialHelpText").css("padding-bottom", "10px");
    $("#peoplepicker_TopSpan").css("width", "100%");
});






// Function to populate the 'practice' dropdown
const getPractice = async () => {
    // Add a default option to the dropdown
    $('#practice').append($("<option>").text("Select practice").val(""));

    // Define the SharePoint REST API URL to fetch practice data
    const url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('PracticeList')/items?$select=ID,Title";

    try {
        // Send a GET request to the SharePoint REST API
        const response = await $.ajax({
            url: url,
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            }
        });

        // Get the select element for the 'practice' dropdown
        const practiceSelect = $("#practice");
        console.log(response.d.results);

        // Iterate through the retrieved items and populate the dropdown
        response.d.results.forEach((item) => {
            const practiceID = item.ID;
            const practiceName = item.Title;

            // Create an option element and append it to the dropdown
            practiceSelect.append($("<option>").val(practiceID).text(practiceName).attr("data-value", item.Title));
        });
    } catch (error) {
        // Handle any errors that occur during the AJAX request
        console.log("Error: " + JSON.stringify(error));
    }
};
getPractice();


// change the people picker/ interviewer lable 
$("#interviewType").change(function() {
        var selectedInterviewType = $(this).val();
        if (selectedInterviewType === "Technical Interview") {
            $("#interviewerTechLabel").show();
            $("#interviewerHRLabel").hide();
            $('#interviewerLabel').hide();
        } else if (selectedInterviewType === "HR Interview") {
            $("#interviewerTechLabel").hide();
            $("#interviewerHRLabel").show();
             $('#interviewerLabel').hide();
        } else {
            $("#interviewerTechLabel").hide();
            $("#interviewerHRLabel").hide();
        }
  });







  $('#submit-btn').on('click', ()=> {
    
     if (validateForm()) {
       $("#myModal").css("display", "block");
       $("#mBody").html(" Are you sure to create feedback?");
       $(".okButton").css("display", "inline");
     }
 })


 // Event handler for the 'okButton' click event
$(".okButton").click(() => {
    $("#myModal").css("display", "inline");
    const selectedDate = new Date($("#interviewDate").val());
    const formattedDate =
        selectedDate.getDate() + " " +
        selectedDate.toLocaleString('default', { month: 'long' }) + " " +
        selectedDate.getFullYear() + " " +
        selectedDate.getHours() + ":" +
        (selectedDate.getMinutes() < 10 ? '0' : '') + selectedDate.getMinutes();

    const feedbackObject = {
        "__metadata": { "type": "SP.Data.CandidateFeedbackListListItem" },
        "Title": $("#candidateName").val(),
        "CandidateResumeId": $("#candidateResumeId").val(),
        "InterviewType": $("#interviewType").val(),
        "PositionAppliedFor": $("#positionAppliedFor").val(),
        "PracticeId": $("#practice").val(),
        "DateAndTime": formattedDate,
        "InterviewerId": getUserInfo("peoplepicker")
    };

    // Define request URL
    const reqURL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('CandidateFeedbackList')/items";

    // Create a new item
    createNewItem(feedbackObject, reqURL);

    $("#myModal").hide();
    $("#successModal").css("display", "block");
    $("#mmBody").html("Your feedback has been created successfully.");

    console.log("feedbackObject", feedbackObject);

    // Retrieve data for email
    const candidateResumeId = feedbackObject.CandidateResumeId;
    const candidateName = feedbackObject.Title;
    const interviewerType = feedbackObject.InterviewType;

    const interviewerData = JSON.parse($("#peoplepicker_TopSpan_HiddenInput").val())[0];
    const interviewerName = interviewerData.DisplayText;

    const positionAppliedFor = feedbackObject.PositionAppliedFor;
    const practiceId = $("#practice").val();
    const practice = $("#practice").find("option[value='" + practiceId + "']").text();
    const interviewDate = feedbackObject.DateAndTime;

    const interviewerEmail = getSelectedUserEmail("peoplepicker");

    // Prepare email content and send it
    let from = "";
    const cc = []; // CC recipients if needed
    let to = "";
    let subject = "Interview feedback of " + candidateName + " for position of " + positionAppliedFor;
    let body = "";

    if (interviewerType === "Technical Interview") {
        to = [interviewerEmail];
        body = "Candidate Resume ID: " + candidateResumeId + "<br>" +
            "Candidate Name: " + candidateName + "<br>" +
            "Interview Type: " + interviewerType + "<br>" +
            "Tech Interviewer: " + interviewerName + "<br>" +
            "Position Applied For: " + positionAppliedFor + "<br>" +
            "Practice: " + practice + "<br>" +
            "Interview Date: " + interviewDate + "<br>" +
            "Thank you" + "<br>" +
            "Note: This is an automated message - please do not reply.";
    } else if (interviewerType === "HR Interview") {
        to = [interviewerEmail];
        subject = "Interview feedback of " + candidateName + " for position of " + positionAppliedFor;
        body = "Candidate Resume ID: " + candidateResumeId + "<br>" +
            "Candidate Name: " + candidateName + "<br>" +
            "Interview Type: " + interviewerType + "<br>" +
            "HR Interviewer: " + interviewerName + "<br>" +
            "Position Applied For: " + positionAppliedFor + "<br>" +
            "Practice: " + practice + "<br>" +
            "Interview Date: " + interviewDate + "<br>" +
            "Thank you" + "<br>" +
            "Note: This is an automated message - please do not reply.";
    }

    sendEmail(from, to, cc, body, subject);
});



   $("#successbtn").click(() =>{
        // Navigate to the home page
        window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/Home.aspx";
    });
      
  //Back to home page
  $("#cancel-btn").click(()=>{
     window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/Home.aspx";
  })
    
    
   //Back to home page
  $("#close-btn").click(()=>{
     window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/Home.aspx";
  })
 





