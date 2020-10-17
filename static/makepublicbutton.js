document.addEventListener('DOMContentLoaded', (e) => {
    execute();
});

function execute(){
    var button = document.getElementById("buttonPublic");
    var button2 = document.getElementById("buttonShared");

    button.addEventListener("click", async () => {
        var res = await fetch("/public/" + $('#mapdata').data().mapid, {method: "POST"});

        if (res.ok) location.reload();
    });
    button2.addEventListener("click", async () => {
        var res = await fetch("/share/" + $('#mapdata').data().mapid, {method: "POST"});

        if (res.ok) location.reload();
    });
}