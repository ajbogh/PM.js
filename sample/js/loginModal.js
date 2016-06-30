PM.addAuthorizedUrl("http://pminner.local:8889");

function authorizeUser(data){
    fillUserInfo(data.data);
}
PM.on('authorizeUser', authorizeUser);

function userModified(data){
    fillUserInfo(data.data);
}
PM.on('userModified', userModified);



function fillUserInfo(data){
    document.getElementById("userInfoContent").style.display = "block";
    document.getElementById("userInfo").innerHTML = JSON.stringify(data, null, 2);
}