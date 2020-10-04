document.addEventListener('DOMContentLoaded', (e) => {
    execute();
});

function execute() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(Math.sqrt(data.length), Math.sqrt(data.length));

    var hold;

    var mouseX;
    var mouseY;

    function applyColor(i, [r,g,b]) {
        imageData.data[4*i] = r;        //R
        imageData.data[4*i + 1] = g;    //G
        imageData.data[4*i + 2] = b;  //B
        imageData.data[4*i + 3] = 255;  //A
    }

    function createImage() {
        for (let i = 0; i < data.length; i++) {
            dataEntity = data[i];
            if (dataEntity == 0) {
                applyColor(i, [0,0,255]);
            } else if (dataEntity <= 10) {
                applyColor(i, [245,230,66]);
            } else if (dataEntity <= 20) {
                applyColor(i, [72,117,8]);
            }
            
        }
        context.putImageData(imageData, 0, 0);
    }
    createImage();

    ///////////

    canvas.onmousedown = function (e) {
        // mouseX = e.clientX - canvas.offsetLeft;
        // mouseY = e.clientY - canvas.offsetTop;
        draw(e);
        hold = true;
    }

    canvas.onmousemove = function (e) {
        if (hold) {
            // mouseX = e.clientX - canvas.offsetLeft;
            // mouseY = e.clientY - canvas.offsetTop;
            draw(e);
        }
    }

    document.onmouseup = function () {
        hold = false;
    }


    function draw(e) {
        container = canvas.getBoundingClientRect();
        ratio = container.height/canvas.height;
        
        column = Math.floor((e.clientX - container.left)/ratio);
        row = Math.floor((e.clientY - container.top)/ratio);
        
        targetIndex = column + (row*canvas.height);
        
        data[targetIndex] = data[targetIndex] + 2;


        if ((targetIndex + 1) <= data.length) {
            data[column + 1 + (row*canvas.height)]++;
        };
        if ((targetIndex - 1) >= 0) {
            data[column + (row*canvas.height) - 1]++;
        };

        if ((column + ((row+1)*canvas.height)) <= data.length) {
            data[(column + ((row+1)*canvas.height))]++;
        };
        if ((column + ((row-1)*canvas.height)) >= 0) {
            data[(column + ((row-1)*canvas.height))]++;
        };

        context.clearRect(0,0,canvas.width, canvas.height);
        createImage();
    }
}