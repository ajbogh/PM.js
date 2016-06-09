PM.preloadUrl("userAPI", "http://pminner.local:8889/userForm.html");


//these functions are for the user account API.
function showLogin(){
    document.getElementById("login").style.display = "block";
    document.getElementById("edit").style.display = "none";
    document.getElementById("accountInfo").style.display = "none";
    document.getElementById("accountInfoHeader").style.display = "none";
}
function showRegisterAccount(){
    document.getElementById("login").style.display = "none";
    document.getElementById("edit").style.display = "block";
    document.getElementById("accountInfo").style.display = "none";
    document.getElementById("accountInfoHeader").style.display = "none";
}

function showEditAccount(){
    var usernameElem = document.editForm.username;
    var displayNameElem = document.editForm.displayName;

    PM.postMessage("userAPI", // handle
        "getAccount", // action to execute
        null,
        function(accountInfo){
            usernameElem.value = accountInfo.data.username || "";
            displayNameElem.value = accountInfo.data.displayName || "";
        }
    );

    document.getElementById("login").style.display = "none";
    document.getElementById("edit").style.display = "block";
    document.getElementById("accountInfo").style.display = "none";
    document.getElementById("accountInfoHeader").style.display = "none";
}

function login(event){
    event.preventDefault();

    var formData = {};
    for(var i = 0; i < document.loginForm.length; i++){
        if(document.loginForm[i].tagName === "INPUT"){
            formData[document.loginForm[i].name] = document.loginForm[i].value;
        }
    }

    PM.postMessage("userAPI", // handle
        "login", // action to execute
        formData,
        function(accountInfo){
            if(accountInfo && !accountInfo.data){
                console.log("login callback", accountInfo);
                document.getElementById("accountInfo").innerHTML = JSON.stringify(accountInfo, undefined, 2);
                document.getElementById("accountInfo").style.display = "block";
                document.getElementById("accountInfoHeader").style.display = "none";
            }else{
                getAccountInfo();
            }
        }
    );
    return false;
}

function editAccount(event){
    event.preventDefault();
    var formData = {};
    for(var i = 0; i < document.editForm.length; i++){
        if(document.editForm[i].tagName === "INPUT"){
            formData[document.editForm[i].name] = document.editForm[i].value;
        }
    }

    PM.postMessage("userAPI", // handle
        "editAccount", // action to execute
        formData,
        function(accountInfo){
            console.log("----editAccount2 outer", accountInfo);
            if(accountInfo && accountInfo.data){
                document.getElementById("edit").style.display = "none";
                document.editForm.username.value = null;
                document.editForm.displayName.value = null;
                document.editForm.password.value = null;
                getAccountInfo();
            }
        }
    );

    return false;
}

function deleteAccount(){
    PM.postMessage("userAPI", // handle
        "deleteAccount", // action to execute
        null,
        function(accountDeleted){
            if(accountDeleted){
                console.log("Account deleted! outer");
                document.getElementById("accountInfo").innerHTML = JSON.stringify(accountDeleted, undefined, 2);
                document.getElementById("accountInfo").style.display = "block";
                document.getElementById("accountInfoHeader").style.display = "none";
            }
        }
    );
}

function getAccountInfo(){
    console.log("----getAccountInfo", PM._registeredListeners, Object.keys(PM._registeredListeners));
    PM.postMessage("userAPI", // handle
        "getAccount", // action to execute
        null, //no data
        function(accountInfo){
            console.log('---getAccount outer');
            if(accountInfo && accountInfo.data){
                document.getElementById("accountInfo").innerHTML = JSON.stringify(accountInfo, undefined, 2);
                document.getElementById("accountInfoHeader").style.display = "block";
                document.getElementById("accountInfo").style.display = "block";
            }else{
                document.getElementById("accountInfo").innerHTML = JSON.stringify(accountInfo, undefined, 2);
                document.getElementById("accountInfoHeader").style.display = "none";
                document.getElementById("accountInfo").style.display = "block";
            }
        }
    );
}