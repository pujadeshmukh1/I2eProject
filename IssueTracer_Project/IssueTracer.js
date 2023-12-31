
 
    
    //create a table for show the data
    const grid = {
        columns: [
            { dataField: 'IssueTitle', caption: 'Issue Title' },
            { dataField: 'IssueDescription', caption: 'Issue Description' },
            { dataField: 'Priority', caption: 'Priority' },
            { dataField: 'Status.Title', caption: 'Status' },
            { dataField: 'AssignedTo.Title', caption: 'Assigned To Developer ' },
            { dataField: 'AssignedToTester.Title', caption: 'Assigned To Tester ' },
            { dataField: 'DateReported', caption: 'Date Reported' },
            { dataField: 'ReportedBy.Title', caption: 'ReportedBy' },
            { dataField: 'Issuesource', caption: 'Issue source' },
            { dataField: 'Revert', caption: 'Revert' },
             { dataField: 'FinalRespond', caption: 'FinalRespond' },
            
            
            {
            
                cellTemplate: function(container, options) {
                  $('<button>')
                    .addClass('btn btn-sm btn-primary editbtn')
                    
                    .text('Edit')
                    .attr('type','button')
                    .on('click', function() {
                        // clearPopulatedFeilds();
                        console.log("ID :"+options.row.data.Id);
                        var recordId=
                        editUser(options.row.data.Id);
                         getIssueAttachment(options.row.data.Id);
                         
                        updateLogTable(options.row.data.Id);
                         clearForm();
                        
                    })
                    .appendTo(container);
                }
            },
            {
                dataField: 'delete',
                caption: 'Delete',
                cellTemplate: function(container, options) {
                  $('<button>')
                    .addClass('btn btn-sm btn-danger delete-btn')
                    .text('Delete')
                    .attr('type','button')
                    .on('click', function() {
                        var recordId = options.row.data.ID; 
                        deleteRecord(recordId);
                    })
                    .appendTo(container);
                }
            },
            
  

        ],
        dataSource: null, // Provide the array of objects
  
        showBorders: true, // Add border lines to the grid
        columnAutoWidth: true, // Automatically adjust column widths
        allowColumnReordering: true,
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        columnChooser: {
      enabled: true,
    },
        headerFilter: {
            visible: true
        },
        
    };




    const gridContainer = document.getElementById("gridContainer");
    const dataGrid = new DevExpress.ui.dxDataGrid(gridContainer, grid);

    const updateGridDataSource = (data) => {
      dataGrid.option("dataSource", data);
    };


//Add User Button will popup Modal where we can fill input feilds and send it to list
$('#add-user-btn').click(() => {
  $('#submit-btn').show();
  $('#update-btn').hide();
  $('#documentTable').empty();
  $('#tableForDocuments').hide();
  $('#tableForVersions').hide();
  clearInputFeilds()
  $('#modal-title').html("Create New Issue");
      $('#exampleModal').modal('show');
 
  $("#revertEmail").show();
});



 function clearInputFeilds() {
    // Clear the text input fields
    $('#IssueTitle').val('');
    $('#IssueDescription').val('');
    $('#Priority').val('');
    $('#status').val('');
    $('#DateReported').val('');
    $("#issuesource").val('');
    $("#issueFileInput").val('');
   
     $("#tableForVersions").val('');
    // Clear the People Picker fields
    clearPeoplePicker("peoplepicker"); // Assigned To Developer
    clearPeoplePicker("tester"); // Assigned To Tester
    clearPeoplePicker("reportedBy"); // Reported By

    // Clear the checkboxes
    $('#revertEmails').prop('checked', false);
    $('#finalResponses').prop('checked', false);
    $('#revertEmails').prop('disabled', false);  
    // Optionally, you can hide the checkboxes if needed
    $('#revertEmail').hide();
    $('#finalResponse').hide();
}



// Function to validate the form fields
const validateForm = () =>{
  const issueTitle = $('#IssueTitle').val();
  const issueDescription = $('#IssueDescription').val();
  const priority = $('#Priority').val();
  const status = $('#status').val();
  const assignedToDeveloper = $('#peoplepicker').text().trim();
  const assignedToTester = $('#tester').text().trim();
  const dateReported = $('#DateReported').val();
  const issueFileInput= $('#issueFileInput').val();
 // Reset any previous error messages
  $(".invalid-feedback").remove();

  var isValid = true;
 
  if (issueTitle === '') {
     $('#IssueTitle').addClass("is-invalid");
      $('#IssueTitle').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#IssueTitle').removeClass("is-invalid"); 
  } 

  if (issueDescription === '') {
     $('#IssueDescription').addClass("is-invalid");
      $('#IssueDescription').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#IssueDescription').removeClass("is-invalid"); 
  }

  if (priority === '') {
     $('#Priority').addClass("is-invalid");
      $('#Priority').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#Priority').removeClass("is-invalid"); 
  }

  if (status === '') {
     $('#status').addClass("is-invalid");
      $('#status').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#status').removeClass("is-invalid"); 
  }

  
    const developer = getUserInfo("peoplepicker");
    if (developer === '') {
      isValid = false;
      $("#peoplepicker_TopSpan").addClass("is-invalid");
       $("#peoplepicker_TopSpan").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#peoplepicker_TopSpan").removeClass("is-invalid");
    }

    const tester = getUserInfo("tester");
    if (tester === '') {
      isValid = false;
      $("#tester_TopSpan").addClass("is-invalid");
       $("#tester_TopSpan").after('<div class="invalid-feedback">This field is required.</div>');
    } else {
      $("#tester_TopSpan").removeClass("is-invalid");
    }

  if (dateReported === '') {
   $('#DateReported').addClass("is-invalid");
      $('#DateReported').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#DateReported').removeClass("is-invalid"); 
  }


if (issueFileInput === '') {
   $('#issueFileInput').addClass("is-invalid");
      $('#issueFileInput').after('<div class="invalid-feedback">This field is required.</div>');
    isValid = false;
  }
  else{
      $('#issueFileInput').removeClass("is-invalid"); 
  }
  // If all fields are valid return true
 return isValid;
}



