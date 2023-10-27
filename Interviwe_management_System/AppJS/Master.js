var isAdmin=false, isInterviewers=false, isVisitor=false;
var utility, menuBarList = "TopNavigation", groupArray = [], targetLink;
var userGroupHeirarchy = ["IAD-Admin", "IAD-Interviewers","IAD-Visitors"];

if((navigator.userAgent.indexOf("Chrome") == -1 )) {
	alert("Note: Recommended browser for IAD site is Google Chrome.");
}

function loaderOpen() {
	$(".load").append("<div class='loaderContainer'><div class='loader'><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--text'></div></div></div>");
}
		
function loaderClose() {
	$(".loader").hide();
	$(".loader").remove();
	$(".loaderContainer").hide();
	$(".loaderContainer").remove();
}

$(document).ready(function() {
	utility = new Ph.DAL();
	var userDepartment = sessionStorage.getItem("userDepartmentIAD") !== "undefined" ? JSON.parse(sessionStorage.getItem("userDepartmentIAD")) : null;
	var userGroup = sessionStorage.getItem("userGroupIAD") !== "undefined" ? JSON.parse(sessionStorage.getItem("userGroupIAD")) : null;
	var userLogin = sessionStorage.getItem("userLoginIAD") !== "undefined" ? JSON.parse(sessionStorage.getItem("userLoginIAD")) : null;
	
	//showMaintenancePopup();
	
	getCurrentUserGroups();
   
});//close ready

function getData(url) {
	var deferred = $.Deferred();
	$.ajax({
		url: url,
		type: "GET",
		headers: {
			"accept": "application/json;odata=verbose",
		},
		success: function(data) {
			deferred.resolve(data);
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			showErrorPopup();
			deferred.reject();
		}
	});
	return deferred.promise();
}

function getMinimalData(url) {
	var deferred = $.Deferred();
	$.ajax({
		url: url,
		type: "GET",
		headers: {
			"Accept": "application/json",
			"content-type": "application/json;odata=minimalmetadata",
		},
		success: function(data) {
			deferred.resolve(data);
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			showErrorPopup();
			deferred.reject();
		}
	});
	return deferred.promise();
}

function getNoMetaData(url) {
	var deferred = $.Deferred();
	$.ajax({
		url: url,
		type: "GET",
		headers: {
			"Accept": "application/json",
			"content-type": "application/json;odata=nometadata",
		},
		success: function(data) {
			deferred.resolve(data);
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			showErrorPopup();
			deferred.reject();
		}
	});
	return deferred.promise();
}

function createNewItem(Object,reqURL) {
	var deferred = $.Deferred();
	$.ajax({
		url: reqURL,
		type: "POST",
		data: JSON.stringify(Object),
		headers: {
			"Accept": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"X-HTTP-Method": "POST"
		},
		success: function(data) {
			//console.log(data);
			deferred.resolve(data);
		},
		error: function(error, status, xhr) {
			console.log(JSON.stringify(error));
			showErrorPopup();
			deferred.reject();
		}
	});
	return deferred.promise();
}

function updateItem(object, reqURL, eTag) {
	var deferred = $.Deferred();
	$.ajax({
		url: reqURL,
		type: "POST",		
		data: JSON.stringify(object),
		headers: {
			"accept": "application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"content-Type": "application/json;odata=verbose",
			"X-Http-Method": "MERGE",
			"If-Match": !IsNullOrUndefined(eTag)? eTag : "*"
		},
		success: function(data) {
			deferred.resolve(data);
			//console.log(data);
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			showErrorPopup()
			deferred.reject();
		}
	});	
	return deferred.promise();
}

function deleteItem(url){
	var deferred = $.Deferred();
	$.ajax({
		url: url,
		type: "POST",
	    headers: {
	        "accept": "application/json;odata=verbose",
	        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	        "If-Match": "*"
	    },
		success: function() {
			deferred.resolve();
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			showErrorPopup();
			deferred.reject();
			
		}
	});
	return deferred.promise();
}

