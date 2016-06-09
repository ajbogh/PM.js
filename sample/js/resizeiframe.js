// Add some security for the parent website's postMessage listener.
// Note: This does not interfere with existing postMessage systems
// such as Google or Facebook.
PM.addAuthorizedUrl([
    "http://pminner.local:8889"
]);

// Register the callbacks
// Note: the functions can be previously defined, they don't have to be anonymous.
// In this example we use the .on function, which is an alias to registerListener
PM.on("resizeIframe", function(response){
    console.log("resizing iframe to: "+response.data.width+"x"+response.data.height);
    var iframe = document.getElementById('iframe');
    iframe.style.height = response.data.height;
    iframe.style.width = response.data.width;
});