function applyColor(imageData, i, [r,g,b]) {
    imageData.data[4*i] = r;        //R
    imageData.data[4*i + 1] = g;    //G
    imageData.data[4*i + 2] = b;    //B
    imageData.data[4*i + 3] = 255;  //A
};

function createImage(context, imageData) {
    rowLength = Math.sqrt(jdata.length);

    for (let i = 0; i < jdata.length; i++) {
        dataEntity = jdata[i];

        v1 = i-1 < 0 ?
            dataEntity - (jdata[i+1] - dataEntity) :
            jdata[i-1];
        v2 = i+1 >= jdata.length ?
            dataEntity - (jdata[i-1] - dataEntity) :
            jdata[i+1];
        v3 = i-rowLength < 0 ? 
            dataEntity - (jdata[i+rowLength] - dataEntity) :
            jdata[i-rowLength];
        v4 = i+rowLength >= data.length ?
            dataEntity - (jdata[i-rowLength] - dataEntity) :
            jdata[i+rowLength]

        normal = [(2*(v2-v1))/4, (2*(v4-v3))/4, -1];
        var color;

        if (dataEntity == 0) {
            color = [0, 182, 207];
        } else if (dataEntity <= 4) {
            color = [148, 218, 255];
        } else if (dataEntity <= 12) {
            color = [219, 207, 136];
        } else if (dataEntity <= 15) {
            color = [219, 204, 103];
        } else if (dataEntity <= 20) {
            color = [176, 212, 99];
        } else if (dataEntity <= 25) {
            color = [125, 191, 54];
        } else if (dataEntity <= 50) {
            color = [55, 163, 16];
        } else if (dataEntity <= 7) {
            color = [115,115,115];
        } else {
            color = [95,95,95];
        } 
        
        var normalSum = normal[0] + normal[1];

        if ((normalSum < 0) && dataEntity > 4) {
            color = [color[0]+normalSum*5,
                color[1]+normalSum*5,
                color[2]+normalSum*5]
        }
        
        applyColor(imageData, i, color);
    }
    context.putImageData(imageData, 0, 0);
};


var indeksi = 0;
var data = $('#mapdata').data();
var mapcollection = data.mapcollection;

var submaps = data.submaps;

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