function getAllListItemData(selectQuery,listName, success, failure) {
    var arrAllData = [];
    var requestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$top=5000" + (selectQuery!="" ? "&"+selectQuery:"");
    var requestData = {
        "query": {
            "__metadata": { "type": "SP.CamlQuery" },
            "ViewXml": "<View><RowLimit>5000</RowLimit></View>"
        }
    };
    var executor = new SP.RequestExecutor(_spPageContextInfo.webAbsoluteUrl);
    var requestHeaders = {
        "Accept": "application/json; odata=verbose",
        "Content-Type": "application/json; odata=verbose"
    };
    var options = {
        "url": requestUrl,
        "method": "GET",
        "headers": requestHeaders,
        "data": JSON.stringify(requestData),
        "success": function (data) {
            var results = JSON.parse(data.body);
            arrAllData = arrAllData.concat(results.d.results);
            if (results.d.__next) {
                getNextItems(results.d.__next);
            } else {
                success(arrAllData);
            }
        },
        "error": function (error) {
            failure(error);
        }
    };
    executor.executeAsync(options);

    function getNextItems(nextUrl) {
        var nextExecutor = new SP.RequestExecutor(_spPageContextInfo.webAbsoluteUrl);
        var nextOptions = {
            "url": nextUrl,
            "method": "GET",
            "headers": requestHeaders,
            "success": function (data) {
                var results = JSON.parse(data.body);
                arrAllData = arrAllData.concat(results.d.results);
                if (results.d.__next) {
                    getNextItems(results.d.__next);
                } else {
                    success(arrAllData);
                }
            },
            "error": function (error) {
                failure(error);
            }
        };
        nextExecutor.executeAsync(nextOptions);
    }
}

function getCurrentUserGroups() {
	var grpUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetUserById("+ _spPageContextInfo.userId +")/Groups?$select=Id,Title,LoginName&$filter=startswith(Title,'IAD-')";
	//_spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties").done(function(userData) {
	//var grpUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/currentuser?$select=LoginName,groups/Id,groups/LoginName,groups/Title&$filter=startswith(Title,%27App_KM%27)&$expand=groups";
	
	$.ajax({
		url: grpUrl,
		method: "GET",
		async: false,
		headers: {
			"Accept": "application/json; odata=verbose",
			"Content-Type": "application/json; odata=verbose"
		},
		success: function(grpData) {
			var userGroup, loginName = "";
			//var loginName = grpData.d.LoginName && grpData.d.LoginName.length > 0 ? grpData.d.LoginName.split("|")[1] : '';
			//if (grpData.d.Groups.results != null && grpData.d.Groups.results.length != 0) {
				//$.each(grpData.d.Groups.results, function(key, value) {
			if(grpData.d.results != null && grpData.d.results.length != 0) {
				$.each(grpData.d.results, function(key, value) {
					groupArray.push(value.Title);
				});
				
				var grpArrays = [userGroupHeirarchy, groupArray], topGroup = grpArrays.shift().filter(function(v) {
					return grpArrays.every(function(a) {
						return a.indexOf(v) !== -1;
					});
				});
				
				userGroup = topGroup[0];
			}
			else {
				userGroup = userGroupHeirarchy.length > 0 ? userGroupHeirarchy[userGroupHeirarchy.length - 1] : "App_KM_MasterViewer";
			}
			
			if(userGroup == "IAD-Admin") {
				isAdmin = true;
				//$("div.programBtn.v-divider.deskTop > div.dvAllProgDesk").each(function(i, item){ $(item).hide() });
				// commenting this as all programs list will be visible to all
				// $("#dvAllProgDesk").show();
				//$("#dvAllProgMob").show();
			}
			else if(userGroup == "IAD-Interviewers") {
				isInterviewers = true;
				// $("div.programBtn.v-divider.deskTop > div.create").each(function(i, item){ $(item).hide() });
				$("#dvAllProgDesk").hide();
				$("#navContainer").hide();
				$("#export").hide();

				
			}
			else {
					userGroup="IAD-Visitors";
			     	isVisitor=true;
				// $("div.programBtn.v-divider.deskTop > div.create").each(function(i, item){ $(item).hide() });
				$("#dvAllProgDesk").hide();
				
			}
			
			getMenuBarItems(userGroup);
			
			var subUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=DisplayName,AccountName,Email,PictureUrl,UserProfileProperties";
			utility.getRequest(subUrl, false).done(function(subData) {
				var currentUser = [];
				
				currentUser.push({
					Account: subData.d.Email,
					FullName: subData.d.DisplayName,
					Group: userGroup,
					PicURL: subData.d.PictureUrl,
				});
				
				sessionStorage.setItem("userGroupIAD", JSON.stringify(userGroup));
				sessionStorage.setItem("userLoginIAD", JSON.stringify(currentUser));
				
				loadUserDetails();
				
				loginName = subData.d.AccountName;
				
				if(subData.d.UserProfileProperties && subData.d.UserProfileProperties.results.length>0){
					var properties = subData.d.UserProfileProperties.results;
			        for (var j = 0; j < properties.length; j++) {
			        	var property = properties[j]; 
			            if (property.Key == "Department") {  
			            	sessionStorage.setItem('userDepartmentIAD', JSON.stringify(property.Value));
			            }
			        }
		        }
				
			});
			
			
			//deferred.resolve(grpData);
		},
		error: function(error) {
			console.log(JSON.stringify(error));
			//deferred.reject();
		}
	});
	//return deferred.promise();
}




