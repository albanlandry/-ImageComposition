/**
 * Determines whether a point is inside the given rect
 * @param {Rect} rect
 * @param {Point} pt
 * @return {boolean} true if the point is inside the given rect
 */
 function isPointInRect(rect, pt) {
    return (pt.x > rect.x) && (pt.x < (Math.abs(rect.x) + Math.abs(rect.width)))
       && (pt.y > rect.y) && (pt.y < (Math.abs(rect.y) + Math.abs(rect.height)));
 }
 
 /**
  * Find the point which is the closest to the origin (0, 0) between p1 and p2
  * The origin is on the top-left corner of the rectangle
  * @param {*} p1
  * @param {*} p2
  * @returns
  */
 function min(p1, p2) {
    if (p1.dist() < p2.dist()) return p1;
 
    return p2;
 }
 
 /**
  * Find the point which is the furthest from the origin (0, 0) between p1 and p2
  * The origin is on the top-left corner of the rectangle
  * @param {*} p1
  * @param {*} p2
  * @returns
  */
 function max(p1, p2) {
    if (p1.dist() > p2.dist()) return p1;
 
    return p2;
 }
 
 
 /**
   * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
   * images to fit into a certain area.
   *
   * @param {Number} srcWidth width of source image
   * @param {Number} srcHeight height of source image
   * @param {Number} maxWidth maximum available width
   * @param {Number} maxHeight maximum available height
   * @return {Object} { width, height }
   */
 function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
 
 
    var ratioW = maxWidth / srcWidth;
    var ratioH = maxHeight / srcHeight;
    var ratio = Math.min(ratioW, ratioH);
 
    return {
       width: srcWidth * ratio, height: srcHeight * ratio,
       ratio: { x: ratioW, y: ratioH },
       inverseRatio: {
          x: srcWidth / maxWidth,
          y: srcHeight / maxHeight
       }
    };
 }
 
 /**
  * Returns the displayed on the canvas
  * @param {Canvas} canvas 
  * @returns 
  */
 function getCanvasImage(canvas) {
    return new Promise((success, failure) => {
       const image = new Image();
       image.onload = function (evt) {
          success(image, evt.target);
       };
 
       image.onerror = function(evt) {
          failure(evt);
       }
 
       image.src = canvas.toDataURL();
    });
 }
 
 export { isPointInRect, calculateAspectRatioFit, min, max, getCanvasImage};