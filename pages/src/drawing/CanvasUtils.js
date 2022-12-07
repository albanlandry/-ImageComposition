/**
 * 
 * @param {*} canvas 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function windowToCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect();
    
    // Not only does windowToCanvas() subtract the left and top of the canvas’s bounding box 
    // from the x and y window coordinates, it also scales those coordinates when the canvas element’s size 
    // differs from the size of the drawing surface.
    return { 
        x: x - bbox.left * (canvas.width  / bbox.width),
        y: y - bbox.top  * (canvas.height / bbox.height)
    };
}

export { windowToCanvas };