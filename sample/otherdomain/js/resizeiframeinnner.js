PM.addAuthorizedUrl([
    "*"
]);

function changeHeight(){
    var element = document.getElementById("content")
    var clientRect = element.getBoundingClientRect();
    var marginX = clientRect.left,
        marginY = clientRect.top;

    PM.postMessage("parent", "resizeIframe", {
        height: element.scrollHeight + (marginY * 2),
        width: element.scrollWidth + (marginX * 2)
    });
}

document.addEventListener('DOMContentLoaded', function(){
    PM.initChildIframe("http://pmmain.local:8888/resizeiframe.html");
    changeHeight();
}, false);

var firstVertical = null;
function addVertical(){
    var content = document.getElementById("verticalContent");
    if(!firstVertical){
        firstVertical = content.innerHTML+"";
    }
    content.innerHTML += content.innerHTML;
    changeHeight();
}
function resetVertical(){
    var content = document.getElementById("verticalContent");
    content.innerHTML = firstVertical;
    changeHeight();
}

var firstHorizontal = null;
function addHorizontal(){
    var content = document.getElementById("horizontalContent");
    if(!firstHorizontal){
        firstHorizontal = content.innerHTML+"";
    }
    content.innerHTML += content.innerHTML;
    changeHeight();
}
function resetHorizontal(){
    var content = document.getElementById("horizontalContent");
    content.innerHTML = firstHorizontal;
    changeHeight();
}