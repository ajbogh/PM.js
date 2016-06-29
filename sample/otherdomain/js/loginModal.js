PM.addAuthorizedUrl('http://pmmain.local:8888');

function closeModal(event){
    event.stopPropagation();

    console.log(window.location.href, PM._handlers);

    PM.send('parent', 'closeModal');

    return false;
}