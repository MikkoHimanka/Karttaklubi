function applyColor(imageData, i, [r,g,b]) {
    imageData.data[4*i] = r;        //R
    imageData.data[4*i + 1] = g;    //G
    imageData.data[4*i + 2] = b;    //B
    imageData.data[4*i + 3] = 255;  //A
};

function createImage(context, imageData) {
    for (let i = 0; i < jdata.length; i++) {
        dataEntity = jdata[i];
        if (dataEntity == 0) {
            applyColor(imageData, i, [0,0,255]);
        } else if (dataEntity <= 10) {
            applyColor(imageData, i, [245,230,66]);
        } else if (dataEntity <= 20) {
            applyColor(imageData, i, [72,117,8]);
        }
        
    }
    context.putImageData(imageData, 0, 0);
};

var indeksi = 0;

var data = $('#mapdata').data()

var jdata = data.megadata


var parent = document.getElementById("mapsWrapper");

var cellWidth = mapcollection.length > mapcollection[0].length ?
    (parent.offsetHeight/mapcollection.length) :
    (parent.offsetHeight/mapcollection[0].length);

for (let i = 0; i < mapcollection.length; i++) {
    var row = document.createElement("div");
    row.style.width = "inherit"
    row.style.display = "flex"
    row.style.flexDirection = "row"
    row.style.marginTop = -10 + "px";

    parent.appendChild(row);
    for (let j = 0; j < mapcollection[i].length; j++) {
        console.log("DONE")
        var node = document.createElement("a");
        node.setAttribute("href", `/editor/${mapcollection[i][j]}`);
        var jdata = submaps[indeksi]
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", 64)
        canvas.setAttribute("height", 64)
        node.appendChild(canvas);
        canvas.style.width = cellWidth + "px"
        canvas.style.height = cellWidth + "px"
        canvas.style.border = "1px solid #000"
        row.appendChild(node);
        var context = canvas.getContext('2d');
        var imageData = context.createImageData(Math.sqrt(jdata.length), Math.sqrt(jdata.length));
        createImage(context, imageData);
        indeksi++;
    }
};