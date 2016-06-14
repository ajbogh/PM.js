/**
 * A postMessage handler that can be implemented on 2 separate websites within 2 different domains (or more).
 * @return {object} PM
 * @constructor - self instantiating
 * @author   Allan Bogh (ajbogh@allanbogh.com)
 * @version  0.2 (2013-09-17)
 */
function PMClass() {
    'use strict';

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

    /**
     * initChildIframe registers the parent window as a handle and iframe
     * so that the child frame can post messages up to the parent.
     * @param {string} parentUrl - The URL of the parent webpage. The protocol, domain, and port is required if the port is not 443 or 80.
     * @return {object} The PM object to be used for chaining calls.
     */
    this.initChildIframe = function(parentUrl){
        //window.opener handles popups
        this._handlers.parent = window.opener || window.parent;
        this._iframes.parent = {};
        //need to store the parent URL since we don't actually have an iframe.
        this._iframes.parent.src = parentUrl;
        return this;
    };


    /**
     * init loads the default parameters and sets up the system for communication.
     */
    this.init = function(){
        //loads a ready callback (and possibly others in the future)
        this._loadDefaultMethods();

        //instantiate a new listener immediately.
        this._createListener();
        var hash = new this.Hash(),
            self = this;
        if(hash.keyExists("action") && hash.get("action") === "postMessage"){
            this.addEventListener(window, "load", function(){
                //pass back the ready state
                if(hash.keyExists("referrer")){
                    var referrer = hash.get("referrer");
                    var parsedReferrer = self.parseUrl(referrer);
                    var parentUrl = parsedReferrer.protocol + '//' + parsedReferrer.hostname + (parsedReferrer.port?":"+parsedReferrer.port:"");
                    window.parent.postMessage({action:"ready", handle:hash.get("handle")}, parentUrl);
                    self.initChildIframe(parentUrl);
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
        this.addEventListener(window, "message", function(e){
            if (self.isAuthorizedUrl(e.origin)){
                var oeData = e.data;
                self._handlePostMessageRequest(oeData, e);
            }else{
                throw new Error(e.origin+" is not an authorized URL.");
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
            oeData = JSON.parseJSON(oeData); //will return a string, int, or object
        }
        var result = this._registeredListeners[action].call(this, oeData, e);

        //post the data back to the other domain.
        if(oeData.callback){
            this._handlePMCallback(oeData, e, result);
        }
        //we only delete registeredListeners in the calling domain, or the one without the callback.
        if(!oeData.callback && oeData.deleteCallback){
            delete this._registeredListeners[action];
        }
    };

    /**
     * This private function posts the data back to the calling domain.
     * @param {object} oeData The original postMessage event data.
     * @param {object} e The postMessage event object.
     * @param {any} result A result to post back to the parent caller.
     * @private
     * @todo :test
     */
    this._handlePMCallback = function(oeData, e, result){
        //fix result
        if(typeof result === "undefined"){ result = null; }

        var pmData = {
            action: oeData.callback,
            data: this.fixPMData(result),
            deleteCallback: oeData.deleteCallback || false
        };

        var origin = e.origin;

        e.source.postMessage(pmData, origin);
        return;
    };

    /**
     * Loads the ready function. Ready is called when the iframe has completed loading.
     * @return {[type]}
     * @todo : test
     */
    this._loadDefaultMethods = function(){
        this.registerListener("ready", function(data, e){
            //sets a "pmReady" variable on the iframe.
            //the act of having a handle in this object means that the source is now ready.
            this._handlers[data.handle] = e.source;
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
            return this.addAuthorizedUrls(url);
        }

        if(url === "*"){
            this.authorizedUrls.push(url);
        }else{
            var urlObj = this.parseUrl(url);
            var domainPart = urlObj.hostname+(urlObj.port?":"+urlObj.port:"");
            //Only add the protocol, domain and port. That's all we care about.
            this.authorizedUrls.push(urlObj.protocol+"//"+domainPart);
        }
        return this;
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
            if(urlArray.hasOwnProperty(i)){
                this.addAuthorizedUrl(urlArray[i]);
            }
        }
        return this;
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
        return this;
    };
    this.removeAuthorizedUrl = function(url){
        if(!this.isAuthorizedUrl(url)){
            return true; //already not authorized
        }
        this.authorizedUrls.splice(this.authorizedUrls.indexOf(url), 1);
        return this;
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
        var listenerFunction = function(){
            document.body.appendChild(iframe);
            document.removeEventListener( "DOMContentLoaded", listenerFunction, false );
        };

        if(!document.body){
            this.addEventListener(document, "DOMContentLoaded", listenerFunction);
        }else{
            document.body.appendChild(iframe);
        }

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
     * An alias for PM.postMessage
     */
    this.send = function(handle, action, data, callbackAction, url){
        this.postMessage(handle, action, data, callbackAction, url);
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
                var callbackActionName = "PM_"+(new Date()).getTime();
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
            data = JSON.stringify(data); //IE can use JSON object.
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
     * @return {PM} The PM class
     */
    this.registerListener = function (actionName, func) {
        if(typeof func !== "function"){
            throw "Second parameter to registerListener must be a function!";
        }
        this._registeredListeners[actionName] = func;
        return this;
    };
    /**
     * An alias for registerListener
     * @param {string} actionName - a name to register the function with.
     * @param {function} func - a function to execute when a request is caught with the correct name defined.
     *     The postMessage data parameter will be passed to this function.
     * @return {PM} The PM class
     */
    this.on = function(actionName, func){
       return this.registerListener(actionName, func);
    };
    this.unregisterListener = function(actionName){
        if(typeof this._registeredListeners[actionName] === "undefined"){
            return this;
        }
        delete this._registeredListeners[actionName];
        return this;
    };
    /**
     * An alias for unregisterListener
     * @param {string} actionName - a named listener to unregister.
     * @return {PM} The PM class
     */
    this.off = function(actionName){
        return this.unregisterListener(actionName);
    };

    /**
     * Removes a registered iframe from the DOM.
     * @param  {object} handler - a registered handler (PM._handlers[handlerID])
     * @return {boolean} true when the handler has been deleted.
     */
    this.removePMIframe = function(iframe){
        //safety check
        if(!iframe || !iframe.id){
            return false;
        }
        var id = iframe.id;
        //cleans up all iframes
        if(this._iframes[id]){
            this._iframes[id].parentNode.removeChild(this._iframes[id]);
            delete this._iframes[id];
        }
        if(this._handlers[id]){
            delete this._handlers[id];
        }
        return true;
    };

    /**
     * Removes a registered iframe from the DOM.
     * @param  {string} handle - a unique ID for a handler iframe
     * @return {boolean} true when the handler has been deleted
     */
    this.removePMIframeByHandle = function(handle){
        //cleans up all iframes
        if(!this._iframes[handle]){ return false; }

        var iframe = this._iframes[handle];
        return this.removePMIframe(iframe);
    };

    /**
     * Removes all registered iframes from the DOM.
     * @param  {object} handlers (optional) - all registered handlers (PM._handlers)
     * @return {boolean} true when all handlers have been deleted
     */
    this.removePMIframes = function(iframes){
        //fill in the variable
        if(!iframes){
            iframes = this._iframes;
        }
        //cleans up all iframes
        var success = true;
        for(var i in iframes){
            if(!iframes.hasOwnProperty(i)){ continue; }
            success = this.removePMIframe(iframes[i]) && success;
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
                this.hashObj[currentHashArr[0]] = JSON.parse(this.hashObj[currentHashArr[0]]);
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

    this.addEventListener = function(element, method, func){
        var eventMethod = 'addEventListener';
        var prependMethod = '';
        if(!window.addEventListener){
            eventMethod = 'attachEvent';
            prependMethod = 'on';
        }
        element[eventMethod](prependMethod+method, function(e){
            func(e);
        });
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

        //intialize the object now.
    this.init();

    return this;
}

var PM = new PMClass();