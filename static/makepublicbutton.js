document.addEventListener('DOMContentLoaded', (e) => {
    execute();
});

function execute(){
    var button = document.getElementById("buttonPublic");

    button.addEventListener("click", async () => {
        var res = await fetch("/public/" + $('#mapdata').data().mapid, {method: "POST"});
        console.log(res)
        if (res.ok) location.reload();
    });
}