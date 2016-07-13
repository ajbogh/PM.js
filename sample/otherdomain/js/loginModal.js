//create some mock data in storage
var userInfo = {
    username: 'test',
    password: 'test',
    firstName: 'John',
    lastName: 'Doe',
    email: 'jdoe@test.com',
    gender: 'M',
    dob: '1982-01-01',
    authenticated: false
};
if(!sessionStorage.getItem('userInfo')){
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
}else{
    userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
}
//end mock data


//add other domain's URL
PM.addAuthorizedUrl('http://pmmain.local:8888');


//Modals need to communicate the inner window height. This method fires when the window is fully loaded
PM.addEventListener(window, "load", function() {
    // CSS is slow, so we need to repeat this process until the page is done moving around.
    // 100ms repeating should be good, but some browsers might need a little more time, between 100 and 300ms isn't noticeable.
    var chkReadyState = setInterval(function() {
        if (document.readyState == "complete") {
            // clear the interval
            clearInterval(chkReadyState);
            // finally your page is loaded.
            changeHeight();
        }
    }, 100);
});


function closeModal(event){
    if(event) { event.stopPropagation(); }
    PM.send('parent', 'closeModal');
    return false;
}

function login(event){
    document.getElementById("message").style.display = "none";
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    //this is a mock login. Typically you would login with a REST API.
    var userInfo = sessionStorage.getItem('userInfo');
    if(userInfo){
        userInfo = JSON.parse(userInfo);

        if(userInfo.username === username && userInfo.password === password){
            userInfo.authenticated = true;
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

            //this acts like a shallow object copier
            var modifiedUserInfo =  JSON.parse(JSON.stringify(userInfo));
            delete modifiedUserInfo.password;

            // Here's the important part. You want to provide the parent website with the user information
            // so that they know the user is authenticated.

            // Send the user information to the parent website
            PM.send('parent', 'authorizeUser', modifiedUserInfo);
            closeModal(event);
        }else{
            //incorrect login info
            var messageContainer = document.getElementById("message");
            messageContainer.innerHTML = "Incorrect username/password.";
            messageContainer.style.display = "block";
            changeHeight();
        }
    }else{
        //browser doesn't support storage?
        var messageContainer = document.getElementById("message");
        messageContainer.innerHTML = "Your browser doesn't support sessionStorage. Are you in an incognito window or an old browser?";
        messageContainer.style.display = "block";
        changeHeight();
    }
}

function modifyUser(){
    userInfo.gender = document.getElementById('gender').value;
    userInfo.dob = document.getElementById('dob').value;
    userInfo.firstName = document.getElementById('firstName').value;
    userInfo.lastName = document.getElementById('lastName').value;
    userInfo.email = document.getElementById('email').value;

    //this acts like a shallow object copier
    var modifiedUserInfo =  JSON.parse(JSON.stringify(userInfo));
    delete modifiedUserInfo.password;

    sessionStorage.setItem('userInfo', JSON.stringify(modifiedUserInfo));

    PM.send('parent', 'userModified', userInfo);
    closeModal();
}

function isAuthenticated(){
    //simple security measure to check if the user is authenticated
    var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return (userInfo && userInfo.authenticated);
}

function checkAuthentication(){
    //simple security measure to redirect the user when they're not logged in.
    if(!isAuthenticated()){
        window.location.href = window.location.href.replace('modifyUser', 'login');
    }
}


// This is used by the modifyUser form to load the user info from sessionStorage
function loadUserInfoOnForm(){
    checkAuthentication();

    document.getElementById('firstName').value = userInfo.firstName;
    document.getElementById('lastName').value = userInfo.lastName;
    document.getElementById('gender').value = userInfo.gender;
    document.getElementById('dob').value = userInfo.dob
    document.getElementById('email').value = userInfo.email
}


function changeHeight(previousSize){
    var element = document.getElementById("content")
    var clientRect = element.getBoundingClientRect();
    var marginX = clientRect.left,
        marginY = clientRect.top;

    var newSize = {
        height: element.scrollHeight + (marginY * 2),
        width: element.scrollWidth + (marginX * 2)
    };
    PM.send('parent', 'resizeIframe', newSize);

    //sometimes CSS browser rendering is slow. Need to try a few times.
    if(!previousSize || (previousSize && (previousSize.height !== newSize.height || previousSize.width !== newSize.width))){
        setTimeout(function(){
            changeHeight(newSize);
        }, 100);
    }
}