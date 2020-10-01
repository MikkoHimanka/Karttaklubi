if (document.getElementById("hidden") != null && document.getElementById("newmapButton")){
    var button = document.getElementById("newmapButton");
    var divi = document.getElementById("hidden");
}

function checkCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) return parts[1];
}

button.addEventListener("click", () => {
    button.style.display = "none";
    divi.style.display = "inline"
})

if (checkCookie("alert") === "empty_mapname") {
    button.style.display = "none";
    divi.style.display = "inline"
}