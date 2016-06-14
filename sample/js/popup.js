PM.addAuthorizedUrl('http://pminner.local:8889');

function openPopup(event){
    event.preventDefault();

    document.getElementById('authResponse').innerHTML = "";

    //Format the URL so that the popup knows to communicate with a parent window.
    var popupUrl = PM.formatIframeUrl('otherdomain', 'http://pminner.local:8889/popup.html');
    var height = 500;
    var width = 800;
    var left = (window.innerWidth / 2) - (width / 2);
    var top = (window.innerHeight / 2) - (height / 2);
    window.open(popupUrl, 'otherdomain', 'height='+height+',width='+width+',left='+left+',top='+top);

    return false;
}

PM.on('authenticate', function(response){
    document.getElementById('authResponse').innerHTML = JSON.stringify(response.data, null, 2);
});