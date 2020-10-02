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
            applyColor(i, [0,0,255]);
        } else if (dataEntity <= 10) {
            applyColor(i, [245,230,66]);
        } else if (dataEntity <= 20) {
            applyColor(i, [72,117,8]);
        }
        
    }
    context.putImageData(imageData, 0, 0);
};

var indeksi = 0;
var data = $('#mapdata').data();
console.log(data)
var mapcollection = JSON.parse(data.mapcollection);
console.log(mapcollection)
var submaps = data.submaps;
var parent = document.getElementById("mapsWrapper");
console.log(typeof mapcollection)

for (let i = 0; i < mapcollection[4].length; i++) {
    for (let j = 0; j < mapcollection[2][i]; j++) {
        console.log(mapcollection[2][i])
        var node = document.createElement("a");
        node.setAttribute("href", `/editor/${j}`);
        var jdata = submaps[indeksi]
        var canvas = document.createElement("canvas");
        node.appendChild(canvas);
        parent.appendChild(node);

        //canvas.setAttribute("id", j);
        var context = canvas.getContext('2d');
        var imageData = context.createImageData(Math.sqrt(jdata.length), Math.sqrt(jdata.length));
        createImage(context, imageData);
        indeksi++;
    }
};

        // {% for i in range(mapcollection[4]) %}
        //     {% for o in mapcollection[2][i] %}
                
        //             <a href=/editor/{{o}}><canvas id={{o}}>Update your browser to support HTML5 Canvas</canvas></a>
        //             <script>
        //                 var jdata = {{submaps}}[indeksi];
        //                 canvas = document.getElementById("{{o}}");
        //                 context = canvas.getContext('2d');
        //                 imageData = context.createImageData(Math.sqrt(jdata.length), Math.sqrt(jdata.length));
        //                 createImage();
        //                 indeksi++;
        //             </script>

        //     {% endfor %}

        // {% endfor %}