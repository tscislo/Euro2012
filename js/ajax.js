/**
 * File that contains AJAX module for Euro 2012 App
 *
 * @author  Tomasz Scislo
 * @date    16.07.2012
 *
 *
 *****************************************************************************
 *
 * Copyright (c) 2012 Tomasz Scislo
 * All Rights Reserved.
 *
 ****************************************************************************/
var ajax = function() {

	var xhr;

	try {
		xhr = new XMLHttpRequest();
	} catch (e) {
		try {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				utils.console("No XHR object!");
				return false;
			}
		}
	}

	return {
		get : function(url, successCallback, errorCallback) {
			xhr.open('GET', url, true);
			xhr.setRequestHeader('Content-Type',
					'application/x-www-form-urlencoded');
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status === 200 || xhr.status === 304) {
						var json = eval(xhr.responseText)
						successCallback(json);
					} else {
						errorCallback();
						alert("Błąd połączenia z serwerem");
					}
				}
			}
			xhr.send();
		}
	};
}();