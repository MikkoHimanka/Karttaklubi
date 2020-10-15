document.addEventListener('DOMContentLoaded', (e) => {
    execute();
});

function execute() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(Math.sqrt(data.length), Math.sqrt(data.length));
    const brushTools = document.getElementById('brushTools');
    const smoothTools = document.getElementById('smoothTools');


    var showHeightMap = false;
    var prevMouse = [99999999,99999999];
    var hold;
    var size;
    var flow;
    var intensity;
    var noise;
    var carve;
    var flipped = false;
    var shift = false;
    
    const cursor = document.getElementById("cursor");

    function applyColor(i, [r,g,b]) {
        imageData.data[4*i] = r;        //R
        imageData.data[4*i + 1] = g;    //G
        imageData.data[4*i + 2] = b;    //B
        imageData.data[4*i + 3] = 255;  //A


    }

    function createHeightMap() {
        for (let i = 0; i < data.length; i++) {
            dataEntity = data[i];
            applyColor(i, [dataEntity,dataEntity,dataEntity]);
        }
        context.putImageData(imageData, 0, 0);
    } 

    function Interpolate(value1, value2, step, steps) {
        return (value2 - value1) * step / steps + value1;
    }

    function RgbToHsl(r,g,b) {
        //From wikipedia
        r /= 255;
        g /= 255;
        b /= 255;

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

    function HslToRgb(h, s, l){
        //From wikipedia
        h /= 360;
        s /= 100;
        l /= 100;

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

    function createImage() {
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
                case (dataEntity < 5):
                    color1 = RgbToHsl(0, 182, 207);
                    color2 = RgbToHsl(148, 218, 255);
                    color = HslToRgb(Interpolate(color1[0],color2[0], dataEntity, 4),
                        Interpolate(color1[1], color2[1], dataEntity, 4),
                        Interpolate(color1[2], color2[2], dataEntity, 4));
                    break;
                case (dataEntity < 10):
                    color1 = RgbToHsl(234, 223, 158);
                    color2 = RgbToHsl(219, 207, 136);
                    color = HslToRgb(Interpolate(color1[0],color2[0], dataEntity-4, 5),
                        Interpolate(color1[1], color2[1], dataEntity-4, 5),
                        Interpolate(color1[2], color2[2], dataEntity-4, 5));
                    break;
                case (dataEntity < 25):
                    color1 = RgbToHsl(219, 207, 136);
                    color2 = RgbToHsl(125, 191, 54);
                    color = HslToRgb(Interpolate(color1[0],color2[0], dataEntity-10, 15),
                        Interpolate(color1[1], color2[1], dataEntity-10, 15),
                        Interpolate(color1[2], color2[2], dataEntity-10, 15));
                    break;
                case (dataEntity < 50):
                    //color1 = RgbToHsl(158, 163, 234);
                    color1 = RgbToHsl(125, 191, 54);
                    color2 = RgbToHsl(55, 163, 16);
                    color = HslToRgb(Interpolate(color1[0],color2[0], dataEntity-25, 25),
                        Interpolate(color1[1], color2[1], dataEntity-25, 25),
                        Interpolate(color1[2], color2[2], dataEntity-25, 25));
                    break;
                case (dataEntity >= 50):
                    color = [255,255,255];
            }

            var normalSum = normal[0] + normal[1];

            
            if ((dataEntity)) {
                color = [color[0]+normalSum*5,
                    color[1]+normalSum*5,
                    color[2]+normalSum*5]
            }

            applyColor(i, color);
        }
        context.putImageData(imageData, 0, 0);
    }
    createImage();
    
    document.onkeydown = function (e) {
        if (e.key == "Alt") {
            flipped = true;
        }
        if (e.key == "Shift" && !flipped) {
            shift = true;

            brushTools.style.display = 'none';
            smoothTools.style.display = 'block';
        }
    }

    document.onkeyup = function (e) {
        if (e.key == "Alt") {
            flipped = false;
        }
        if (e.key == "Shift") {
            shift = false;

            brushTools.style.display = 'block';
            smoothTools.style.display = 'none';
        }
    }


    canvas.onmousedown = function (e) {

        if (!shift) {
            flow = document.getElementById('brushFlow').value/100;
            size = document.getElementById('brushSize').value/1;
            carve = document.getElementById('carve').checked;
            intensity = document.getElementById('brushIntensity').value/100;
            noise = document.getElementById('brushNoise').value/1;
        } else {
            intensity = document.getElementById('smoothIntensity').value/100;
            size = document.getElementById('smoothSize').value/1;
            flow = document.getElementById('smoothFlow').value/100;
            noise = 0;
            carve = false;
        }

        if (carve) {
            intensity *= -1;
        }
        
        if (flipped) {
            intensity *= -1;
        }

        if (!shift) {
            draw(e, size, intensity, noise);
        } else {
            smooth(e, size, intensity);
        } 
        hold = true;
    }

    canvas.onmousemove = function (e) {
        if (!shift) {
            cursorSize = document.getElementById('brushSize').value/1;
        } else {
            cursorSize = document.getElementById('smoothSize').value/1;
        }
        cursor.style.width = cursorSize*2+4 + "px";
        cursor.style.height = cursorSize*2+4 + "px";
        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;

        cursor.style.transform = `translate(${e.clientX - cursorSize + 1}px, ${e.clientY - cursorSize + 1}px`;

        movedEnough = (Math.abs(Math.floor((e.clientX - container.left)) - Math.floor((prevMouse[0] - container.left))) > ratio/flow) ||
            (Math.abs(Math.floor((e.clientY - container.top)) - Math.floor((prevMouse[1] - container.top))) > ratio/flow);

        if (hold && movedEnough) {
            prevMouse = [e.clientX, e.clientY]
            if (!shift) {
                draw(e, size, intensity, noise);
            } else {
                smooth(e, size, intensity);
            }
        }

        //
        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;
        
        column = Math.floor((e.clientX - container.left)/ratio);
        row = Math.floor((e.clientY - container.top)/ratio);
        targetIndex = column + (row*canvas.height);
        console.log()
    }

    canvas.onmouseenter = function (e) {

        cursor.style.display = "block";
    }

    canvas.onmouseleave = function (e) {
        cursor.style.display = "none"
    }

    document.onmouseup = function () {
        hold = false;
    }


    function smooth(e, size, intensity) {
        var container = canvas.getBoundingClientRect();
        var ratio = container.height/canvas.height;
        
        var column = Math.floor((e.clientX - container.left)/ratio);
        var row = Math.floor((e.clientY - container.top)/ratio);
        
        var targetIndex = column + (row*canvas.height);
        var startRow = row - Math.floor(size/2-1);
        var startColumn = column - Math.floor(size/2-1)


        
        for (var y = 0; y < (size+1); y++) {
            for (var x = 0; x < (size+1); x++) {
                var editIndex = (startColumn + y) + ((startRow + x)*canvas.height);
                var editRow = Math.floor(editIndex/canvas.height);
                var workRow = startRow + x;
                if (editIndex >= 0 && editIndex < data.length && editRow == workRow) {
                    
                    neighbours = [];

                    checkLeft = Math.floor((editIndex-1)/canvas.height) == workRow;
                    checkRight = Math.floor((editIndex+1)/canvas.height) == workRow;

                    if (checkLeft) {
                        neighbours.push(data[editIndex-1])
                    }
                    if (checkRight) {
                        neighbours.push(data[editIndex+1])
                    }
                    if ((editIndex + Math.sqrt(data.length) < data.length)) {
                        neighbours.push(data[editIndex + Math.sqrt(data.length)])
                        if (checkLeft) {
                            neighbours.push(data[editIndex-1 + Math.sqrt(data.length)])
                        }
                        if (checkRight) {
                            neighbours.push(data[editIndex+1 + Math.sqrt(data.length)])
                        }

                    }
                    if ((editIndex - Math.sqrt(data.length) >= 0)) {
                        neighbours.push(data[editIndex - Math.sqrt(data.length)])
                        if (checkLeft) {
                            neighbours.push(data[editIndex-1 - Math.sqrt(data.length)])
                        }
                        if (checkRight) {
                            neighbours.push(data[editIndex+1 - Math.sqrt(data.length)])
                        }
                    }

                    function Sum(total, n) {
                        return total + n;
                    }


                    average = neighbours.reduce(Sum, 0)/neighbours.length;

                    value = size/2 - Math.floor(size - Math.sqrt(Math.abs((x-size/2)**2 + (y-size/2)**2 - (size-size/4)**2)));
                    value = value < 1 ? 0 : value;
                    maxValue = size/2 - Math.floor(size - Math.sqrt(Math.abs((size/4)**2 + (size/4)**2 - (size-size/8)**2)));
                    
                    data[editIndex] += (average - data[editIndex]) * intensity/100 * (value/(maxValue));
                    data[editIndex] = Math.floor(data[editIndex]);
                }
            }
        }

        context.clearRect(0,0,canvas.width, canvas.height);
        
        if (showHeightMap) {
            createHeightMap();
        } else {
            createImage();
        }
    }

    function draw(e, size, intensity, noise) {

        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;
        
        column = Math.floor((e.clientX - container.left)/ratio);
        row = Math.floor((e.clientY - container.top)/ratio);
        targetIndex = column + (row*canvas.height);

        startRow = row - Math.floor(size/2-1);
        startColumn = column - Math.floor(size/2-1)



        for (var y = 0; y < (size+1); y++) {
            for (var x = 0; x < (size+1); x++) {
                var editIndex = (startColumn + y) + ((startRow + x)*canvas.height);
                var editRow = Math.floor(editIndex/canvas.height);
                if (editIndex >= 0 && editIndex < data.length && editRow == startRow+x) {
                    value = (size)/2 - Math.floor(size - Math.sqrt(Math.abs((x-size/2)**2 + (y-size/2)**2 - (size-size/4)**2)));
                    value += Math.floor(value * (Math.random()-0.5)*(noise/50));
                    value = value < 0 ? 0 : value;

                    data[editIndex] = (data[editIndex] + value * intensity < 0) ? 0 : data[editIndex] + value * intensity;
                }
            }
        }

        context.clearRect(0,0,canvas.width, canvas.height);
        
        if (showHeightMap) {
            createHeightMap();
        } else {
            createImage();
        }
    }
}