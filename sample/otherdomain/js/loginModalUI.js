function LMUI(){}

LMUI.prototype.openModal = function(page){
    console.log("openModal");

    var modal = this.buildModal();
    this.navigateToPage(page);
};

LMUI.prototype.closeModal = function(){
    var modal = document.getElementById("lmui-modal");
    var bg = document.getElementById("lmui-modal-background");
    if(modal){
        modal.className = "";
        bg.className = "";
        //modal.style.display = "none";
        //bg.style.display = "none";
    }
};

LMUI.prototype.buildModal = function(){
    var self = this;
    var modal = document.getElementById("lmui-modal");
    var bg = document.getElementById("lmui-modal-background");
    if(!modal){
        modal = document.createElement('div');
        modal.id = "lmui-modal";

        var iframe = document.createElement('iframe');
        iframe.id = "lmui-iframe";
        iframe.frameBorder = 0;
        iframe.width = "100%";
        iframe.height = "100%";

        modal.appendChild(iframe);

        var closeBtnLink = document.createElement("a");
        closeBtnLink.innerHTML = "&#10006;";
        closeBtnLink.id = "lmui-close-button";
        closeBtnLink.href = "";
        closeBtnLink.onclick = function(){
            self.closeModal();
            return false;
        };

        modal.appendChild(closeBtnLink);

        var bg = document.createElement("div");
        bg.id = "lmui-modal-background";
        bg.height = "100%";
        bg.width = "100%";
        bg.style.position = "absolute";
        bg.style.top = 0;
        bg.style.left = 0;

        //modal.style.display = "none";
        //bg.style.display = "none";

        document.body.appendChild(bg);

        document.body.appendChild(modal);
    }

    // sets up the listener for the closeModal method
    var self = this;
    PM.on('closeModal', function(){
        self.closeModal();
    });

    PM.on("resizeIframe", function(response){
        console.log("resizing iframe to: "+response.data.width+"x"+response.data.height);
        var iframe = document.getElementById('lmui-iframe');
        var modal = document.getElementById('lmui-modal');
        var bg = document.getElementById("lmui-modal-background");

        iframe.style.height = response.data.height;
        //iframe.style.width = response.data.width;
        modal.style.height = iframe.style.height;

        modal.className = "lmui-modal-active";
        bg.className = "lmui-modal-active";
        //modal.style.display = "block";
        //bg.style.display = "block";
    });

    return modal;
};

LMUI.prototype.navigateToPage = function(page){
    var iframe = document.getElementById("lmui-iframe");
    var modal = document.getElementById('lmui-modal');
    var bg = document.getElementById("lmui-modal-background");
    var src = iframe.getAttribute("Src");
    var newSrc = PM.formatIframeUrl('modal', "http://pminner.local:8889/"+page+".html");
    if(src !== newSrc) {
        document.getElementById("lmui-iframe").setAttribute("src", PM.formatIframeUrl('modal', "http://pminner.local:8889/"+page+".html"));
    }else{
        modal.className = "lmui-modal-active";
        bg.className = "lmui-modal-active";
        //modal.style.display = "block";
        //bg.style.display = "block";
    }
};


LMUI.prototype.login = function(event){
    event.preventDefault();
    this.openModal("loginModal");
    return false;
};

LMUI.prototype.modifyUser = function(event){
    event.preventDefault();
    this.openModal("modifyUserModal");
    return false;
};
