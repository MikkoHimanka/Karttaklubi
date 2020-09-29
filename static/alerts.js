document.addEventListener('DOMContentLoaded', (e) => {
    if (document.getElementById("alertBox") != null){
        document.cookie = "alert" + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Strict";
        alertBox = document.getElementById("alertBox");
        alertBox.style.left = window.innerWidth/2 - alertBox.clientWidth/2 +"px";
    }
})


function showDiv(){
    divY = alertBox.offsetTop;
    if (divY > 30) {
        clearInterval(showTimer);
        setTimeout(hideTimerFunc, 1000);
    }
    else {
        alertBox.style.top = divY + 1 + "px";
    }
}

function hideDiv(){
    divY = alertBox.offsetTop;
    if (divY < -40) {
        clearInterval(hideTimer);
    }
    else {
        alertBox.style.top = divY - 1 + "px";
    }
}


if (document.getElementById("alertBox")){
    showTimer = setInterval(showDiv, 1);
    var hideTimer;
    function hideTimerFunc(){
        hideTimer = setInterval(hideDiv, 1);
    }
}