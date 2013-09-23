/**
 * A postMessage handler that can be implemented on 2 separate websites within 2 different domains (or more).
 * @param  {jquery} $
 * @return {object} PM
 * @constructor - self instantiating
 * @author   Allan Bogh (ajbogh@allanbogh.com)
 * @version  0.1 (2013-09-17)
 * @requires jQuery
 */
var PM = (function ($) {
	//check for existing PM
	if(PM){
		//PM already exists, just return it.
		return PM;
	}

	this._registeredListeners = {}; //functions to execute
	this._handlers = {}; //iframe postMessage objects to communicate with
	this._iframes = {}; //iframes list
	this.openMessages = 0; //increases when sendMessage is called, reduces when a message is complete.
	this.authorizedUrls = [];
	this._defaultIntervalTimeout = 100;
	this._intervalTimeout = this._defaultIntervalTimeout;
	this._maximumIntervals = 50; //total of 5 second wait time for iframes.

	this.init = function(){
		//loads a ready callback (and possibly others in the future)
		this._loadDefaultMethods();

		//instantiate a new listener immediately.
		this._createListener();
		var hash = new this.Hash();
		var self = this;
		if(hash.keyExists("action") && hash.get("action") === "postMessage"){
			$(window).on("load", function(){
				//pass back the ready state
				if(hash.keyExists("referrer")){
					var referrer = hash.get("referrer");
					var parsedReferrer = self.parseUrl(referrer);
					window.parent.postMessage({action:"ready", handle:hash.get("handle")}, parsedReferrer.protocol + '//' + parsedReferrer.hostname);
				}
			});
		}
	};

	/**
	 * Creates a window.onmessage listener. 
	 * This function must be here for the constructor to use.
	 * @private
	 */
	this._createListener = function () {
		var self = this;
		$(window).on("message",function(e){
			if (self.isAuthorizedUrl(e.originalEvent.origin)){
				var oeData = e.originalEvent.data;
				console.log(oeData);
				self._handlePostMessageRequest(oeData, e);
			}else{
				throw new Error(e.originalEvent.origin+" is not an authorized URL.");
			}
		});
	};

	/**
	 * Whenever a postMessage request happens the data will be sent to this function to be processed.
	 * @param {object} oeData The original postMessage event data.
	 * @return {boolean} False if there is no listener with that name, or no action in the PM request
	 * @private
	 * @todo :test
	 */
	this._handlePostMessageRequest = function(oeData, e){
		//get the action from oeData
		if(!oeData.action){
			return false;
		}

		//execute the listener by name (action value)
		var action = oeData.action;
		if(typeof this._registeredListeners[action] !== "function"){
			return false;
		}

		//the action is there an it's a function!
		if(typeof oeData === "string"){
			oeData = $.parseJSON(oeData); //will return a string, int, or object
		}
		var result = this._registeredListeners[action].call(this, oeData, e);

		if(oeData.callback){
			this._handlePMCallback(oeData, e, result);
		}
		if(oeData.deleteCallback){
			delete this._registeredListeners[action];			
		}
	};

	this._handlePMCallback = function(oeData, e, result){
		//fix result
		if(typeof result === "undefined"){ result = null; }

		var pmData = {
			action: oeData.callback,
			data: this.fixPMData(result)
		};
		if(oeData.deleteCallback){
			pmData.deleteCallback = true;
		}
		
		var origin = e.originalEvent.origin;

		e.originalEvent.source.postMessage(pmData, origin);
		return;
	};

	/**
	 * Loads the ready function. Ready is called when the iframe has completed loading.
	 * @return {[type]}
	 * @todo : test
	 */
	this._loadDefaultMethods = function(){
		var self = this;
		this.registerListener("ready", function(data, e){
			//sets a "pmReady" variable on the iframe.
			//the act of having a handle in this object means that the source is now ready.
			this._handlers[data.handle] = e.originalEvent.source;
		});
	};

	/**
	 * parses a string URL to return a real object to be used instead.
	 * @param  {string} url
	 * @return {object} {"protocol":"http:", "hostname":"google.com", "port":1234, "pathname":"/test/" "search":"?querystring", "hash":"#hashtags"}
	 */
	this.parseUrl = function(url) {
		var a = document.createElement('a');
		a.href = url;
		return a;
	};

	/**
	 * Adds an authorized URL to communicate with.
	 * @param {string} url - a port://domain or port://domain/page url. 
	 *     If http and https will be used then use addAuthorizedUrls instead to add both.
	 */
	this.addAuthorizedUrl = function(url){
		//overload for addAuthorizedUrls
		if(Object.prototype.toString.call(url) === '[object Array]'){
			this.addAuthorizedUrls(url);
			return;
		}

		if(url === "*"){
			this.authorizedUrls.push(url);	
		}else{
			var urlObj = this.parseUrl(url);
			domainPart = urlObj.hostname+(urlObj.port?":"+urlObj.port:"");
			//Only add the protocol, domain and port. That's all we care about.
			this.authorizedUrls.push(urlObj.protocol+"//"+domainPart);	
		}
	};
	/**
	 * Adds an array of authorized URLs.
	 * @param {array} urlArray - an array of urls to add.
	 */
	this.addAuthorizedUrls = function(urlArray){
		//input validation
		if(Object.prototype.toString.call(urlArray) !== '[object Array]'){
			throw "Invalid input. Not an array.";
		}
		var i;
		for(i in urlArray){
			this.addAuthorizedUrl(urlArray[i]);
		}
	};
	/**
	 * Checks if a particular url is within the authorizedUrls array.
	 * @param  {string}  url
	 * @return {Boolean}
	 */
	this.isAuthorizedUrl = function(url){
		return this.authorizedUrls.indexOf("*") > -1 || this.authorizedUrls.indexOf(url) > -1;
	};
	this.clearAuthorizedUrls = function(){
		this.authorizedUrls = [];
	};
	this.removeAuthorizedUrl = function(url){
		if(!this.isAuthorizedUrl(url)){
			return true; //already not authorized
		}
		this.authorizedUrls.splice(this.authorizedUrls.indexOf(url), 1);
	};

	/**
	 * Checks whether a handler has been fully loaded.
	 * @param  {string}  handle
	 * @return {Boolean} true when the iframe is fully loaded and ready to listen to PM events.
	 * @todo : test
	 */
	this.isHandlerReady = function(handle){
		return (!!this._handlers[handle]);
	};

	/**
	 * Checks if a handle has been registered
	 * @param  {string}  handle
	 * @return {Boolean} true if iframe handle is registered
	 * @todo : test
	 */
	this.isIframeRegistered = function(handle){
		return (!!this._iframes[handle]);
	};

	/**
	 * Adds a partner webpage to the window so that future calls don't have to 
	 * wait for the iframe to become available.
	 * @param {string} handle - a unique ID to give the listening webpage
	 * @param {string} url - a URL to preload for a partner webpage
	 * @return {HTMLNode:iframe} The iframe DOM object that was created.
	 */
	this.preloadUrl = function (handle, url) {
		// create an iframe with a unique ID that it should know about.
		// use hash tags to define a "postMessage" action
		if(!this.isAuthorizedUrl(url)){
			this.addAuthorizedUrl(url);
		}
		
		//return the iframe that's already ready.
		if(this.isIframeRegistered(handle)){
			return this._iframes[handle];
		}

		//create a new iframe.
		var pmUrl = this.formatIframeUrl(handle, url);

		var iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.id = handle;
		iframe.src = pmUrl;

		this._iframes[handle] = iframe;

		document.body.appendChild(iframe);

		return iframe;
	};

	/**
	 * preloads an object containing a unique handle key and a URL value
	 * @param {object} urls {"handle1":"http://test.com", "handle2":"http://test2.com"}
	 * @return {object} An object containing the handle and the iframe DOM element
	 */
	this.preloadUrls = function(urls){
		var iframeObj = {};
		for(var i in urls){
			//skip properties that are not its own
			if(!urls.hasOwnProperty(i)){ continue; }
			
			iframeObj[i] = this.preloadUrl(i, urls[i]);
		}
		return iframeObj;
	};

	/**
	 * formatIframeUrl takes a url for a partner webpage and generates a
	 * url that the webpage will use to switch it into handling postMessage requests
	 * @param  {string} url - the URL of the partner webpage
	 * @return {string} The complete URL for the postMessage iframe
	 */
	this.formatIframeUrl = function(handle, url){
		var parsedUrl = this.parseUrl(url);
		// assuming no hash in responder url, seriously.

		var domainPart = parsedUrl.hostname+(parsedUrl.port?":"+parsedUrl.port:"");
		var hash = parsedUrl.hash;
		var actionHash = "action=postMessage&referrer="+encodeURIComponent(window.location.href)+"&handle="+handle;
		if(hash === ""){
			hash = "#"+actionHash;
		}else{ //append a hash to the existing hash
			hash += "&"+actionHash;
		}
		return parsedUrl.protocol+"//"+domainPart+parsedUrl.pathname+parsedUrl.search+hash;
	};

	/**
	 * Sets the maximum number of milliseconds to wait for an iframe to load.
	 * @param {int} millis - the maximum number of milliseconds
	 * @todo : test
	 */
	this.setMaxWaitTime = function(millis){
		this._maximumIntervals = millis / this._intervalTimeout;
	};

	/**
	 * Number of milliseconds to wait before checking on a loading iframe. Default is 100 millis
	 * @param {int} millis
	 * @todo : test
	 */
	this.setIntervalTimeout = function(millis){
		if(!millis || millis <= 0){
			millis = this._defaultIntervalTimeout;
		}
		this._intervalTimeout = millis;
	};

	/**
	 * The communicator. Sends a JSON object or primitive to a partner webpage. If the 
	 * webpage has not been preloaded then the url parameter is required. Don't forget to register a listener for callbacks!
	 * @param {string} handle - (optional) a unique ID to use for the partner webpage. This can correlate to a preloaded unique ID
	 * @param {string} action - a registered function to call on the other side.
	 * @param {variable} data - some data to send (JSON object, text, number, boolean)
	 * @param {string} callbackAction - a registered listener action name
	 * @param {string} url - (optional) if url is defined and a handle is not already made then the iframe will be created for the message
	 *
	 * @todo : work on this
	 * @todo : test
	 */
	this.postMessage = function (handle, action, data, callbackAction, url) {
		//check if the iframe is there.
		if(!this.isIframeRegistered(handle) && url){
			//create iframe
			this.preloadUrl(handle, url);
			if(!this.isHandlerReady(handle)){
				//wait for the iframe to become ready.
				this._pmWait(handle, action, data, callbackAction);
			}else{ //somehow the handle is now ready? Weird.
				this._postMessage(handle, action, data, callbackAction);
			}
		}else if(!this.isIframeRegistered(handle) && !url){
			throw new Error("Unknown handle. Must include url for unknown handles.");
		}else if(!this.isHandlerReady(handle)){
			//iframe is registered but it's not fully loaded and ready.
			this._pmWait(handle, action, data, callbackAction);
		}else{
			//iframe is loaded and handler must be ready now.
			this._postMessage(handle, action, data, callbackAction);
		}
	};
	/**
	 * Waits for an iframe to become ready, then calls the postMessage function.
	 * @param  {[type]} handle
	 * @param  {[type]} action
	 * @param  {[type]} data
	 * @param  {[type]} callbackAction
	 * @todo : test
	 */
	this._pmWait = function(handle, action, data, callbackAction){
		var intervalCount = 0;
		var self = this;
		var interval = setInterval(function(){
			intervalCount++;
			if(intervalCount === self._maximumIntervals && !self.isHandlerReady(handle)){
				clearInterval(interval);
				throw new Error("PM: "+handle+" timed out for action "+action+". Data not sent.");
			}else if(self.isHandlerReady(handle)){
				clearInterval(interval);
				self._postMessage(handle, action, data, callbackAction);
			}
		}, this._intervalTimeout);
	};
	/**
	 * private function for posting a message to a known iframe
	 * @param  {string} handle
	 * @param  {string} action
	 * @param  {object} data
	 * @param  {string} callbackAction
	 * @todo : test
	 */
	this._postMessage = function(handle, action, data, callbackAction){
		var pmData = {
			"action":action,
			"data":data,
			"handle":handle
		};
		if(callbackAction){
			if(typeof callbackAction === "function"){
				//create function for callback, set option to delete
				callbackActionName = "PM_"+(new Date()).getTime();
				this.registerListener(callbackActionName, callbackAction);
				pmData.callback = callbackActionName;
				//auto-generated callbacks should be automatically removed.
				pmData.deleteCallback = true;
			}else{
				pmData.callback = callbackAction;	
			}
		}
		var parsedIframe = this.parseUrl(this._iframes[handle].src), 
			domainPart = parsedIframe.hostname+(parsedIframe.port?":"+parsedIframe.port:""),
			origin = parsedIframe.protocol+"//"+domainPart;

		pmData = this.fixPMData(pmData);
		this._handlers[handle].postMessage(pmData, origin);
	};

	/**
	 * Fixes the data to be sent through postMessage for IE9 and 8
	 * @param  {[type]} data
	 * @return {[type]}
	 */
	this.fixPMData = function(data){
		if(document.documentMode && document.documentMode < 10){
			data = this.toJSON(data);
		}else{
			return data;
		}
	};

	/**
	 * Adds a listener function to the system. The name parameter should be a function name
	 * that the partner webpage will be able to reference.
	 * @param {string} actionName - a name to register the function with.
	 * @param {function} func - a function to execute when a request is caught with the correct name defined.
	 *     The postMessage data parameter will be passed to this function.
	 * @param {event} e the original event object
	 * @return {object} The JSON object containing all registered listeners
	 */
	this.registerListener = function (actionName, func) {
		if(typeof func !== "function"){
			throw "Second parameter to registerListener must be a function!";
		}
		this._registeredListeners[actionName] = func;
		return this;
	};
	this.unregisterListener = function(actionName){
		if(typeof this._registeredListeners[actionName] === "undefined"){
			return this;
		}
		delete this._registeredListeners[actionName];
		return this;
	};

	/**
	 * Removes a registered iframe from the DOM.
	 * @param  {object} handler - a registered handler (PM._handlers[handlerID])
	 * @return {boolean} true when the handler has been deleted.
	 */
	this.removePMIframe = function(handler){
		//safety check
		if(!handler){
			return false;
		}
		//cleans up all iframes
		handler.parentNode.removeChild(handler);
		delete this._handlers[handler.id];
		return true;
	};

	/**
	 * Removes a registered iframe from the DOM.
	 * @param  {string} handle - a unique ID for a handler iframe
	 * @return {boolean} true when the handler has been deleted
	 */
	this.removePMIframeByHandle = function(handle){
		//cleans up all iframes
		if(!this._handlers[handle]){ return false; }
		
		var handler = this._handlers[handle];
		return this.removePMIframe(handler);
	};

	/**
	 * Removes all registered iframes from the DOM.
	 * @param  {object} handlers (optional) - all registered handlers (PM._handlers)
	 * @return {boolean} true when all handlers have been deleted
	 */
	this.removePMIframes = function(handlers){
		//fill in the variable
		if(!handlers){
			handlers = this._handlers;
		}
		//cleans up all iframes
		var success = true; 
		for(var i in handlers){
			if(!handlers.hasOwnProperty(i)){ continue; }
			success = this.removePMIframe(handlers[i]) && success;
		}
		return success;
	};

	this.Hash = function(){
		//strip away extra # at the front or the back
		var hash = window.location.hash.replace(/(^#)|(#$)/,'');

		this.hashObj = {}; //public hash object

		//split into array by & or #
		var hashArr = hash.split(/[#&]+/);
		for(var i = 0; i<hashArr.length; i++){
			if(typeof hashArr[i] === "undefined" || hashArr[i] === ""){ continue; }
			var currentHashArr = hashArr[i].split('=');
			this.hashObj[currentHashArr[0]] = (currentHashArr.length > 1?decodeURIComponent(currentHashArr[1]):decodeURIComponent(currentHashArr[0]));
			try{ //try to parse a JSON object, if it fails then it must be text.
				this.hashObj[currentHashArr[0]] = $.parseJSON(this.hashObj[currentHashArr[0]]);
			}catch(e){}
		}

		//variable cleanup
		delete this.hash;
		delete this.hashArr;

		this.keyExists = function(key){
			return (typeof this.hashObj[key] !== "undefined");
		};
		this.get = function(key) {
			return this.hashObj[key];
		};
		return this;
	};

	/**
	 * Clears all open listeners and messages.
	 * Primarily used for testing.
	 */
	//this.destruct = function() {
	//	this._registeredListeners = {};
		//this.removePMIframes(this._handlers);
//this._handlers = {};
	//	//this.authorizedUrls = [];
	//};

	/**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON representation.
	 *
	 * @param o {Mixed} The json-serializable *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 * @author Brantley Harris, 2009-2011
	 * @author Timo Tijhof, 2011-2012
	 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
	 */
	this.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
		if (o === null) {
			return 'null';
		}

		var pairs, k, name, val,
			type = $.type(o);

		if (type === 'undefined') {
			return undefined;
		}

		// Also covers instantiated Number and Boolean objects,
		// which are typeof 'object' but thanks to $.type, we
		// catch them here. I don't know whether it is right
		// or wrong that instantiated primitives are not
		// exported to JSON as an {"object":..}.
		// We choose this path because that's what the browsers did.
		if (type === 'number' || type === 'boolean') {
			return String(o);
		}
		if (type === 'string') {
			return $.quoteString(o);
		}
		if (typeof o.toJSON === 'function') {
			return $.toJSON(o.toJSON());
		}
		if (type === 'date') {
			var month = o.getUTCMonth() + 1,
				day = o.getUTCDate(),
				year = o.getUTCFullYear(),
				hours = o.getUTCHours(),
				minutes = o.getUTCMinutes(),
				seconds = o.getUTCSeconds(),
				milli = o.getUTCMilliseconds();

			if (month < 10) {
				month = '0' + month;
			}
			if (day < 10) {
				day = '0' + day;
			}
			if (hours < 10) {
				hours = '0' + hours;
			}
			if (minutes < 10) {
				minutes = '0' + minutes;
			}
			if (seconds < 10) {
				seconds = '0' + seconds;
			}
			if (milli < 100) {
				milli = '0' + milli;
			}
			if (milli < 10) {
				milli = '0' + milli;
			}
			return '"' + year + '-' + month + '-' + day + 'T' +
				hours + ':' + minutes + ':' + seconds +
				'.' + milli + 'Z"';
		}

		pairs = [];

		if ($.isArray(o)) {
			for (k = 0; k < o.length; k++) {
				pairs.push($.toJSON(o[k]) || 'null');
			}
			return '[' + pairs.join(',') + ']';
		}

		// Any other object (plain object, RegExp, ..)
		// Need to do typeof instead of $.type, because we also
		// want to catch non-plain objects.
		if (typeof o === 'object') {
			for (k in o) {
				// Only include own properties,
				// Filter out inherited prototypes
				if (hasOwn.call(o, k)) {
					// Keys must be numerical or string. Skip others
					type = typeof k;
					if (type === 'number') {
						name = '"' + k + '"';
					} else if (type === 'string') {
						name = $.quoteString(k);
					} else {
						continue;
					}
					type = typeof o[k];

					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					if (type !== 'function' && type !== 'undefined') {
						val = $.toJSON(o[k]);
						pairs.push(name + ':' + val);
					}
				}
			}
			return '{' + pairs.join(',') + '}';
		}
	};

	//intialize the object now.
	this.init();

	return this;
})(jQuery);