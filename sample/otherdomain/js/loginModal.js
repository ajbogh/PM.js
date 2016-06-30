PM.addAuthorizedUrl('http://pmmain.local:8888');

function closeModal(event){
    event.stopPropagation();

    console.log(window.location.href, PM._handlers);

    PM.send('parent', 'closeModal');

    return false;
}

function login(event){
    //perform some async call with the authentication API
    //mock data response
    var userInfo = {
        username: 'test',
        gender: 'M',
        dob: '1982-01-01',
        firstName: 'John',
        lastname: 'Doe',
        email: 'jdoe@test.com'
    };

    PM.send('parent', 'authorizeUser', userInfo);
    closeModal(event);
}