function loadUserDetails(){
	
	var currentUser = sessionStorage.getItem("userLoginIAD") !== 'undefined' ? JSON.parse(sessionStorage.getItem("userLoginIAD")) : [];
	
	if(currentUser){
		var userTitle = currentUser[0].FullName ? currentUser[0].FullName : 'User Name';
		var userLogin = currentUser[0].Account ? currentUser[0].Account : 'Domain\\UserAccount';
		$("#kmUserDetails .user-name").html(userTitle);
		$("#kmUserDetails .welcome-text").html(userLogin);
		$("#kmUserDetails").prop("title",userTitle + " (" + userLogin + ")");
		
		if(currentUser[0].PicURL !== null){		
			$("div.user-detail > div.user-icon > img").prop("src", currentUser[0].PicURL.replace(/ /g, "%20"));
		}
	}
}

function getMenuBarItems(groupName){
	
	var clientContext = new SP.ClientContext.get_current();
	var currentWeb = clientContext.get_web();
		
	var list = currentWeb.get_lists().getByTitle(menuBarList);
	var query = new SP.CamlQuery();
	// query.set_viewXml("<View>" +
	// 	"<Query>" +
	// 	"<OrderBy>" +
	// 	"<FieldRef Name='Order' Ascending='True' />" +
	// 	"</OrderBy>" +
	// 	"<Where><And><Contains><FieldRef Name='Target_x0020_Audiences' /><Value Type='TargetTo'>" + groupName + "</Value></Contains><Eq><FieldRef Name='IsActive' /><Value Type='Boolean'>1</Value></Eq></And></Where>" +
	// 	"</Query>" +
	// 	"<ViewFields>" +
	// 	"<FieldRef Name='Title' />" +
	// 	"<FieldRef Name='Link' />" +
	// 	"<FieldRef Name='ExternalLink' />" +
	// 	"</ViewFields>" +
	// 	"<QueryOptions />" +
	// 	"</View>");

    query.set_viewXml("<View>" +
    "<Query>" +
    "<OrderBy>" +
    "<FieldRef Name='Order' Ascending='True' />" +
    "</OrderBy>" +
    "</Query>" +
    "<ViewFields>" +
    "<FieldRef Name='Title' />" +
    "<FieldRef Name='Link' />" +
    "<FieldRef Name='ExternalLink' />" +
    "</ViewFields>" +
    "<QueryOptions />" +
    "</View>");

	var linkitems = list.getItems(query);
	clientContext.load(linkitems);

	clientContext.executeQueryAsync(
		Function.createDelegate(this, function () {
			
			var topNavArr = [];			
			if(linkitems.get_count() > 0){				
				var i=0;		
				var enumerator = linkitems.getEnumerator();
				while (enumerator.moveNext()) {
					var currentListItem = enumerator.get_current();
					
					topNavArr.push({
						menuTitle: currentListItem.get_item('Title') || '',
						menuUrl: currentListItem.get_item('Link') || '',
						menuTarget: currentListItem.get_item('ExternalLink') ? 'target="_blank"' : 'target="_self"'
					});
					i+=1;
				}
			}
			
			sessionStorage.setItem('userNavigationIAD', JSON.stringify(topNavArr));
			loadTopNavigation();
		}),
		Function.createDelegate(this, this.onQueryFailed));
}

