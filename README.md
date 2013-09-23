PM.js
=====

A complete, simple, effective, and secure postMessage solution for your websites.

PM is a simple postMessage wrapper that handles setup, security, communication, and callbacks.
It's very simple to use, as you will see below.

About postMessage requests
--------------------------

A quick lesson on what postMessage is and how it's used is in order. 

postMessage is a communication mechanism which can be used to send data to and from different domains. 
Each domain must include code which allows it to communicate with another. The browser performs various 
security checks on the origin of the request to make sure that one domain can send data to another. 
Facebook, Google, and Disney have all implemented a form of postMessage for their cross-domain login systems.

How postMessage works
---------------------

One website sets up an iframe or window to another domain's webpage. Once the iframe is ready then the
postMessage requests can flow back and forth through the iframe and the parent window. 

Each request is accompanied by an origin domain part. This origin domain must match the protocol, domain, 
and port of the other domain that the website is communicating with. It can also be a wildcard "*" character, 
signifying that the security mechanism can be eliminated to allow all postMessage requests to go through.

Inspiration
-----------

You may have heard about easyXDM by now if you've been googling for an answer to postMessage or cross-domain
communication. 

I developed this solution as a way to memorialize the knowledge that I gained as the lead developer of Disney's 
latest login website. At first we utilized easyXDM for much of the postMessage internals, using a 3 tiered iframe 
approach, which led to huge delays in the request times.

After much improvements to the internals, we began implementing a 2 tiered approach using the parent website
and the internal iframe which pointed to our login website. Without going into further detail, this
solution is based on the initial understanding of easyXDM's RPC calls, and the knowledge from working 
extensively with postMessage requests.

Requiements for Use
-------------------

1) JQuery is required (any version 1.4.2+)

Shared code (implement on both websites)
----------------------------------------

Both websites must include the PM.js or PM.min.js code (found in the [src](https://github.com/ajbogh/PM.js/tree/master/src) or [build](https://github.com/ajbogh/PM.js/tree/master/build) directory).

    <script type="text/javascript" src="js/PM.js"></script>

With this one line, PM.js is activated and listening on the website. It will handle any postMessage requests immediately.

**Security is a feature and a requirement**. Add some authorized URLs to your webpages.

    PM.addAuthorizedUrl("http://otherdomain.com");

Now your webpage will handle and authorize the postMessage requests from otherdomain.com

If you want to open the floodgates to all domains (danger Will Robinson!) then pass a "*" to this method.

    PM.addAuthorizedUrl("*");

You can even pass an array!

    PM.addAuthorizedUrl([
    	"http://otherdomain.com",
    	"http://www.otherdomain.com", //don't forget, subdomains are counted as separate domains altogether!
    	"http://otherdomain.com:8080", //ports are required as well
    	"https://otherdomain.com", //https is allowed, you cannot create an http iframe from an https site however!
    	"*" //mix and match, this will overide all prior entries and allow all traffic again!
    ]);

Add some functions to listen for. The other website will be making requests to these functions. The parent website can have its own functions registered for callbacks.

    PM.registerListener("test", function(data){
    	console.log("got test");
    	console.log(data);
    }).registerListener("othertest", function(data){
    	console.log("in othertest");
    	console.log(data);
    });

Making a Request
----------------

Posting a message is a one-line request.

    PM.postMessage("testhandle", "test", {my:"test", test:"is good"}, "callbackMethod", "http://otherdomain.com/PMWebpage.html");

Let's look at the parameters a little.

- "testhandle": A unique handle or ID to the iframe. Any request made to the domain will use this handle. This allows you to alias domains once they've been initialized.

- "test": The registered method within the other domain to execute. In this case "test". See above for how the other domain registered this function.

- {somedata:values}: The JSON, string, boolean, numerical, or other primitive value you wish to send. You cannot send functions through postMessage!

- "callbackMethod": (Optional) A name for a previously registered callback that the first domain registered using the registerListener function. This can also be a function, which will make the system automatically register it with a custom name and delete it from the object later. See below.

    PM.postMessage("testhandle", "test", {my:"test", test:"is good"}, function(data){ console.log(data); });

- "http://otherdomain.com/PMWebpage.html": (Optional*) A webpage to create an iframe for and post a message to. This is only required upon first calling postMessage for that domain or unless you call the PM.preloadUrl() function.

The PM.preloadUrl function can be called upon page instantiation ( $(document).ready() ) to allow PM.js to create the iframes and initialize the other webpage to allow instantaneous postMessage requests once the iframe is fully loaded.

    PM.preloadUrl("testhandle", "http://otherdomain.com/PMWebpage.html");

The PM.postMessage() function can be called immediately after the PM.preloadUrl() function without waiting.

    PM.postMessage("testhandle", "test", {my:"test", test:"is good"}); //just send data one-way. Url preloaded.

Considerations
--------------

1. What happens if the iframe doesn't load? -- An exception will be thrown from PM.postMessage after a few seconds with the message "PM: "+handle+" timed out for action "+action+". Data not sent.".

2. What if PM.js is included twice or if I say "new PM()"? -- PM is designed to reuse existing PMs.

3. What happens when an iframe loads? -- The (hidden) iframe renders the page, the PM object is instantiated and notices that it's within a PM iframe, the PM object then sends a "ready" response back to the parent website, the parent website hears the response and sets the handle to a "ready" state, the parent website can now send the data requests.

4. What about IE, I hear it works differently with postMessage? -- I know. It's been handled. I'm not even happy about it since Microsoft's website even says IE handles objects when it doesn't. Grunble grumble.

5. What browsers does this work with? -- The question should be what doesn't this work with? IE7 and below is not compatible. Most every up-to-date browser is compatible, including Firefox, Chrome, Safari, Android browsers, iOS, IE8+, Opera, etc.