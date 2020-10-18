const lock = document.getElementById("lock");

function applyColor(imageData, i, [r,g,b]) {
    imageData.data[4*i] = r;        //R
    imageData.data[4*i + 1] = g;    //G
    imageData.data[4*i + 2] = b;    //B
    imageData.data[4*i + 3] = 255;  //A
};

function Interpolate(value1, value2, step, steps) {
    return (value2 - value1) * step / steps + value1;
}

function Interpolate2Colors(color1, color2, step, steps) {
    return [Interpolate(color1[0],color2[0], step, steps),
        Interpolate(color1[1], color2[1], step, steps),
        Interpolate(color1[2], color2[2], step, steps)];
}

function RgbToHsl(arr) {
    //From wikipedia
    r = arr[0]/255;
    g = arr[1]/255;
    b = arr[2]/255;

    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0;
    } else {
        var delta = max - min;
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        if (max == r) {
            h = (g - b) / delta + (g < b ? 6 : 0);
        } else if (max == g) {
            h = (b -r) / delta + 2;
        } else {
            h = (r- g) / delta + 4;
        }
        h /= 6;
    }
    return [(h*360), (s*100), (l*100)];
}

function HslToRgb(arr){
    h = arr[0]/360;
    s = arr[1]/100;
    l = arr[2]/100;

    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}

function createImage(data, context, imageData, locked) {
    rowLength = Math.sqrt(data.length);

    for (let i = 0; i < data.length; i++) {
        dataEntity = data[i];

        v1 = i-1 < 0 ?
            dataEntity - (data[i+1] - dataEntity) :
            data[i-1];
        v2 = i+1 >= data.length ?
            dataEntity - (data[i-1] - dataEntity) :
            data[i+1];
        v3 = i-rowLength < 0 ? 
            dataEntity - (data[i+rowLength] - dataEntity) :
            data[i-rowLength];
        v4 = i+rowLength >= data.length ?
            dataEntity - (data[i-rowLength] - dataEntity) :
            data[i+rowLength]

        normal = [(2*(v2-v1))/4, (2*(v4-v3))/4, -1];
        var color;

        switch (true) {
            case (dataEntity == 0):
                    color = [0, 182, 207];
                    break;
                case (dataEntity < 10):
                    color1 = RgbToHsl([0, 182, 207]);
                    color2 = RgbToHsl([141, 234, 246]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-1, 9));
                    break;
                case (dataEntity < 20):
                    color1 = RgbToHsl([234, 223, 158]);
                    color2 = RgbToHsl([219, 207, 136]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-10, 10));
                    break;
                case (dataEntity < 50):
                    color1 = RgbToHsl([219, 207, 136]);
                    color2 = RgbToHsl([125, 191, 54]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-20, 30));
                    break;
                case (dataEntity < 100):
                    color1 = RgbToHsl([125, 191, 54]);
                    color2 = RgbToHsl([55, 163, 16]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-50, 50));
                    break;
                case (dataEntity < 125):
                    color1 = RgbToHsl([55, 163, 16]);
                    color2 = RgbToHsl([115, 145, 102]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-100, 25));
                    break;
                case (dataEntity < 200):
                    color1 = RgbToHsl([115, 145, 102]);
                    color2 = RgbToHsl([196, 196, 196]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-125, 75));
                    break;
                case (dataEntity < 255):
                    color1 = RgbToHsl([196, 196, 196]);
                    color2 = RgbToHsl([225, 228, 237]);
                    color = HslToRgb(Interpolate2Colors(color1, color2, dataEntity-200, 55));
                    break;
                case (dataEntity >= 255):
                    color = [225, 228, 237];
                    break;
        }

        var normalSum = normal[0] + normal[1];
        
        if ((dataEntity > 9)) {
            color = [color[0]+normalSum*5,
                color[1]+normalSum*5,
                color[2]+normalSum*5]
        }

        applyColor(imageData, i, color);
    }
    context.putImageData(imageData, 0, 0);
    if (locked) {
        context.drawImage(lock, 0, 0, 256, 256);
    }
}

var indeksi = 0;
var data = $('#mapdata').data();
var editables = data.editables;
var mapcollection = data.mapcollection;

var submaps = data.submaps;

var parent = document.getElementById("mapsWrapper");

var cellWidth = mapcollection.length > mapcollection[0].length ?
    (parent.offsetHeight/mapcollection.length) :
    (parent.offsetHeight/mapcollection[0].length);

window.addEventListener('load', (e) => {
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
            var locked = editables[indeksi] == 1 ? false : true;
            var jdata = submaps[indeksi]
            var canvas = document.createElement("canvas");
            canvas.setAttribute("width", 256)
            canvas.setAttribute("height", 256)
            canvas.style.width = cellWidth + "px"
            canvas.style.height = cellWidth + "px"
            canvas.style.border = "1px solid #000"
            if (locked) {
                row.appendChild(canvas)
            } else {
                node.appendChild(canvas);
                row.appendChild(node);
            }
            var context = canvas.getContext('2d');
            var imageData = context.createImageData(Math.sqrt(jdata.length), Math.sqrt(jdata.length));
            createImage(jdata, context, imageData, locked);
            indeksi++;
        }
    };
});