function loadTopNavigation(){	
	$("#navContainer").empty();
	var topNavArr = sessionStorage.getItem("userNavigationIAD") !== 'undefined' ? JSON.parse(sessionStorage.getItem("userNavigationIAD")) : [];
	var innerHtml = '';
	$.each(topNavArr, function(index, item){
		innerHtml += '<a href="'+ item.menuUrl + '" ' + item.menuTarget + '"><li><strong>' + item.menuTitle + '</strong></li></a>';			
	});
	$("#navContainer").html(innerHtml);	
}

function activeMenuItem(navItem) { 	
	//$(navItem).addClass("active");	
	//$("#navContainer").find(navItem).addClass('active');
}

function onQueryFailed(sender, args) {
	console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

//Global to check Query String Parameters
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return (false);
}

var SpinOpts = {
	lines: 11, // The number of lines to draw
	length: 28, // The length of each line
	width: 10, // The line thickness
	radius: 30, // The radius of the inner circle
	scale: 1.25, // Scales overall size of the spinner
	corners: 1, // Corner roundness (0..1)
	color: "#0182e8", // #rgb or #rrggbb or array of colors
	opacity: 0.05, // Opacity of the lines
	rotate: 0, // The rotation offset 
	direction: 1, // 1: clockwise, -1: counterclockwise
	speed: 1.5, // Rounds per second
	trail: 60, // Afterglow percentage
	fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	className: "spinner", // The CSS class to assign to the spinner
	top: "50%", // Top position relative to parent
	left: "50%", // Left position relative to parent
	shadow: true, // Whether to render a shadow
	hwaccel: true, // Whether to use hardware acceleration
	position: "absolute" // Element positioning
}

function showMaintenancePopup(){
	
	if([9,12,13,50,217,241].indexOf(_spPageContextInfo.userId) == -1){
		$("#Maintenance_Modal").find("#Maintenance_Modal_Title").empty().append("Scheduled maintenance alert");
		var maintenanceHTML = "<b>MyLRF</b> portal will be down for maintenance from<b> 20th Jun 2023 12:00 AM (EST)  </b> till <b>21st Jun 2023 12:00 PM (EST)</b>, no changes will be able to be made at this time. Sorry for the inconvenience.";
		$("#Maintenance_Modal").find("#Maintenance_Modal_Desc").find('p').empty().append(maintenanceHTML);
		$("#Maintenance_Modal").modal("show");
	}
}
//create feedback button

$(document).ready(function(){
$("#dvAllProgDesk").css("display","inline-block");

})

function sendEmail(from, to, cc, body, subject) {
    var deferred = $.Deferred();
    var urlTemplate = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.Utilities.Utility.SendEmail";

    var emailProperties = {
        properties: {
            __metadata: {
                type: 'SP.Utilities.EmailProperties'
            },
            From: from,
            To: {
                results: to
            },
            CC:{
                results: cc
            },
            Body: body,
            Subject: subject
        }
    };

    return $.ajax({
        url: urlTemplate,
        type: "POST",
        data: JSON.stringify(emailProperties),
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
			deferred.resolve();
            console.log("send email succ")
		},
		error: function (jqXHR, textStatus, ex) {
			console.log(textStatus + "," + ex + "," + jqXHR.responseText);
			deferred.reject();
		}
    });
}





