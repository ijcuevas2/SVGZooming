var matrix = this.identityMatrix;
var identityMatrix = "matrix(1 0 0 1 0 0)";
var zoomInScale = 1.25;
var zoomOutScale = 0.8;
var svgContainer = {
    element: document.getElementById("svgContainer"),
    get elem(){
        return this.element;
    },
    get rect() {
        return this.elem.getBoundingClientRect();
    }, 
    get width() {
        return this.rect.width;
    }, 
    get height() {
        return this.rect.height;
    },
    set width(val) {
        this.element.style.width = val;
    }, 
    set height(val) {
        this.element.style.height = val;
    },
    get left() {
        return this.rect.left;
    },
    get top() {
        return this.rect.top;
    },
    get hasScrollbar() {
        // source: https://stackoverflow.com/questions/1768667/to-find-out-if-a-div-has-a-scrollbar
        let verticalScrollbar = this.element.clientHeight < this.element.scrollHeight;
        let horizontalScrollbar = this.element.clientWidth < this.element.scrollWidth;
        return verticalScrollbar || horizontalScrollbar;
    },
    set scrollLeft(val) {
        this.element.scrollLeft = val;
    }, 
    set scrollTop(val) {
        this.element.scrollTop = val;
    }
}

var svgDocument = {
    element: document.getElementById("svgDocument"),
    get elem() {
        return this.element;
    },
    get rect() {
        return this.element.getBoundingClientRect();
    }, 
    get width() {
        return this.rect.width;
    }, 
    get height() {
        return this.rect.height;
    },
    set width(val) {
        this.element.style.width = val;
    }, 
    set height(val) {
        this.element.style.height = val;
    },
    get left() {
        return this.rect.left;
    },
    get top() {
        return this.rect.top;
    },
}

var contentGroup = {
    element: document.getElementById("contentGroup"),
    get elem() {
        return this.element;
    },
    get matrix() {
        let transformStr = this.element.getAttribute("transform");
        return transformStr.slice(7, -1).split(',').map(x => Number(x));
    },
    set matrix(val) {
        let transformStr = `matrix(${val})`;
        this.element.setAttribute("transform", transformStr);
    }
} 

function getPointerDocumentPos(e)  {
    let posX = e.clientX - this.svgDocument.left;
    let posY = e.clientY - this.svgDocument.top;
    return [posX, posY];
}

function getPointerRelativePos(e)  {
    let [ptrX, ptrY] = this.getPointerDocumentPos(e);
    let relativeX = ptrX / svgDocument.width;
    let relativeY = ptrY / svgDocument.height;
    return [relativeX, relativeY];
}

function scaleSVGDocument(scale) {
    this.svgDocument.width *= scale;
    this.svgDocument.height *= scale;
}

function scaleTransformMatrix(scale) {
    this.contentGroup.matrix = contentGroup.matrix.map(x => x * scale);
}

function containerPosition(relX, relY) {
    let absX = relX * this.svgDocument.width;
    let absY = relY * this.svgDocument.height;
    let diffX = svgContainer.left - svgDocument.left;
    let diffY = svgContainer.top - svgDocument.top;
    let containerX = absX - diffX;
    let containerY = absY - diffY;
    return [containerX, containerY];
}

function scaleGraphic(scale) {
    this.scaleSVGDocument(scale);
    this.scaleTransformMatrix(scale);
}

function zoom(scale, relX, relY) {
    let [containerX, containerY] = this.containerPosition(relX, relY);
    this.scaleGraphic(scale);

    let newPercentX = containerX / this.svgDocument.width;
    let newPercentY = containerY / this.svgDocument.height;
    let diffX = (relX - newPercentX) * this.svgDocument.width; 
    let diffY = (relY - newPercentY) * this.svgDocument.height;

    this.svgContainer.scrollLeft = diffX;
    this.svgContainer.scrollTop = diffY;
}

this.svgContainer.elem.addEventListener("wheel", e => {
    if (e.ctrlKey === false) {
        return;
    }

    e.preventDefault();
    let [relX, relY] = this.getPointerRelativePos(e);
    
    if (e.deltaY < 0) {
        this.zoom(this.zoomInScale, relX, relY);
    } 
    
    if (e.deltaY > 0) {
        this.zoom(this.zoomOutScale, relX, relY);
    }
});
