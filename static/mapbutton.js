if (document.getElementById("hidden") != null && document.getElementById("newmapButton")){
    var button = document.getElementById("newmapButton");
    var divi = document.getElementById("hidden");
}

button.addEventListener("click", () => {
    button.style.display = "none";
    divi.style.display = "inline"
})