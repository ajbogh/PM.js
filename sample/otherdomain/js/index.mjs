import {PM} from '/build/PM.mjs';

/* This webpage hosted at http://localhost:8001/index.html
  * will host the "responder page" for the parent website. It essentially acts like a
  * pure javascript API for authorized domains.
  * 
  * The parent website uses PM.js to create a hidden iframe to this page. This 
  * page authorizes the domain, tells the parent that it's ready for communication, 
  * then responds to requests.
*/
		
PM.addAuthorizedUrl([
  "http://localhost", //for testing you can also use localhost
  "http://localhost:8000",
  "http://pmmain.local:8888",
  //"*" // allow any domain
]).registerListener("testaction", function(data){
  // This registers an action called "testaction"
  // The parent website would call this action, such as an API.
  console.log("got testaction");
  console.log(data);
// .on is an alias for registerListener
}).on("othertest", function(data){
  // This registers a different function called "othertest".
  console.log("in othertest");
  console.log(data);
}).on("returntest", function(data){
  // This registers a different function called "returntest".
  // This function returns a string with the value "returntest success"
  console.log("in returntest");
  console.log(data);
  return "returntest success";
});

/*
 * If this iframe is loaded from the parent site as a visible iframe, which may not 
 * have the correct "&action" parameter (ex. <iframe src="http://otherdomain.com/loginpage">)
 * then the iframe child may need to communicate with the parent. This communication route must be
 * manually set up using the method below:
 */
//this code just prevents other tests from firing this example
var hash = new PM.Hash();
if(hash.keyExists("action")){ //end prevention 
  //The parent URL must be sent in the query string or get it from referer
  //The handle will be "parent". This is a default handle when using the initChildIframe function
  console.log("initializing child iframe");
  PM.initChildIframe("http://localhost:8000/index.html");
  //call the registered listener in the parent
  console.log("calling mycallback of parent window");
  PM.postMessage("parent", "mycallback", {"test":"Success"}, "returntest");
}

//helper function
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


//Now for the real API
PM.registerListener("login", function(accountInfo){
  console.log("Child: login start");
  var account = sessionStorage.getItem('account');
  if(account){
    try {
      account = JSON.parse(account);
    } catch(e){
      console.log("Child: login - could not part account JSON from sessionStorage");
      return false;
    }
  }

  if(accountInfo.data.username === account.username && accountInfo.data.password.hashCode() === account.password){
    console.log("Child: login - account successfully logged in.");
    return account;
  }else{
    console.log("Child: login - account not logged in. Returning false.");
    return false;
  }
// remember .on is an alias for registerListener
}).on("deleteAccount", () => {
  console.log('Child: deleteAccount');
  sessionStorage.removeItem('account');
  return true;
}).on("editAccount", (accountInfo) => {
  if(accountInfo.data.password){
    accountInfo.data.password = accountInfo.data.password.hashCode();
  }
  console.log("Child: editAccount", accountInfo);
  let account = sessionStorage.getItem('account');
  if(account){
    account = JSON.parse(account);
    account.username = accountInfo.data.username;
    account.displayName = accountInfo.data.displayName;
    sessionStorage.setItem('account', JSON.stringify(account));
  }else{ //register
    sessionStorage.setItem('account', JSON.stringify(accountInfo.data));
    account = accountInfo;
  }
  console.log(account);
  return account;
}).on("getAccount", () => {
  const account = sessionStorage.getItem('account');
  if(account){
    console.log("Child: getAccount", account);
    return JSON.parse(account);
  } else {
    console.log('Child: getAccount - account not logged in');
  }
  return false;
});