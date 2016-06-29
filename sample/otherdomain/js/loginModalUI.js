function LMUI(){}

LMUI.prototype.openModal = function(page){
    console.log("openModal");

    var modal = this.buildModal();
    this.navigateToPage(page);
    modal.style.display = "block";
};

LMUI.prototype.closeModal = function(){
    var modal = document.getElementById("lmui-modal");
    var bg = document.getElementById("lmui-modal-background");
    if(modal){
        modal.style.display = "none";
        bg.style.display = "none";
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

        document.body.appendChild(bg);

        document.body.appendChild(modal);
    }else{
        modal.style.display = "block";
        bg.style.display = "block";
    }

    // sets up the listener for the closeModal method
    var self = this;
    PM.on('closeModal', function(){
        self.closeModal();
    });

    return modal;
};

LMUI.prototype.navigateToPage = function(page){
    document.getElementById("lmui-iframe").setAttribute("src", PM.formatIframeUrl('modal', "http://pminner.local:8889/"+page+".html"));
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