// Function to populate status 
const getstatus = async () => {
    const statusDropdown = $('#status');

    try {
        // Clear any existing options
        statusDropdown.empty();

        const apiUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueStatus1')/items?$select=ID,Title`;

        const response = await $.ajax({
            url: apiUrl,
            type: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        });

        const statusSelect = statusDropdown;
        const results = response.d.results;

        if (results.length > 0) {
            //  default "Select status" 
            statusSelect.append($('<option>').text('Select status').val(''));

           
            results.forEach(function (item) {
                const stateID = item.ID;
                const stateName = item.Title;
                statusSelect.append($('<option>').val(stateID).text(stateName).data('value', item.Title));
            });
        } else {
            
            console.log('No status items found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


getstatus();

// Function to populate status for ghaph 
// const getstatus1 = async () => {
//     const statusDropdown = $('#status1');

//     try {
//         // Clear any existing options
//         statusDropdown.empty();

//         const apiUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueStatus1')/items?$select=ID,Title`;

//         const response = await $.ajax({
//             url: apiUrl,
//             type: 'GET',
//             headers: {
//                 'Accept': 'application/json;odata=verbose'
//             }
//         });

//         const statusSelect = statusDropdown;
//         const results = response.d.results;

//         if (results.length > 0) {
//             //  default "Select status" 
//             statusSelect.append($('<option>').text('Select status').val(''));

           
//             results.forEach(function (item) {
//                 const stateID = item.ID;
//                 const stateName = item.Title;
//                 statusSelect.append($('<option>').val(stateID).text(stateName).data('value', item.Title));
//             });
//         } else {
            
//             console.log('No status items found.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// };


// getstatus1();


// Function to populate priority dropdown using async/await
const populatePriorityDropdown = async () => {
    const prioritySelect = $('#Priority');
    
    // Clear any existing options
    prioritySelect.empty();

    const apiUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('priority')/items?$select=ID,Title`;

    try {
        // Send GET request to SharePoint REST API using async/await
        const response = await $.ajax({
            url: apiUrl,
            type: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        });

     
        const results = response.d.results;

        if (results.length > 0) {
          
            prioritySelect.append($('<option>').text('Select priority').val(''));
                
           results.forEach(function (item) {
                const priorityName = item.Title;
                prioritySelect.append($('<option>').val(priorityName).text(priorityName));
            });
        } else {
           
            console.log('No priority items found.');
        }
    } catch (error) {
        console.error('Error:', JSON.stringify(error));
    }
};

populatePriorityDropdown();


// Function to initialize a SharePoint People Picker control with specified properties.
function initializePeoplePicker(peoplePickerElementId, allowMultipleValues, PeopleorGroup, GroupID) {  
        // Create a schema to store picker properties, and set the properties.  
        var schema = {};  
        schema['SearchPrincipalSource'] = 15;  
        schema['ResolvePrincipalSource'] = 15;  
        schema['MaximumEntitySuggestions'] = 50;  
        schema['Width'] = '250px';  
        schema['AllowMultipleValues'] = allowMultipleValues;  
        if (PeopleorGroup == 'PeopleOnly') schema['PrincipalAccountType'] = 'User';  
        else schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';  
        if (GroupID > 0) {  
            schema['SharePointGroupID'] = GroupID  
        }  
      this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);  
    }  
    initializePeoplePicker("peoplepicker",true,'PeopleOnly',0);


  function getUserInfo(PeoplepickerId) {
  var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];
  console.log(peoplePicker);
  if (!peoplePicker.IsEmpty()) {
    if (peoplePicker.HasInputError) return false;
    else if (!peoplePicker.HasResolvedUsers()) return false;
    else if (peoplePicker.TotalUserCount > 0) {
      var users = peoplePicker.GetAllUserInfo();
      console.log(users);
      var UsersID = ''; // Declare UsersID here
      for (var i = 0; i < users.length; i++) {
        UsersID += GetUserID(users[i].Key);
      }
      return UsersID; // Return UsersID here
    }
  } else {
    // Handle the case when the people picker is empty
    return '';
  }
}


// Get the user ID.  
function GetUserID(logonName) {  
    var item = {  
        'logonName': logonName  
    };  
    var UserId = $.ajax({  
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/ensureuser",  
        type: "POST",  
        async: false,  
        contentType: "application/json;odata=verbose",  
        data: JSON.stringify(item),  
        headers: {  
            "Accept": "application/json;odata=verbose",  
            "X-RequestDigest": $("#__REQUESTDIGEST").val()  
        },  
        success: function(data) {  
          console.log("Users",data);
            return data.Id;  
        },  
        error: function(data) {  
            failure(data);  
        }  
    });  
    return UserId.responseJSON.d.Id;  
}   

function initializePeoplePickerWithUserID(peoplePickerId, userName) {
  var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId + "_TopSpan"];
  if (peoplePicker) {
    peoplePicker.DeleteProcessedUser();
    peoplePicker.AddUserKeys(userName, false);
  }
}

function clearPeoplePicker(peoplePickerId) {
  var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerId + "_TopSpan"];
  if (peoplePicker) {
    if (peoplePicker.HasResolvedUsers()) {
      peoplePicker.DeleteProcessedUser();
    
      peoplePicker.ClearServerError();
    }
  }
}


initializePeoplePicker("tester",true,'PeopleOnly',0);


function getUserIdByTitle(userTitle) {
  var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers?$filter=Title eq '" + userTitle + "'";
  var userId = null;

  // Send GET request to SharePoint REST API
  $.ajax({
    url: url,
    type: "GET",
    async: false, // Make the request synchronous
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function(data) {
      if (data.d.results.length > 0) {
        userId = data.d.results[0].Id;
      }
    },
    error: function(error) {
      console.log("Error retrieving user ID: " + JSON.stringify(error));
    }
  });

  return userId;
}
   
  initializePeoplePicker('peoplepicker', true, 'PeopleOnly', 0); 
   // Initialize the People Picker control for "reportedBy."
initializePeoplePicker("reportedBy", true, 'PeopleOnly', 0);
  


$(document).ready(function () {
  $("#tester_TopSpan").addClass("form-control");
  $("#peoplepicker_TopSpan").addClass("form-control");
  $("#reportedBy_TopSpan").addClass("form-control");
  $("#emailMeeting_TopSpan").addClass("form-control");

  // $("#peoplepicker_TopSpan_InitialHelpText").css("padding-top", "5px");
  // $("#tester_TopSpan_InitialHelpText").css("padding-top", "5px");

  // Function to fetch user groups and determine permissions.
  getUserGroups();
});



//retrieveUsers function to fetch data
const retrieveUsers = async () => {
  try {
    const listUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueTracker')/items?$select=Id,IssueTitle,IssueDescription,Priority,Status/Title,AssignedTo/Title,AssignedToTester/Title,DateReported,Issuesource,ReportedBy/Title,Revert,FinalRespond&$expand=Status,AssignedTo,AssignedToTester,ReportedBy`;

    const response = await fetch(listUrl, {
      headers: {
        Accept: 'application/json;odata=verbose',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.d.results;

    console.log(items);
    // Calculate percentages and create the chart
    //calculateCountAndCreateChart(items);
    calculateCountAndCreateStackedBarChart(items);
    calculateCountAndCreateChartpia(items);
    updateGridDataSource(items);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

retrieveUsers();



const createIssue = async () => {
  const dateReported = $('#DateReported').val();
  const formattedDate = formatDate(dateReported);

  const statusId = parseInt($('#status').val()); // Convert the value to an integer
 

  const itemData = {
    '__metadata': { 'type': 'SP.Data.IssueTrackerListItem' },
    'IssueTitle': $('#IssueTitle').val(),
    'IssueDescription': $('#IssueDescription').val(),
    'Priority': $('#Priority').val(),
    'StatusId': statusId, // Assign the integer value
    'AssignedToId': getUserInfo("peoplepicker"),
    'AssignedToTesterId': getUserInfo("tester"),
    'DateReported': formattedDate,
    'ReportedById':getUserInfo("reportedBy"),
    'Issuesource':$('#issuesource').val(),
    'Revert':$('#revertEmail').prop('checked')
  };

  const requestHeaders = {
    'Accept': 'application/json;odata=verbose',
    'Content-Type': 'application/json;odata=verbose',
    'X-RequestDigest': $('#__REQUESTDIGEST').val()
  };

  try {
    const data = await $.ajax({
      url: `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueTracker')/items`,
      type: "POST",
      headers: requestHeaders,
      data: JSON.stringify(itemData),
    });

    console.log("Issue created successfully");
   
    retrieveUsers();
    const listId = data.d.Id;
    uploadFilesToLibrary(listId);
  } catch (error) {
    console.log("Error creating issue: " + JSON.stringify(error));
  }
};

// Define a global variable to store the original stackedBarData
let originalStackedBarData;

// Add this code block to calculate counts and create the stacked bar chart based on year
const calculateCountAndCreateStackedBarChart = (listData, statusFilter) => {
  // Define the statuses you want to track

  const statusesToTrack = ['In progress', 'Resolved', 'Completed'];

  // Calculate counts for each status and year
  const statusCountsByYear = {};

  listData.forEach((item) => {
    const status = item.Status.Title; // Assuming the status is in the 'Title' property
    const dateReported = item.DateReported; // Assuming the date is in 'dd/mm/yy' format

    // Parse the date and extract the year
    const year = new Date(dateReported).getFullYear();

    if (!statusCountsByYear[year]) {
      statusCountsByYear[year] = {};
    }

    if (statusCountsByYear[year][status]) {
      statusCountsByYear[year][status]++;
    } else {
      statusCountsByYear[year][status] = 1;
    }
  });

listData.forEach((item) => {
      const status = item.Status.Title; // Assuming the status is in the 'Title' property
  
      // Apply the status filter if provided
      if (statusFilter === 'All' || status === statusFilter) {
        const dateReported = item.DateReported; // Assuming the date is in 'dd/mm/yy' format
  
        // Parse the date and extract the year
        const year = new Date(dateReported).getFullYear();
  
        if (!statusCountsByYear[year]) {
          statusCountsByYear[year] = {};
        }
  
        if (statusCountsByYear[year][status]) {
          statusCountsByYear[year][status]++;
        } else {
          statusCountsByYear[year][status] = 1;
        }
      }
    });


  originalStackedBarData = Object.keys(statusCountsByYear).map((year) => ({
    year: year,
    ...statusCountsByYear[year],
  }));

  // Create dxChart using DevExtreme with stacked bar series
  $('#chart1').dxChart({
    palette: 'violet',
    dataSource: originalStackedBarData,
    legend: {
      visible: true,
    },
    series: statusesToTrack.map((status) => ({
      argumentField: 'year',
      valueField: status,
      name: status,
      type: 'stackedBar',
    })),
    title: 'Issue Status Stacked Bar Chart (Yearly)',
    tooltip: {
      enabled: true,
      format: {
        type: 'fixedPoint',
        precision: 0, // Display counts without decimal places in tooltips
      },
      customizeTooltip: function (arg) {
        return {
          text: `${arg.seriesName} - Count: ${arg.value} - Year:${arg.argument}`,
        };
      },
    },
  });
};


    

  $('#statusFilter').select2({
    placeholder: 'Select statuses...', // Customize your placeholder text
  });

 // Function to update the chart based on selected statuses
function updateChart(selectedStatuses) {
  const statusesToTrack = ['In progress', 'Resolved', 'Completed'];

  // Filter the data based on the selected statuses or show all data for "All"
  let filteredData;

  if (selectedStatuses.includes('All') || selectedStatuses.length > 1) {
    // Use stackedBar type when "All" is selected or multiple statuses are selected
    filteredData = originalStackedBarData;
  } else {
    // Use bar type for individual statuses when a single status is selected
    const selectedStatus = selectedStatuses[0];
    filteredData = originalStackedBarData.map((item) => ({
      year: item.year,
      [selectedStatus]: item[selectedStatus],
    }));
  }

  // Create the chart
  $('#chart1').dxChart({
    palette: 'violet',
    dataSource: filteredData,
    legend: {
      visible: true,
    },
    series:  selectedStatuses.includes('All') || selectedStatuses.length > 2 ?
       statusesToTrack.map((status) => ({
    // selectedStatuses.includes('All') ?
    //   statusesToTrack.map((status) => ({
    //        selectedStatuses.includes('All') || selectedStatuses.length > 1 ?
    //   statusesToTrack.map((status) => ({
        argumentField: 'year',
        valueField: status,
        name: status,
        type: 'stackedBar',
      })) :
      selectedStatuses.map((status) => ({
        argumentField: 'year',
        valueField: status,
        name: status,
        type: 'bar', // Use 'bar' type for individual statuses
      })),
    title: selectedStatuses.includes('All') ?
      'Issue Status Stacked Bar Chart (Yearly)' :
      `Issue Status Bar Chart for ${selectedStatuses.join(', ')}`,
    tooltip: {
      enabled: true,
      format: {
        type: 'fixedPoint',
        precision: 0,
      },
      customizeTooltip: function (arg) {
        return {
          text: `${arg.seriesName} - Count: ${arg.value} - Year:${arg.argument}`,
        };
      },
    },
  });
}

// Add an event listener to the status dropdown
$('#statusFilter').change(() => {
  const selectedStatuses = $('#statusFilter').val() || []; // Ensure selectedStatuses is an array
  updateChart(selectedStatuses);
});




// Add an event listener to the status dropdown
// const statusFilterDropdown = document.getElementById('statusFilter');
// statusFilterDropdown.addEventListener('change', () => {
//   const selectedStatus = statusFilterDropdown.value;
//  const statusesToTrack = ['In progress', 'Resolved', 'Completed'];
//   // Filter the data based on the selected status or show all data for "All"
//   const filteredData = selectedStatus === 'All' ?
//     originalStackedBarData :
//     originalStackedBarData.filter((item) => item[selectedStatus] > 0);

//   // Create the chart
//   $('#chart1').dxChart({
//     palette: 'violet',
//     dataSource: filteredData,
//     legend: {
//       visible: true,
//     },
//     series: selectedStatus === 'All' ?
//       statusesToTrack.map((status) => ({
//         argumentField: 'year',
//         valueField: status,
//         name: status,
//         type: 'stackedBar',
//       })) :
//       [
//         {
//           argumentField: 'year',
//           valueField: selectedStatus,
//           name: selectedStatus,
//           type: 'bar', // Use 'bar' type for individual statuses
//         },
//       ],
//     title: selectedStatus === 'All' ?
//       'Issue Status Stacked Bar Chart (Yearly)' :
//       `Issue Status Bar Chart for ${selectedStatus}`,
//     tooltip: {
//       enabled: true,
//       format: {
//         type: 'fixedPoint',
//         precision: 0,
//       },
//       customizeTooltip: function (arg) {
//         return {
//           text: `${arg.seriesName} - Count: ${arg.value} - Year:${arg.argument}`,
//         };
//       },
//     },
//   });
// });

  $('#yearFilter').select2({
    placeholder: 'Select Years...', // Customize your placeholder text
  });

// Function to update the year filter chart based on selected years
function updateYearFilterChart(selectedYears) {
  const statusesToTrack = ['In progress', 'Resolved', 'Completed'];

  // Filter the data based on the selected years or show all data for "All"
  let filteredData;

  if (selectedYears.includes('All') || selectedYears.length > 1) {
    // Use stackedBar type when "All" is selected or multiple years are selected
    filteredData = originalStackedBarData.filter((item) =>
      selectedYears.includes(item.year)
    );
  } else {
    // Use bar type for individual years when a single year is selected
    const selectedYear = selectedYears[0];
    filteredData = originalStackedBarData.filter((item) => item.year === selectedYear);
  }

  // Create the chart
  $('#chart1').dxChart({
    palette: 'violet',
    dataSource: filteredData,
    legend: {
      visible: true,
    },
    series: selectedYears.includes('All') || selectedYears.length >0 ?
      statusesToTrack.map((status) => ({
        argumentField: 'year',
        valueField: status,
        name: status,
        type: 'stackedBar',
      })) :
      statusesToTrack.map((status) => ({
        argumentField: 'year',
        valueField: status,
        name: status,
        type: 'bar', // Use 'bar' type for individual years
      })),
    title: selectedYears.includes('All') || selectedYears.length > 1 ?
      'Issue Status Stacked Bar Chart (Yearly)' :
      `Issue Status Bar Chart for ${selectedYears.join(', ')}`,
    tooltip: {
      enabled: true,
      format: {
        type: 'fixedPoint',
        precision: 0,
      },
      customizeTooltip: function (arg) {
        return {
          text: `${arg.seriesName} - Count: ${arg.value} - Year:${arg.argument}`,
        };
      },
    },
  });
}

// Add an event listener to the year filter dropdown
$('#yearFilter').change(() => {
  const selectedYears = $('#yearFilter').val() || []; // Ensure selectedYears is an array
  updateYearFilterChart(selectedYears);
});



// // Add an event listener to the year dropdown
// const yearFilterDropdown = document.getElementById('yearFilter');
// yearFilterDropdown.addEventListener('change', () => {
//   const selectedYear = yearFilterDropdown.value;

//   // Filter the data based on the selected year
//   const filteredData = originalStackedBarData.filter((item) => {
//     return selectedYear === 'All' || item.year.toString() === selectedYear;
//   });

//   // Update the chart data source
//   $('#chart1').dxChart('instance').option('dataSource', filteredData);
// });





const calculateCountAndCreateChartpia = (listData) => {
  // Define the statuses you want to track
  const statusesToTrack = ['In progress', 'Resolved', 'Completed'];

  // Calculate counts for each status
  const statusCounts = {};
  listData.forEach((item) => {
    const status = item.Status.Title; // Assuming the status is in the 'Title' property
    if (statusCounts[status]) {
      statusCounts[status]++;
    } else {
      statusCounts[status] = 1;
    }
  });

  // Initialize counts for statuses that are not present
  statusesToTrack.forEach((status) => {
    if (!statusCounts[status]) {
      statusCounts[status] = 0;
    }
  });

  // Calculate total issue count
  const totalCount = listData.length;

  // Create data array with counts instead of percentages
  const dataWithCounts = statusesToTrack.map((status) => ({
    status: status,
    count: statusCounts[status],
  }));

  // Create dxPieChart using DevExtreme with counts as the valueField
  $('#chart').dxPieChart({
    palette: 'violet',
    dataSource: dataWithCounts, // Use data with counts
    legend: {
      visible: true,
    },
    series: [
      {
        argumentField: 'status',
        valueField: 'count', // Use count as the value field
        type: 'doughnut',
        label: {
          visible: true,
          format: {
            type: 'fixedPoint',
            precision: 0, // Display counts without decimal places
          },
          connector: {
            visible: true,
            width: 1,
          },
        },
      },
    ],
    tooltip: {
      enabled: true,
      format: {
        type: 'fixedPoint',
        precision: 0, // Display counts without decimal places in tooltips
      },
    },
    title: 'Issue Status Chart (Count)',
  });
};




const formatDate = (date) => {
  var d = new Date(date);
  var year = d.getFullYear();
  var month = ("0" + (d.getMonth() + 1)).slice(-2);
  var day = ("0" + d.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
}

  const  clearForm = () => {
    // Clear the form fields
    $('#IssueTitle').val('');
    $('#IssueDescription').val('');
    $('#Priority').val('');
    $('#Status').val('');
    clearPeoplePicker("peoplepicker");
    clearPeoplePicker("tester");
    $('#DateReported').val('');

  }
// Event listener for the submit button
$('#submit-btn').click( () => {
  if (validateForm()) {
     createIssue();
      $('#exampleModal').modal('hide');
     clearForm();
  }
});

//multiple document uploading

    const uploadFilesToLibrary = (listId) => {
      var fileInput = document.getElementById("issueFileInput");
      var files = fileInput.files;

      for (var i = 0; i < files.length; i++) {
        uploadFile(files[i], listId);
      }
    }

    const uploadFile = (file, listId) =>{
      var reader = new FileReader();

      reader.onload = function (event) {
        var fileContent = event.target.result;
        var fileName = file.name;

        uploadFileToLibrary(fileContent, fileName, listId);
      };

      reader.readAsArrayBuffer(file);
    }

//function uploade document in document library
const uploadFileToLibrary = async (fileContent, fileName, listId) => {
  const libraryName = "Doc";
  const encodedLibraryName = encodeURIComponent(libraryName);
  const endpointUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${encodedLibraryName}')/RootFolder/Files/Add(url='${fileName}', overwrite=false)`;

  try {
    const fileData = await $.ajax({
      url: endpointUrl,
      type: "POST",
      data: fileContent,
      processData: false,
      headers: {
        "Accept": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "Content-Type": "application/octet-stream",
      }
    });

    console.log("File ID", fileData);
    console.log("File uploaded successfully:", fileData.d.ServerRelativeUrl);
    const fileUrl = fileData.d.ServerRelativeUrl;

    const itemPropertiesUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetFileByServerRelativeUrl('${fileUrl}')/ListItemAllFields?$select=Id`;

    const itemData = await $.ajax({
      url: itemPropertiesUrl,
      type: "GET",
      headers: {
        "Accept": "application/json;odata=verbose",
      }
    });

    console.log(itemData);
    updateIssueAttachmentLookup(itemData.d.ID, listId);
  } catch (error) {
    console.log("Error uploading file:", error);
  }
};



//  Function for Delete item in list
const deleteRecord = async (recordId) => {
  const confirmDelete = confirm("Are you sure you want to delete this record?");

  if (confirmDelete) {
    const deleteUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueTracker')/items(${recordId})`;

    try {
      await $.ajax({
        url: deleteUrl,
        type: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE"
        },
      });

      console.log("Record deleted successfully");
      retrieveUsers(); // Refresh the grid or perform any necessary action
    } catch (error) {
      console.log("Error deleting record: " + JSON.stringify(error));
    }
  }
};

// delete function for document library
function deleteDocumentByIdd(documentId) {
  var encodedLibraryName = encodeURIComponent("Doc");
  var endpointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + encodedLibraryName + "')/items(" + documentId + ")";

  $.ajax({
    url: endpointUrl,
    type: "POST",
    headers: {
      "Accept": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "DELETE",
      "If-Match": "*"
    },
    success: function(data) {
      console.log(documentId);
      console.log("Document deleted successfully");
      $('#documentTable tr').each(function() {
        var rowFileId = $(this).find('button').attr('onclick').match(/\d+/)[0];
        if (rowFileId === documentId) {
          $(this).remove();
          return false; // Exit the loop once the row is removed
        }
      });
    },
    error: function(error) {
      console.log("Error deleting document:", error);
    }
  });
}






const editUser = async (userId) => {
  let displayName;
   $("#submit-btn").hide();
   
          
  const endpointUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/currentUser`;

  try {
    const userData = await $.ajax({
      url: endpointUrl,
      type: "GET",
      async: false,
      headers: {
        "Accept": "application/json;odata=verbose"
      }
    });
    
    const currentUser = userData.d;
    displayName = currentUser.Title;
    console.log(`Current user display name: ${displayName}`);
  } catch (error) {
    console.error(`Error fetching current user details: ${JSON.stringify(error)}`);
    return; // Exit the function if an error occurs.
  }

  // Show/hide elements and set up the modal here...
  $('#tableForDocuments').show();
  $('#documentTable').empty();
  $('#modal-title').html("Edit Issue Details");
$('#exampleModal').modal({ backdrop: 'static', keyword: false });
  const previousValues = {};

  const getUserUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueTracker')/items(${userId})?$select=IssueTitle,IssueDescription,Priority,Status/ID,Status/Title,AssignedTo/ID,AssignedTo/Title,AssignedToTester/Title,ReportedBy/Title,DateReported,Revert,FinalRespond,Issuesource&$expand=Status,AssignedTo,AssignedToTester,ReportedBy`;

  try {
    const userData = await $.ajax({
      url: getUserUrl,
      type: "GET",
      async: true,
      headers: {
        "Accept": "application/json;odata=verbose"
      }
    });

    const item = userData.d;
    console.log("item",item);
    // Populate form fields with user data...
    // Initialize people picker fields...
    $('#IssueTitle').val(item.IssueTitle);
    $('#IssueDescription').val(item.IssueDescription);
    $('#Priority').val(item.Priority);
    $("#status").val(item.Status.ID);
    $('#DateReported').val(formatDate(item.DateReported));
    $("#issuesource").val(item.Issuesource);
    // Initialize people picker fields with user data.
    initializePeoplePickerWithUserID("peoplepicker", item.AssignedTo.Title);
    initializePeoplePickerWithUserID("tester", item.AssignedToTester.Title);
    initializePeoplePickerWithUserID("reportedBy", item.ReportedBy.Title);
    previousValues['status'] = item.Status.Title;
   // statusAccess(item.AssignedTo.Title, item.AssignedToTester.Title, displayName);
    $('#exampleModal').modal('show');
 $('#tableForVersions').show();
      $('#documentTable').empty();
 // Check the "revertEmail" checkbox based on the data
    if (item.Revert) {
      $('#revertEmails').prop('checked', true);
    } else {
      $('#revertEmails').prop('checked', false);
    }

    // Check the "finalResponse" checkbox based on the data
    if (item.FinalRespond) {
      $('#finalResponses').prop('checked', true);
    } else {
      $('#finalResponses').prop('checked', false);
    }

    // Update the checkbox states based on the item's status
    updateCheckboxState(item);   
               
  } catch (error) {
    console.error(`Error fetching user data: ${JSON.stringify(error)}`);
    return; // Exit the function if an error occurs.
  }

  $("#update-btn").show().off("click").on("click", () => {
    $('#exampleModal').modal('hide');
   
    updateUser(userId);
      saveChangesInLog(displayName, previousValues, userId);
   
  });
};

function updateCheckboxState(item) {
  var isRevertEmailChecked = $('#revertEmails').prop('checked');
  var isFinalResponseChecked = $('#finalResponses').prop('checked');
 
  if (item.Status.Title === 'In progress' || item.Status.Title === 'Resolved' || item.Status.Title === 'Move To Test') {
    if (isRevertEmailChecked) {
      // Disable revertEmail, enable finalResponse, and hide revertEmails
      $('#revertEmail').show();
      $('#revertEmails').prop('disabled', true).show();
      $('#finalResponse').hide();
    } else if (!isRevertEmailChecked) {
      // Enable revertEmail, disable finalResponse, and show both
     $('#revertEmails').prop('disabled', false).show();
      $('#finalResponse').hide();
      $('#revertEmail').show();
      // $('#finalResponse').hide();
    }
  } else if (item.Status.Title === 'Completed') {
    if (isFinalResponseChecked ) {
      // Disable both checkboxes9
      $('#revertEmail').show();
      $('#revertEmails').prop('disabled', true).show();
     
       $('#finalResponse').show();
      $('#finalResponses').prop('disabled', true).show();
     
    }
    
    else if (isRevertEmailChecked) {
      $('#finalResponse').show();
      $('#revertEmail').show();
      $('#revertEmails').prop('disabled', true).show();
     
      //$('#finalResponses').prop('disabled', false).show();
    } 
    else {
      // Enable revertEmail, disable finalResponse, and show both
      $('#revertEmails').prop('disabled', true).show();
      $('#finalResponses').prop('disabled', false).show();
      $('#revertEmail').show();
      $('#finalResponse').show();
    }
  } 
  // else {
  //   // Show both checkboxes and enable them
  //   $('#revertEmail').prop('disabled', false).show();
  //   $('#finalResponse').prop('disabled', false).show();
  //   $('#revertEmails').show();
  //   $('#finalResponses').show();
  // }
}


// Add an event listener to the status field
$('#status').change(function() {
        const selectedStatus =$(this).val();


  // Check if the selected status is 'Completed'
  if (selectedStatus === '4') {
    // Enable and show the finalResponse checkbox
     $('#finalResponse').show();
    $('#finalResponses').prop('disabled', false).show();
     $('#revertEmails').prop('disabled', true).show();
  } else {
    // Disable and hide the finalResponse checkbox
    $('#finalResponses').prop('disabled', true).hide();
  }
  });



// Function to update user details
const updateUser = async (userId) => {
  const updateUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('IssueTracker')/items(${userId})`;
  const itemData = {
    '__metadata': { 'type': 'SP.Data.IssueTrackerListItem' },
    'IssueTitle': $('#IssueTitle').val(),
    'IssueDescription': $('#IssueDescription').val(),
    'Priority': $('#Priority').val(),
    'StatusId': parseInt($('#status').val()),
    'AssignedToId': getUserInfo("peoplepicker"), // Assign the user ID
    'AssignedToTesterId': getUserInfo("tester"),
      "ReportedById":getUserInfo("reportedBy"), 
    'DateReported': $('#DateReported').val(),
      'Revert': $('#revertEmails').prop('checked'),
      'FinalRespond':$('#finalResponses').prop('checked') 
  };

  const requestHeaders = {
    'Accept': 'application/json;odata=verbose',
    'Content-Type': 'application/json;odata=verbose',
    'X-RequestDigest': $('#__REQUESTDIGEST').val(),
    'IF-MATCH': '*',
    'X-HTTP-Method': 'MERGE'
  };

  try {
    const response = await $.ajax({
      url: updateUrl,
      type: "POST",
      headers: requestHeaders,
      data: JSON.stringify(itemData)
    });

    console.log("Issue updated successfully");
    //$('#exampleModal').modal('hide');
    retrieveUsers();
  } catch (error) {
    console.log(`Error updating issue: ${JSON.stringify(error)}`);
  }
};

function saveChangesInLog(displayName,previousValues,userId){
var currentDate = new Date().toISOString();
   
    console.log(previousValues);

   console.log(userId);

   var selectedStatus = $('#status option:selected').text(); // Get the selected status value
  var newValues = {
    status: selectedStatus
  };
   var playLoad ={
      "__metadata": { type: "SP.Data.StatusLogHistoryListItem"},
      "Title":userId.toString(),
      "ModifiedBy":displayName,
      "IssueTrackerIdId":userId,
      "ModifiedDate" :currentDate
   };

   console.log("Length",playLoad);

   if(previousValues.status !== newValues.status){
    
     //playLoad["Modifications"]="Previous status '"+previousValues.status+"' changed to '"+newValues.status+"'";
     playLoad["PreviousStatus"] = previousValues.status;
     playLoad["NewStatus"] = newValues.status;

    var endpointUrl = _spPageContextInfo.webAbsoluteUrl+ "/_api/web/lists/getbytitle('StatusLogHistory')/items";

 $.ajax({
                url: endpointUrl,
                type: "POST",
                data: JSON.stringify(playLoad),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val() // Ensure you have the request digest value available on the page
                },
                success: function (data) {
                    console.log("Log Updated");
                    console.log(data.d.Id);
                    
                   
                },
                error: function (error) {
                console.log(JSON.stringify(error));
                }
            });
   }
}

function updateLogTable(userId) {
  var endpointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('StatusLogHistory')/items?$filter=IssueTrackerIdId eq '"+userId+"'";

  $.ajax({
    url: endpointUrl,
    type: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      // Process the response data and display it in the "results" div
      $('#logTable').empty();
     var items = data.d.results;
            // Sort the items in descending order by their Modifications value
           
       items.forEach(function(item) {
        //console.log(item.Modifications);
        var row = "<tr><td>"+item.PreviousStatus+"</td><td>"+item.NewStatus+"</td><td>"+item.ModifiedBy+"</td><td>"+item.ModifiedDate+"</td></tr>";
        $('#logTable').append(row);
      });

    },
    error: function (error) {
      console.log("An error occurred: " + JSON.stringify(error));
    }
  });
}



function updateIssueAttachmentLookup(documentId, listId) {
      var endpointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Doc')/items(" + documentId + ")";

      // Prepare the payload for the update request
      var itemPayload = {
        "__metadata": { "type": "SP.Data.DocItem" },
        "IssueTrackerIdId": listId,// Replace "FirstName" with the internal name of the lookup column

      };
    // Send the update request
      $.ajax({
        url: endpointUrl,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemPayload),
        headers: {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "X-HTTP-Method": "MERGE",
          "If-Match": "*"
        },
        success: function (data) {
          console.log(data);
          //alert("Success");
        },
        error: function (error) {
          console.log(error);
          //alert("Error");
        }
      });

    }

// Function to get documents associated with a specific item and display them in a table.
   function getIssueAttachment(listId) {
      var siteUrl = "https://i2ec.sharepoint.com/sites/InternsPractice";
      var libraryTitle = "Doc";

      // Construct the REST API endpoint URL
      var endpointUrl = siteUrl + "/_api/web/lists/getbytitle('" + libraryTitle + "')/items?$select=ID,File/Name,File/ServerRelativeUrl&$expand=File&$filter=IssueTrackerId/ID eq '" + listId + "'";

      // Send an AJAX request to retrieve the documents
      $.ajax({
        url: endpointUrl,
        type: "GET",
        headers: {
          "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
          console.log("Documets ", data);
          var documents = data.d.results;
          console.log("Other Type Documents");
          for (var i = 0; i < documents.length; i++) {
          var document = documents[i];
          var fileName = document.File.Name;
          var fileUrl = siteUrl + document.File.ServerRelativeUrl;
          var fileId = document.ID;
          var row = "<tr><td>"+fileName+"</td>"+"<td><button type='button' class='btn btn-danger' onclick=\"deleteDocumentByIdd('" + fileId + "'\">Delete</button></td></tr>";
          $('#documentTable').append(row);
          console.log("File Name: " + fileName);
          console.log("File URL: " + fileUrl);
          }
        },
        error: function (error) {
          console.log("An error occurred while fetching documents: " + JSON.stringify(error));
        }
      });
      }
    
    function deleteDocumentById(documentId) {
      var encodedLibraryName = encodeURIComponent("Doc");
      var endpointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + encodedLibraryName + "')/items(" + documentId + ")";

      $.ajax({
        url: endpointUrl,
        type: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "X-HTTP-Method": "DELETE",
          "If-Match": "*"
        },
        success: function (data) {
          console.log("Document deleted successfully");
          $('#documentTable tr').each(function () {
          
            var rowFileId = $(this).find('i.fa-trash').attr('onclick').match(/\d+/)[0];
            if (rowFileId === documentId) {
              $(this).closest('tr').remove();
              return false; // Exit the loop once the row is removed
            }
          });
        },
        error: function (error) {
          console.log("Error deleting document:", error);
        }
      });
    }
   
    // Function to disable or enable
    const disableControls = (disable) =>{
      const elementsToDisable = [
        '#IssueTitle',
        '#IssueDescription',
        '#Priority',
        '#peoplepicker',
        '#tester',
        '#DateReported',
      ];

      const opacityValue = disable ? '0.6' : '1';
      const pointerEventsValue = disable ? 'none' : 'auto';

      elementsToDisable.forEach((elementId) => {
        const element = $(elementId);
        element.prop('disabled', disable);
        element.css('opacity', opacityValue);
        element.css('pointer-events', pointerEventsValue);
      });

      // Additional custom handling for specific elements
      if (disable) {
        $('#documentTable').css('pointer-events', 'none');
        $('#documentTable').css('opacity', '0.6');
        
      // Add more custom handling if needed
      } else {
        $('#documentTable').css('pointer-events', 'auto');
        $('#documentTable').css('opacity', '1');
    
      }
    }

    // Function to control the access based on user roles for status col.
    const statusAccess = (developer,tester,currentUser) => {
      
      const issueCreatedUser = ''; 
      if(currentUser == issueCreatedUser){
        disableControls(false);
        $('#status').prop('disabled',false);
      }else{
        if(currentUser !== developer && currentUser !== tester){
            disableControls(true);
            $('#status').prop("disabled",true);

          }else{
            if (currentUser == developer) {
                console.log(currentUser + " == " + developer);
                
                disableControls(true);
                var statusSelected =$('#status').find(":selected").val();
                console.log(statusSelected);
                if(statusSelected ==='1'){
                  $('#status').prop("disabled", false);
                }else if(statusSelected === '2'){
                  $('#status').prop("disabled", false);
                }else{
                  $('#status').prop("disabled", true);
                }
                
            } else if (currentUser == tester) {
                console.log(currentUser + " == " + tester);
               
                disableControls(true);
                if ($('#status').find(":selected").val() == '3') {
                    $('#status').prop("disabled", false);
                }else if($('#status').find(":selected").val() == '4'){
                   $('#status').prop("disabled", false);
                }else {
                    $('#status').prop("disabled", true);
                }
            }
          }
      }
    }



    
 //function to asynchronously fetch user groups and determine user permissions.
 
//   const getUserGroups = async () => {
//   try {
//     const response = await fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/web/currentuser/?$expand=Groups", {
//       method: "GET",
//       headers: {
//         "Accept": "application/json;odata=verbose"
//       }
//     });
//     // Check if the response is successful; if not, throw an error.
//     if (!response.ok) {
//       throw new Error("Failed to fetch user groups");
//     }
//     const data = await response.json();
//     console.log(data);
//     const currentUser = data.d.Title;
//     const userGroups = data.d.Groups.results;
//     console.log(userGroups);
//     let admin = false;
//     let visitor = false;

//     for (const group of userGroups) {
//       if (group.Title === "Admin") {
//         admin = true;
//         //alert("User is Admin");
//       } else if (group.Title === "Visitors") {
//         visitor = true;
//         //alert("User is Visitor");
//       }
//     }

//     givePermissions(admin, visitor, currentUser);
//     console.log("Admin: " + admin + " Visitor: " + visitor);
//   } catch (error) {
//     // alert("Error occurred: " + error.message);
//   }
// };


// // function to handle user permissions based on roles.
// const givePermissions = (admin, visitor, currentUser) => {
//   if (admin) {
//     enableAdminPermissions(currentUser);
//   } else if (visitor) {
//     enableVisitorPermissions(currentUser);
//   } else {
//     alert("You are neither an admin nor a visitor.");
//   }
// };

// //  function to enable admin permissions.
// const enableAdminPermissions = (currentUser) => {
//   disableControls(false);
//   $('#add-user-btn').show();
//   dataGrid.columnOption(10, "visible", true);
//   hideEditButtons(false, currentUser);
// };

// //  function to enable visitor permissions.
// const enableVisitorPermissions = (currentUser) => {
//   $('#add-user-btn').hide();
//   hideEditButtons(true, currentUser);
// };

// //  function to hide or show edit buttons based on visitor permissions.
// const hideEditButtons = (isVisitor, currentUser) => {
//   const nameToSearch = currentUser; // Replace with the name you are searching for
//   const rows = dataGrid.getVisibleRows();

//   for (let i = 0; i < rows.length; i++) {
//     const rowData = rows[i].data;
//     const deleteButton = dataGrid.getRowElement(i).find(".delete-btn");
//     deleteButton.hide();

//     const editButton = dataGrid.getRowElement(i).find(".editbtn");
//     if (isVisitor && (nameToSearch == rowData.AssignedTo.Title || nameToSearch == rowData.AssignedToTester.Title)) {
//       editButton.show();
//     } else {
//       editButton.hide();
//     }
//   }
// };

  
// Add an event listener to the status dropdown
// $('#status').change(function () {
//     const selectedStatus = $(this).val();

//     // Check the selected status and update checkboxes accordingly
//     if (selectedStatus === 'In Progress' || selectedStatus === 'Resolved' || selectedStatus === 'Move to Test') {
//         // When the status is In Progress, Resolved, or Move to Test
//         $('#revertEmail').prop('disabled', false); // Enable the first checkbox
//         $('#finalResponse').prop('disabled', true); // Disable the second checkbox
//     } else if (selectedStatus === 'Complete') {
//         // When the status is Complete
//         $('#revertEmail').prop('disabled', true); // Disable the first checkbox
//         $('#finalResponse').prop('disabled', false); // Enable the second checkbox
//     } else {
//         // For other statuses, enable both checkboxes
//         $('#revertEmail').prop('disabled', false);
//         $('#finalResponse').prop('disabled', false);
//     }
// });

// Initially, check the selected status and set checkbox properties
// $(document).ready(function () {
//     const initialStatus = $('#status').val();
//     if (initialStatus === 'In Progress' || initialStatus === 'Resolved' || initialStatus === 'Move to Test') {
//         $('#revertEmail').prop('disabled', false);
//         $('#finalResponse').prop('disabled', true);
//     } else if (initialStatus === 'Complete') {
//         $('#revertEmail').prop('disabled', true);
//         $('#finalResponse').prop('disabled', false);
//     } else {
//         $('#revertEmail').prop('disabled', false);
//         $('#finalResponse').prop('disabled', false);
//     }
// });

