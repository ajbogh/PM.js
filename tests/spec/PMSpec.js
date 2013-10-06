describe("PM", function () {
	var obj = PM;
		
	it("parseUrl - parses a URL", function () {
		var url = obj.parseUrl("http://www.google.com/test.html");
		expect(url.protocol+"//"+url.hostname).toEqual("http://www.google.com");
	});
	it("addAuthorizedUrl - adds http://www.google.com to the authorizedUrls array", function () {
		obj.addAuthorizedUrl("http://www.google.com/test.html");
		expect(obj.authorizedUrls).toContain("http://www.google.com");
	});
	it("addAuthorizedUrls - adds ['https://google.com', 'http://yahoo.com'] to the authorizedUrls array", function () {
		var url = obj.addAuthorizedUrls(["https://google.com/test.html","http://yahoo.com/index.html"]);
		expect(obj.authorizedUrls).toContain("https://google.com");
		expect(obj.authorizedUrls).toContain("http://yahoo.com");
	});
	it("addAuthorizedUrls - makes sure the input is an array", function () {
		try{
			var url = obj.addAuthorizedUrls("test");
			expect(false).toEqual(true);
		}catch(e){
			expect(true).toEqual(true);
		}
	});
	it("isAuthorizedUrl - tests if https://www.google.com is within the array", function () {
		obj.addAuthorizedUrl("http://www.google.com/test.html");
		var isThere = obj.isAuthorizedUrl("http://www.google.com");
		expect(isThere).toBe(true);
	});
	it("formatIframeUrl - creates an iframe postMessage URL from a given URL", function () {
		var location = window.location.href;
		var iframeUrl = obj.formatIframeUrl("test", "http://www.google.com/test.html?test=true");
		expect(iframeUrl).toEqual("http://www.google.com/test.html?test=true#action=postMessage&referrer="+encodeURIComponent(location)+"&handle=test");
		iframeUrl = obj.formatIframeUrl("test","http://www.google.com/test.html?test=true#test=123");
		expect(iframeUrl).toEqual("http://www.google.com/test.html?test=true#test=123&action=postMessage&referrer="+encodeURIComponent(location)+"&handle=test");
	});
	it("preloadUrl - creates an iframe, makes sure it was written to the document", function () {
		var id = "test";
		var iframe = obj.preloadUrl(id, "http://www.google.com/test.html?test=true");
		expect(document.getElementById(id)).toEqual(iframe);
		obj.removePMIframes();
		obj.clearAuthorizedUrls();
	});

	it("preloadUrls - creates iframes, makes sure they was written to the document", function () {
		var iframes = obj.preloadUrls({
			"test":"http://www.google.com/test.html?test=true",
			"test2":"http://www.google.com/test2.html"
		});
		
		expect(document.getElementById("test")).toEqual(iframes["test"]);
		expect(document.getElementById("test2")).toEqual(iframes["test2"]);
		obj.removePMIframes();
		obj.clearAuthorizedUrls();
	});
	it("registerListener - registers a listener function.", function () {
		window.myFuncTest = 0;
		
		function myFunc(){
			window.myFuncTest = 1;
		}

		var pmObj = obj.registerListener("myFunc", myFunc);

		expect(pmObj._registeredListeners.myFunc).toEqual(myFunc);
		obj._registeredListeners.myFunc();

		expect(window.myFuncTest).toEqual(1);
		delete window.myFuncTest;
		obj.unregisterListener("myFunc");
	});

	it("removePMIframe - deletes an iframe and handler from the document", function () {
		var id = "test";
		obj.preloadUrl(id, "http://www.google.com/test.html?test=true");
		obj.removePMIframe(obj._iframes[id]);
		expect(obj._handlers[id]).not.toBeDefined();
		expect(obj._iframes[id]).not.toBeDefined();
		expect(document.getElementById("test")).toEqual(null);
		obj.clearAuthorizedUrls();
	});
	it("removePMIframeByHandle - deletes an iframe and handler by a handle", function () {
		var id = "test";
		obj.preloadUrl(id, "http://www.google.com/test.html?test=true");
		var result = obj.removePMIframeByHandle(id);
		expect(obj._iframes[id]).not.toBeDefined();
		expect(obj._handlers[id]).not.toBeDefined();
		expect(document.getElementById("test")).toEqual(null);
		expect(result).toEqual(true);
		obj.clearAuthorizedUrls();
	});
	it("removePMIframes (no param) - deletes all iframes from the document", function () {
		var id = "test";
		var iframe = obj.preloadUrl(id, "http://www.google.com/test.html?test=true");
		var id2 = "test2";
		var iframe2 = obj.preloadUrl(id2, "http://www.google.com/test2.html?test=true");
		var result = obj.removePMIframes();
		expect(obj._iframes[id]).not.toBeDefined();
		expect(obj._handlers[id]).not.toBeDefined();
		expect(obj._iframes[id2]).not.toBeDefined();
		expect(obj._handlers[id2]).not.toBeDefined();
		expect(document.getElementById("test")).toEqual(null);
		expect(document.getElementById("test2")).toEqual(null);
		expect(result).toEqual(true);
		obj.clearAuthorizedUrls();
	});
	it("removePMIframes (with param) - deletes all iframes from the document", function () {
		var id = "test";
		var iframe = obj.preloadUrl(id, "http://www.google.com/test.html?test=true");
		var id2 = "test2";
		var iframe2 = obj.preloadUrl(id2, "http://www.google.com/test2.html?test=true");
		var result = obj.removePMIframes(obj._iframes);
		expect(obj._handlers[id]).not.toBeDefined();
		expect(obj._iframes[id]).not.toBeDefined();
		expect(obj._handlers[id2]).not.toBeDefined();
		expect(obj._iframes[id2]).not.toBeDefined();
		expect(document.getElementById("test")).toEqual(null);
		expect(document.getElementById("test2")).toEqual(null);
		expect(result).toEqual(true);
		obj.clearAuthorizedUrls();
	});

	it("postMessage - posts a message to localhost", function () {
		obj.registerListener("mytest", function(data){
			expect(data.action).toEqual("mytest");
			expect(data.data).toEqual(null);
		});
		obj.postMessage("testhandle", "test", {my:"test", test:"is good"}, "mytest", "http://otherdomain.com/PM/tests/TestPMWebpage.html");
	});	

	it("postMessage - posts a message to localhost", function () {
		obj.registerListener("mytest", function(data){
			expect(data.action).toEqual("mytest");
		});
		obj.postMessage("testhandle", "test", {my:"test", test:"is good"}, "mytest");
	});	
});