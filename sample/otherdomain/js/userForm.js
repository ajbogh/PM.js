PM.addAuthorizedUrl("http://pmmain.local:8888");

//Now for the real API
PM.registerListener("login", function(accountInfo){
    console.log("login inner");
    var account = sessionStorage.getItem('account');
    if(account){
        try {
            account = JSON.parse(account);
        } catch(e){
            return false;
        }
    }

    if(accountInfo.data.username === account.username && accountInfo.data.password === account.password){
        return account;
    }else{
        console.log("---returning false");
        return false;
    }
}).registerListener("deleteAccount", function(){
    sessionStorage.removeItem('account');
    return true;
}).registerListener("editAccount", function(accountInfo){
    if(accountInfo.data.password){
        accountInfo.data.password = accountInfo.data.password;
    }
    console.log("----editAccount inner", accountInfo);
    var account = sessionStorage.getItem('account');
    if(account){
        account = JSON.parse(account);
        account.username = accountInfo.data.username;
        account.displayName = accountInfo.data.displayName;
        if(accountInfo.data.password){
            account.password = accountInfo.data.password;
        }
        sessionStorage.setItem('account', JSON.stringify(account));
        delete account.password;
    }else{ //register
        sessionStorage.setItem('account', JSON.stringify(accountInfo.data));
        account = JSON.parse(JSON.stringify(accountInfo.data));
        delete account.password;
    }
    console.log(account);
    return account;
}).registerListener("getAccount", function(){
    console.log("getAccount inner");
    var account = sessionStorage.getItem('account');
    if(account){
        console.log("getAccount inner", account);
        var accountData = JSON.parse(account);
        delete accountData.password;
        return accountData;
    }
    return false;
});