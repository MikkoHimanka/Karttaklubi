document.addEventListener('DOMContentLoaded', (e) => {
    execute();
});

function execute() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(Math.sqrt(data.length), Math.sqrt(data.length));

    var showHeightMap = false;
    var prevMouse = [99999999,99999999];
    var hold;
    var size;
    var flow;
    var intensity;
    var noise;

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
            
            applyColor(i, color);
        }
        context.putImageData(imageData, 0, 0);
    }
    createImage();
    
    canvas.onmousedown = function (e) {
        flow = document.getElementById('flow').value/100;
        size = document.getElementById('size').value/1;
        intensity = document.getElementById('intensity').value/100;
        noise = document.getElementById('noise').value/1;
        
        draw(e, size, intensity, noise);
        hold = true;
    }

    canvas.onmousemove = function (e) {
        cursorSize = document.getElementById('size').value/1;
        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;

        if (cursor.style.display == "hidden") {
            cursor.style.display = "block";
        }
        cursor.style.transform = `translate(${e.clientX - (cursorSize + 1)}px, ${e.clientY - (cursorSize + 1)}px)`;

        movedEnough = (Math.abs(Math.floor((e.clientX - container.left)) - Math.floor((prevMouse[0] - container.left))) > ratio/flow) ||
            (Math.abs(Math.floor((e.clientY - container.top)) - Math.floor((prevMouse[1] - container.top))) > ratio/flow);

        if (hold && movedEnough) {
            prevMouse = [e.clientX, e.clientY]
            draw(e, size, intensity, noise);
        }
    }

    canvas.onmouseenter = function (e) {
        cursorSize = document.getElementById('size').value * 2 + 2;
        cursor.style.width = cursorSize + "px";
        cursor.style.height = cursorSize + "px";
        cursor.style.display = "block";
    }

    canvas.onmouseleave = function (e) {
        cursor.style.display = "none"
    }

    document.onmouseup = function () {
        hold = false;
    }


    function draw(e, size, intensity, noise) {

        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;
        
        column = Math.floor((e.clientX - container.left)/ratio);
        row = Math.floor((e.clientY - container.top)/ratio);

        startRow = row - Math.floor(size/2-1);
        startColumn = column - Math.floor(size/2-1)

        targetIndex = column + (row*canvas.height);


        for (var y = 0; y < (size+1); y++) {
            for (var x = 0; x < (size+1); x++) {
                var editIndex = (startColumn + y) + ((startRow + x)*canvas.height);
                if (editIndex >= 0 && editIndex < data.length) {
                    value = size/2 - Math.floor(size - Math.sqrt(Math.abs((x-size/2)**2 + (y-size/2)**2 - (size-size/4)**2)));
                    value += Math.round(value * (Math.random()-0.5)*(noise/50));
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