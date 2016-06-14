PM.addAuthorizedUrl(['http://pmmain.local:8888', 'http://pminner.local:8889']);

var fakeUserInfo = {
    username: "JohnDoe1",
    age: "33",
    gender: "M",
    dob: "1982/11/01"
};

function authenticate(){
    console.log("test");
    PM.send('parent', 'authenticate', fakeUserInfo);

    window.close();
}