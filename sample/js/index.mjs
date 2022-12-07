import { PM } from '/build/PM.mjs';

/* This webpage hosted at http://pmmain.local:8888/index.html
  * will host the "parent website" for the "responder page" at pminner.local:8889.
  * It essentially accesses a pure javascript API for authorized domains.
  * Multiple domains can be called, allowing for a Service-oriented architecture in JS.
  * 
  * This website uses PM.js to create a hidden iframe to the responder page. This 
  * page creates a listener, waits for the other domain to tell it that it's ready for communication, 
  * then sends requests.
  */

// You should preload URLs until you're ready to use them.
// This vastly improves the speed for mobile devices, since their request times
// may take significantly longer than desktops and laptop devices.
// 
// Note: These URLs won't work, but they will produce a friendly error message in the console 
// after a few seconds.
// eslint-disable-next-line no-unused-vars
const iframes = PM.preloadUrls({
  "BadUrlTest1":"http://badurl.local/test.html?test=true",
  "BadUrlTest2":"http://badurl.local/test2.html"
});

// You can then call PM like so:
PM.postMessage("BadUrlTest1", // iframe handle, from above preloadUrls call
  "testaction", // action to execute on google.com/test.html (not a real webpage)
  {my:"test", test:"is bad"}, // some data to send
  () => { // callback function or listener name
    console.log("Couldn't load http://www.google.com/test.html?test=true because it's a bad URL. The page doesn't exist.");
  }
);

// What if you don't want to worry about preloading URLs?
// Fine. Just call it like this:
PM.send("test3", // new handle to be registered
  "testaction", // action to execute
  {my:"test", test:"is good"}, // data to send
  null, //callback function not defined here
  "http://localhost:8001/index.html" // webpage for otherdomain.com
);

// Some people might want to execute a function when the request is complete with the result of the action.
// The callback parameter allows data from the other domain's action to be passed into a callback function.
// Note: in this example we only need the handle, not the URL because we've already registered the domain.

// First, let's register a listener function called "mycallback"
PM.registerListener("mycallback", (data) => {
  console.log('within mycallback listener', data);
});

// you can also use the "on" function
PM.on("mycallback2", (data) => {
  console.log(data);
})
// or chain the .on calls
.on("mycallback3", (data) => {
  console.log(data);
});

// When the postMessage request returns the data, it will execute the "mycallback" function.
PM.postMessage("test3", // handle
  "returntest", // action to execute
  {my:"test", test:"is good"}, // data to send
  "mycallback" // callback function or listener name
);

// That's too much work! Show me something easier!
// Ok, you don't really have to register callbacks, just pass the function in and
// we'll take care of it.
// in this example we use PM.send which is an alias for PM.postMessage
PM.send("test3", // handle
  "returntest", // action to execute
  {my:"test", test:"is good"}, // data to send
  (data) => { // callback function or listener name
    console.log('anonymous callback', data);
  }
);