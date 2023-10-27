console.log("home")
/*$(document).ready(function(){
    getCandidatesData();

        
    })*/
    var grid = {
            columns: [
    {
      caption: 'Actions',
      cellTemplate: function (container, options) {
        $('<i>')
          .addClass('fa-solid fa-pen-to-square')
          .addClass('me-2')
          .appendTo(container)
          .on('click', function () {
           var candidateResumeId = options.data.Id; // Get candidate resume ID from the row data
            console.log('candidateResumeId',candidateResumeId )
      // Redirect to the "ViewCandidateDetailsForm.aspx" page with candidateId parameter
      var url = 'https://i2ec.sharepoint.com/sites/IAD-dev/Pages/Feedback.aspx?candidateId=' + candidateResumeId;
      // Open the URL in a new tab
      window.open(url, '_blank'); 
          });

        $('<i>')
          .addClass('fa-solid fa-eye')
          .attr('type', 'button')
          .appendTo(container)
          .on('click', function () { 
            var candidateResumeId = options.data.CandidateResumeId; // Get candidate resume ID from the row data

      // Redirect to the "ViewCandidateDetailsForm.aspx" page with candidateId parameter
      var url = 'https://i2ec.sharepoint.com/sites/IAD-dev/Pages/ViewCandidateDetailsForm.aspx?candidateId=' + candidateResumeId;
      // Open the URL in a new tab
      window.open(url, '_blank');             
          });
        },
    },
    { dataField: 'CandidateResumeId', caption: 'Candidate Resume Id' },
    { dataField: 'Title', caption: 'Candidate Name' },
    { dataField: 'Status.Title', caption: 'Status' },
    { dataField: 'Tech_x0020_Score', caption: 'Tech Score' },
    { dataField: 'HR_x0020_Score', caption: 'HR Score' },
    { dataField: 'Practice.Title', caption: 'Practice' },
    { dataField: 'Role.Title', caption: 'Role' },
    { dataField: 'Interviewer.results[0].Title', caption: 'Interviewer' },
    { dataField: 'RequestStatus', caption: 'Request Status'},
    

  ],
  dataSource: null, // Provide the array of objects
  // columns: columns, // Specify the columns
  showBorders: true, // Add border lines to the grid
  columnAutoWidth: true, // Automatically adjust column widths
  allowColumnReordering: true,
  showColumnLines: false,
  showRowLines: true,
  rowAlternationEnabled: true,
  showBorders: true,
  

  groupPanel: {   //it is used to group data by dragging a particular column and dropping it on the panel.
    visible: true,
  },
  //sorting
  sorting: {
    mode: 'multiple',
  },
  selection: {
  mode: 'multiple',
  },
  export: {
  enabled: false,
  allowExportSelectedData: false,
  },
   searchPanel: {
  visible: true,
  width: 240,
  placeholder: 'Search...',
},
  filterRow: {
    visible: true,
    applyFilter: 'auto',
  },
  headerFilter: {
    visible: true,
  },
   paging: {
  pageSize: 10,
    },
     pager: {
  visible: true,
  allowedPageSizes: [5, 10, 'all'],
  showPageSizeSelector: true,
  showInfo: true,
  showNavigationButtons: true,
},
};

    var gridContainer = document.getElementById("gridContainer");
    $('#gridContainer').html("Althaf");
    var dataGrid = new DevExpress.ui.dxDataGrid(gridContainer, grid);


var refreshButtonAdded = false;

// Function to add the custom refresh button to the header
function addRefreshButton() {
  var headerPanel = $('.dx-datagrid-header-panel');
    
    // Create a container for the button and search panel
    var container = $('<div>')
        .css('display', 'flex')
        .css('align-items', 'center') // To vertically align the items
        .css('justify-content', 'flex-end') // To align items to the right
        .appendTo(headerPanel);

    // Add the refresh button
    $('<i>')
        .addClass('fa-solid fa-sync')
        .addClass('dx-datagrid-action')
        .appendTo(container)
        .on('click', function () {
            refreshGridData();
        });

    // Append the search panel after the button
    $('.dx-datagrid-search-panel').appendTo(container);}

function updateGridWithCandidatesData(data) {
    dataGrid.option("dataSource", data);
}
// Fetch and update grid data
function fetchData() {
    var apiUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('CandidateFeedbackList')/items?$select=ID,CandidateResumeId,InterviewType,Id,Title,Status/Title,Practice/Title,Role/Title,RequestStatus,Interviewer/Id,Interviewer/Title&$expand=Status,Practice,Role,Interviewer/Id,Interviewer/Title";
    console.log("apiUrl", apiUrl);
    getData(apiUrl).done(function (data) {
        var formdata = data.d.results;
        updateGridWithCandidatesData(formdata);
        console.log("DATA", data);
        // Check if refresh button is not added yet
        if (!refreshButtonAdded) {
            addRefreshButton();
            refreshButtonAdded = true; // Mark the button as added
        } 
    });
}
// Function to refresh grid data
function refreshGridData() {
    fetchData();
}

// Initial data fetch and grid creation
fetchData();

