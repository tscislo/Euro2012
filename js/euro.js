/**
 * File that contains main logic for Euro 2012 App
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

window.onload = function() {
	/**
	 * Main Euro 2012 app module. Provides focus management, mouse support and general logic.
	 */
	euro =  function() {
		
		/**
		 * List of possible page states
		 */
		var states = {
			aktualne : 0,
			zakonczone : 1		
		}		

		/**
		 * List of items that can be focused
		 */
		var focuses = {
			aktualne : 0,
			zakonczone : 1,
			game1 : 2,
			game2 : 3,
			game3 : 4,
			game4 : 5,
			game5 : 6,
			game6 : 7,
			nastepne: 8,
			poprzednie: 9
		}
		
		/**
		 * Handled keyboard keys
		 */
		var keyCodes = {
			left: 37,
			right: 39,
			down: 40,
			up: 38,
			enter: 13
		}
		
		var itemsPerPage = 6;
		var currentPage = 1;
		var allPages = 1;
		var state = states.aktualne;
		var aktualne;
		var zakonczone;		
		var poprzednie;
		var focus = focuses.aktualne;
		var focusedMatch;
		var nastepne;
		var data = [];
		var anchor;
		
		/**
		 * List of countries
		 */
		var countryMap = {
			PL : {
				image : 'pl.png',
				name : 'Polska'
			},
			CZ : {
				image : 'cze.png',
				name : 'Czechy'
			},
			CH : {
				image : 'ch.png',
				name : 'Chorwacja'
			},
			D : {
				image : 'd.png',
				name : 'Niemcy'
			},
			DE : {
				image : 'de.png',
				name : 'Dania'
			},
			ES : {
				image : 'es.png',
				name : 'Hiszpania'
			},
			GR : {
				image : 'gr.png',
				name : 'Grecja'
			},
			IR : {
				image : 'ir.png',
				name : 'Irlandia'
			},
			IT : {
				image : 'it.png',
				name : 'Włochy'
			},
			NL : {
				image : 'nl.png',
				name : 'Holandia'
			},
			PT : {
				image : 'pt.png',
				name : 'Portugalia'
			},
			RU : {
				image : 'ru.png',
				name : 'Rosja'
			}
		}		
		
		var createMatchRow = function(json, no) {
			return '<div class="row">' +
					 '<div class="date">'+ json.day +'</div>' +
					 '<div class="hour">'+ json.hour +'</div>' + 
					 '<div class="game1">'+ countryMap[json.country1].name +'</div>' + 
					 '<img src="./images/flags/'+ countryMap[json.country1].image +'" alt="'+ countryMap[json.country1].name +'" class="game1_flag"/>' +
					 '<img src="./images/flags/'+ countryMap[json.country2].image +'" alt="'+ countryMap[json.country2].name +'" class="game2_flag"/>' +
					 '<div class="game2">'+ countryMap[json.country2].name +'</div>' + 
				    ((state===states.aktualne) ? '<div class="typuj" id="typuj_'+json.id+'" no="'+(no + 1)+'"></div>' : ' ') + 
					 '</div>';
		}		
		
		
		var renderPage = function(page, json) {
			var firstElement = (page - 1)*itemsPerPage;
			var lastElement = getLastElementFromPage(currentPage);
			var rows = '';
			for (var i=firstElement;i<lastElement ;i++){
				rows += createMatchRow(json[i], i);
			}
			utils.getElement('games-container').innerHTML = rows;
			if(state===states.zakonczone)
				return false;
			for (var i=firstElement;i<lastElement ;i++){
				var id = json[i].id;
				(function(id){
					var element = utils.getElement('typuj_' + id);
					if(utils.getCookie(id)) 
						element.style.backgroundImage = "url('images/zmien.png')";
					utils.addEvent(element, 'click', function() 
						{
							activateTyp(id);
						}				
					);
					utils.addEvent(element, 'mouseover', function() 
						{
							if(utils.getCookie(id)) 
								element.style.backgroundImage = "url('images/zmien_hover.png')";
							else
								element.style.backgroundImage = "url('images/typuj_hover.png')";
							element.style.cursor = 'pointer';
						}				
					);
					utils.addEvent(element, 'mouseout', function() 
						{
							if(utils.getCookie(id)) 
								element.style.backgroundImage = "url('images/zmien.png')";
							else
								element.style.backgroundImage = "url('images/typuj.png')";
							element.style.cursor = 'normal';
							restoreFocus();
						}				
					);
				})(id);
			}
		}		
		
		
		var isNextNotShown = function() {
			return ((currentPage === allPages) ? true : false);
		}
		
		var isPrevShown = function() {
			return ((currentPage >  1) ? true : false);
		}
		
		var renderPrevNext = function() {
			if(isNextNotShown()) {
				utils.getElement('nastepne').style.visibility = 'hidden';
			} else {
				utils.getElement('nastepne').style.visibility = 'visible';
			}
			if(isPrevShown()) {
				utils.getElement('poprzednie').style.visibility = 'visible';
			} else {
				utils.getElement('poprzednie').style.visibility = 'hidden';
			}
		}		
		
		var checkCookieForMatch = function(id) {
			if (utils.getCookie(id))
				return true;
			else 
				return false;
		}		
		
		var leftHandler = function() {
			if(focus === focuses.zakonczone) {
				focus = focuses.aktualne;
				if(state!==states.zakonczone)
					zakonczone.style.backgroundImage = "url('images/zakonczone.png')";
				if(state!==states.aktualne) {
					aktualne.style.backgroundImage = "url('images/aktualne_hover.png')";
				}
			} else if(focus===focuses.nastepne && isPrevShown()) {
				poprzednie.style.backgroundImage = "url('images/poprzednie_hover.png')";
				nastepne.style.backgroundImage = "url('images/nastepne.png')";
				focus=focuses.poprzednie;
			}
		}
		
		var rightHandler = function() {
			if(focus === focuses.aktualne) {
				focus = focuses.zakonczone;
				if(state!==states.aktualne)
					aktualne.style.backgroundImage = "url('images/aktualne.png')";
				if(state!==states.zakonczone) {
					zakonczone.style.backgroundImage = "url('images/zakonczone_hover.png')";
				}
			}else if(focus===focuses.poprzednie && !isNextNotShown()) {
				nastepne.style.backgroundImage = "url('images/nastepne_hover.png')";
				poprzednie.style.backgroundImage = "url('images/poprzednie.png')";
				focus=focuses.nastepne;
			}
		}
		
		var enterHandler = function() {
			switch(focus) {
				case focuses.aktualne:
					activateAktualne();
				break;
				case focuses.zakonczone:
					activateZakonczone();
				break;
				case focuses.game1:
					activateTyp(data[getFirstElementFromPage(currentPage)].id);
				break;
				case focuses.game2:
					activateTyp(data[getFirstElementFromPage(currentPage)+1].id);
				break;
				case focuses.game3:
					activateTyp(data[getFirstElementFromPage(currentPage)+2].id);
				break;
				case focuses.game4:
					activateTyp(data[getFirstElementFromPage(currentPage)+3].id);
				break;
				case focuses.game5:
					activateTyp(data[getFirstElementFromPage(currentPage)+4].id);
				break;
				case focuses.game6:
					activateTyp(data[getFirstElementFromPage(currentPage)+5].id);
				break;
				case focuses.poprzednie:
					activatePoprzednie();
				break;
				case focuses.nastepne:
					activateNastepne();
				break;
				
			}
		}
		
		var downHandler = function() {
			if(focus === focuses.aktualne || focus === focuses.zakonczone && state !== states.zakonczone) {
				if(state===states.aktualne) {
					aktualne.style.backgroundImage = "url('images/aktualne_pressed.png')";
					zakonczone.style.backgroundImage = "url('images/zakonczone.png')";
				} else {
					zakonczone.style.backgroundImage = "url('images/zakonczone_pressed.png')";
					aktualne.style.backgroundImage = "url('images/aktualne.png')";
				}				
				var first = getFirstElementFromPage(currentPage);
				focusMatch(data[first].id);
				focus = focuses.game1;
			} else if(focus === focuses.game1) {
				blurMatch(data[getFirstElementFromPage(currentPage)].id);
				if(moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)].id)) return false;
				if(typeof data[getFirstElementFromPage(currentPage)+1] === "undefined") return false;
				focusMatch(data[getFirstElementFromPage(currentPage)+1].id);
				focus = focuses.game2; 
			} else if(focus === focuses.game2) {
				blurMatch(data[getFirstElementFromPage(currentPage)+1].id);
				if(moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)+1].id)) return false;
				if(typeof data[getFirstElementFromPage(currentPage)+2] === "undefined") return false;
				focusMatch(data[getFirstElementFromPage(currentPage)+2].id);
				focus = focuses.game3; 
			}else if(focus === focuses.game3) {
				blurMatch(data[getFirstElementFromPage(currentPage)+2].id);
				if(moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)+2].id)) return false;
				if(typeof data[getFirstElementFromPage(currentPage)+3] === "undefined") return false;
				focusMatch(data[getFirstElementFromPage(currentPage)+3].id);
				focus = focuses.game4; 
			}
			else if(focus === focuses.game4) {
				blurMatch(data[getFirstElementFromPage(currentPage)+3].id);
				if(moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)+3].id)) return false;
				if(typeof data[getFirstElementFromPage(currentPage)+4] === "undefined") return false;
				focusMatch(data[getFirstElementFromPage(currentPage)+4].id);
				focus = focuses.game5; 
			}
			else if(focus === focuses.game5) {
				blurMatch(data[getFirstElementFromPage(currentPage)+4].id);
				if(moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)+4].id)) return false;
				if(typeof data[getFirstElementFromPage(currentPage)+5] === "undefined") return false;
				focusMatch(data[getFirstElementFromPage(currentPage)+5].id);
				focus = focuses.game6; 
			} else if(focus === focuses.game6) {
				blurMatch(data[getFirstElementFromPage(currentPage)+5].id);
				moveFocusToPrevNext(data[getFirstElementFromPage(currentPage)+5].id)
			}
		}
		
		var upHandler = function() {
			if(focus === focuses.game1) {
				if(state===states.zakonczone) {
					zakonczone.style.backgroundImage = "url('images/zakonczone_pressed.png')";
				} else {
					zakonczone.style.backgroundImage = "url('images/zakonczone_hover.png')";
				}	
				blurMatch(data[getFirstElementFromPage(currentPage)].id);
				focus = focuses.zakonczone;
			} else if(focus === focuses.game6) {
				blurMatch(data[getFirstElementFromPage(currentPage)+5].id);
				focusMatch(data[getFirstElementFromPage(currentPage)+4].id);
				focus = focuses.game5; 
			} else if(focus === focuses.game2) {
				blurMatch(data[getFirstElementFromPage(currentPage)+1].id);
				focusMatch(data[getFirstElementFromPage(currentPage)].id);
				focus = focuses.game1; 
			}else if(focus === focuses.game3) {
				blurMatch(data[getFirstElementFromPage(currentPage)+2].id);
				focusMatch(data[getFirstElementFromPage(currentPage)+1].id);
				focus = focuses.game2; 
			}
			else if(focus === focuses.game4) {
				blurMatch(data[getFirstElementFromPage(currentPage)+3].id);
				focusMatch(data[getFirstElementFromPage(currentPage)+2].id);
				focus = focuses.game3; 
			}
			else if(focus === focuses.game5) {
				blurMatch(data[getFirstElementFromPage(currentPage)+4].id);
				focusMatch(data[getFirstElementFromPage(currentPage)+3].id);
				focus = focuses.game4; 
			}
			else if(focus===focuses.poprzednie || focus===focuses.nastepne){
				poprzednie.style.backgroundImage = "url('images/poprzednie.png')";
				nastepne.style.backgroundImage = "url('images/nastepne.png')";
				var last = getLastElementFromPage(currentPage);
				focusMatch(last);
				focus = parseInt(getGameNoById(last), 10) - ((currentPage -1) * itemsPerPage) +1;
			}
		}
		
		var moveFocusToPrevNext = function(id) {
			var lastElementOnPage = getLastElementFromPage(currentPage);
			if(id === lastElementOnPage) {
				if(isPrevShown()) {
					focus = focuses.poprzednie;
					poprzednie.style.backgroundImage = "url('images/poprzednie_hover.png')";
				} else if (!isNextNotShown()) {
					focus = focuses.nastepne;
					nastepne.style.backgroundImage = "url('images/nastepne_hover.png')";
				}
				return true;
			}
			return false;
		}
		
		var blurMatch = function(id) {
			var element = utils.getElement('typuj_' + id);
			if(utils.getCookie(id)) 
				element.style.backgroundImage = "url('images/zmien.png')";
			else
				element.style.backgroundImage = "url('images/typuj.png')";
		}
		
		var focusMatch = function(id) {
			var element = utils.getElement('typuj_' + id);
			if(utils.getCookie(id)) 
				element.style.backgroundImage = "url('images/zmien_hover.png')";
			else
				element.style.backgroundImage = "url('images/typuj_hover.png')";
		}
		
		var activateTyp = function(id) {
			var element = utils.getElement('typuj_' + id);
			if(utils.getCookie(id)) 
				alert("Dziękujemy za zmianę typu");
			else {
				utils.setCookie(id, 1, 4);
				alert("Dziękujemy za Twój typ");		
				element.style.backgroundImage = "url('images/zmien.png')";
			}
			restoreFocus();
			anchor.focus();
		}
		
		
		var getGameNoById = function(id) {
			return utils.getElement('typuj_' + id).getAttribute('no');
		}
		
		var getLastElementFromPage = function(page) {
			var firstElement = (page - 1)*itemsPerPage;
			return (data.length<firstElement + itemsPerPage) ? data.length : firstElement + itemsPerPage;
		}
		
		var activateAktualne = function() {
			anchor.focus();
			focus = focuses.aktualne;
			if(state===states.aktualne) return false;
			state=states.aktualne;
			aktualne.style.backgroundImage = "url('images/aktualne_pressed.png')";
			zakonczone.style.backgroundImage = "url('images/zakonczone.png')";
			renderPage(currentPage, data);
		}
		
		var activateZakonczone = function() {
			anchor.focus();
			focus = focuses.zakonczone;
			if(state===states.zakonczone) return false;
			state=states.zakonczone;
			zakonczone.style.backgroundImage = "url('images/zakonczone_pressed.png')";
			aktualne.style.backgroundImage = "url('images/aktualne.png')";
			renderPage(currentPage, data);
		}
		
		var activateNastepne = function() {
			currentPage++;
			renderPage(currentPage, data);
			renderPrevNext();
			anchor.focus();
			restoreFocus();
		}
		
		var activatePoprzednie = function() {
			currentPage--;
			renderPage(currentPage, data);
			renderPrevNext();
			anchor.focus();
			restoreFocus();
		}
		
		var restoreFocus = function() {
			focus = focuses.aktualne;
			if(state === states.aktualne) {
				aktualne.style.backgroundImage = "url('images/aktualne_pressed.png')";
			} else {
				aktualne.style.backgroundImage = "url('images/aktualne_hover.png')";
			}
			var firstElement = getFirstElementFromPage(currentPage);
			for (var i=firstElement;i<firstElement + itemsPerPage ;i++){
				if(typeof data[i]=== "undefined")
					continue;
				var element = utils.getElement('typuj_' + data[i].id);
				try {
					if(utils.getCookie(data[i].id)) 
						element.style.backgroundImage = "url('images/zmien.png')";
					else
						element.style.backgroundImage = "url('images/typuj.png')";
				} catch (e) {}
			}
			poprzednie.style.backgroundImage = "url('images/poprzednie.png')";
			nastepne.style.backgroundImage = "url('images/nastepne.png')";
		}
		
		var getFirstElementFromPage = function(page) {
			return (page - 1) * itemsPerPage;
		}
		
		return {
			getCountry : function(code) {
				return countryMap[code];			
			},			
			errorHandler : function() {
				utils.getElement('zakonczone').style.visibility='hidden';
				utils.getElement('aktualne').style.visibility='hidden';
			},
			preloadImages : function() {
				var img = new Image();
				img.src = './images/aktualne.png';
				var img = new Image();
				img.src = './images/aktualne_hover.png';
				var img = new Image();
				img.src = './images/aktualne_pressed.png';
				var img = new Image();
				img.src = './images/nastepne.png';
				var img = new Image();
				img.src = './images/nastepne_hover.png';
				var img = new Image();
				img.src = './images/poprzednie.png';
				var img = new Image();
				img.src = './images/poprzednie_hover.png';
				var img = new Image();
				img.src = './images/typuj.png';
				var img = new Image();
				img.src = './images/typuj_hover.png';
				var img = new Image();
				img.src = './images/zakonczone.png';
				var img = new Image();
				img.src = './images/zakonczone_pressed.png';
				var img = new Image();
				img.src = './images/zmien.png';
				var img = new Image();
				img.src = './images/zmien_hover.png';
			},
			initialize : function() {
				aktualne = utils.getElement('aktualne');
				zakonczone = utils.getElement('zakonczone');
				poprzednie = utils.getElement('poprzednie');
				nastepne = utils.getElement('nastepne');
				anchor = utils.getElement('anchor');
				anchor.focus();
				utils.addEvent(aktualne, 'mouseover', function() 
					{
						if(state!==states.aktualne) {
							aktualne.style.backgroundImage = "url('images/aktualne_hover.png')";
							aktualne.style.cursor = 'pointer';
						}
					}				
				);
				utils.addEvent(aktualne, 'mouseout', function() 
					{
						restoreFocus();
						if(state!==states.aktualne)
							aktualne.style.backgroundImage = "url('images/aktualne.png')";
						aktualne.style.cursor = 'normal';
					}				
				);
				utils.addEvent(zakonczone, 'mouseover', function() 
					{
						if(state!==states.zakonczone) {
							zakonczone.style.backgroundImage = "url('images/zakonczone_hover.png')";
							zakonczone.style.cursor = 'pointer';
						}
					}				
				);
				utils.addEvent(zakonczone, 'mouseout', function() 
					{
						restoreFocus();
						if(state!==states.zakonczone)
							zakonczone.style.backgroundImage = "url('images/zakonczone.png')";
						zakonczone.style.cursor = 'normal';
					}				
				);
				utils.addEvent(aktualne, 'click', function() 
					{
						activateAktualne();
					}				
				);
				utils.addEvent(zakonczone, 'click', function() 
					{
						activateZakonczone();
					}				
				);
				utils.addEvent(poprzednie, 'mouseover', function() 
					{
						poprzednie.style.backgroundImage = "url('images/poprzednie_hover.png')";
						poprzednie.style.cursor = 'pointer';
					}				
				);
				utils.addEvent(poprzednie, 'mouseout', function() 
					{
						poprzednie.style.backgroundImage = "url('images/poprzednie.png')";
						poprzednie.style.cursor = 'normal';
						restoreFocus();
					}				
				);
				utils.addEvent(nastepne, 'mouseover', function() 
					{
						nastepne.style.backgroundImage = "url('images/nastepne_hover.png')";
						nastepne.style.cursor = 'pointer';
					}				
				);
				utils.addEvent(nastepne, 'mouseout', function() 
					{
						nastepne.style.backgroundImage = "url('images/nastepne.png')";
						nastepne.style.cursor = 'normal';
						restoreFocus();
					}				
				);
				utils.addEvent(nastepne, 'click', function() 
					{
						activateNastepne();
					}				
				);
				utils.addEvent(poprzednie, 'click', function() 
					{
						activatePoprzednie();
					}				
				);
				utils.addEvent(utils.getElement('anchor'), 'keydown', function(event) 
					{
						switch(event.keyCode) {
							case keyCodes.left:
								leftHandler();
								break;
							case keyCodes.right:
								rightHandler();
								break;
							case keyCodes.up:
								upHandler();
								break;
							case keyCodes.down:
								downHandler();
								break;
							case keyCodes.enter:
								enterHandler();
								break;
						}

					}				
				);
				var that = this;
				ajax.get('./data/data.json', function(json) {
					if(typeof json !== "object") {
						that.errorHandler();
						return false;
					}
					var items = json.length;	
					data = json;				
					allPages = Math.ceil(items/itemsPerPage);					
					renderPage(currentPage, json);
					renderPrevNext();
				}, that.errorHandler);
			}	
		}
	
	}();
	/**
	 * Module for handling DOM operations and cookies
	 */
	utils = function() {
		return {
			getElement : function(id) {
				return document.getElementById(id);	
			},	
			addEvent : function(element, type, callback) {
				if(typeof element !== "undefined" && typeof element.addEventListener === "function")
					element.addEventListener(type, callback, false);
				else 
					element.attachEvent('on'+type, callback);
			},
			console : function(txt) {
				if(typeof console !== "undefined") 
					console.log(txt)				
				else 
					alert(txt);
			},
			setCookie : function(c_name,value,exdays)
			{
				var exdate=new Date();
				exdate.setDate(exdate.getDate() + exdays);
				var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
				document.cookie=c_name + "=" + c_value;
			},
			getCookie : function (c_name)
			{
			var i,x,y,ARRcookies=document.cookie.split(";");
				for (i=0;i<ARRcookies.length;i++)
				{
  				x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  				y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  				x=x.replace(/^\s+|\s+$/g,"");
  				if (x==c_name)
    				return unescape(y);
    			}
    			return false;
  			}
		}	
	}();
	
	euro.preloadImages();
	euro.initialize();
}