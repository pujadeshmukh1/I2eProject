"use strict";
var Ph = window.Ph || {};

Ph.DAL = function() {
	var baseRequest = {
		url: "",
		type: ""
	}, dfd = $.Deferred();
	//Ajax get request 
	this.getRequest = function(endpoint, _async) {
		var request = baseRequest;
		request.type = "GET";
		request.async = _async;
		request.url = endpoint;
		request.headers = { ACCEPT: "application/json;odata=verbose" };
		dfd = $.ajax(request);
		return dfd.promise();
	};
	
	//Ajax post request
	this.newItemRequest = function(endpoint, adddata, _async) {
		var request = baseRequest;
		request.url = endpoint;
		request.type = "POST";
		request.async = _async;
		request.contentType = "application/json;odata=verbose";
		request.headers = {
			"ACCEPT": "application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val()
		};
		request.data = JSON.stringify(adddata);
		dfd = $.ajax(request);
		return dfd.promise();
	};
	//Ajax patch request
	this.updateItemRequest = function(endpoint, updatedata,eTag, _async) {
		var request = baseRequest;
		request.url = endpoint;
		request.type = "POST";
		request.async = _async;
		request.contentType = "application/json;odata=verbose";
		request.headers = {
			"ACCEPT": "application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"X-HTTP-Method": "MERGE",
			"If-Match": "*"
		};
		request.data = JSON.stringify(updatedata);
		return $.ajax(request);
	};
	//Ajax delete request
	this.deleteItemRequest = function(endpoint, _async) {
		var request = baseRequest;
		request.url = endpoint;
		request.type = "DELETE";
		request.async = _async;
		request.contentType = "application/json;odata=verbose";
		request.headers = {
			"ACCEPT": "application/json;odata=verbose",
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"If-Match": "*"
		};
		return $.ajax(request);
	};
}