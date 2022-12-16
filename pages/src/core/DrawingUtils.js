import Victor from 'victor';

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
  * 
  * @param {*} index 
  * @returns 
  */
function cursors(index) {
   let cursor = "default";

   switch (index) {
      case 0: 
         cursor = 'nw-resize';
         break;
      case 1: 
         cursor = 'ne-resize';
         break;
      case 2: 
         cursor = 'sw-resize';
         break;
      case 3:
         cursor = 'se-resize'; 
         break;
      case 4: 
      case 5: 
         cursor = 'ns-resize';
         break;
      case 6: 
      case 7:
         cursor = 'ew-resize';
         break;
   }  

   return cursor;
 }

 /**
 * 
 * @param {x: y:} mouse 
 * @param {Number} threshold 
 * @returns 
 */
function checkCorner(mouse, threshold, bounds) {
   const sensitiveArea = threshold / 2;
   const cWidth = bounds.width + bounds.x;
   const cHeight = bounds.height + bounds.y;
   const midWith = bounds.width/2 + bounds.x;
   const midHeight = bounds.height/2 + bounds.y;
   
   // Corners coordinates 
   const topLeftBounds = { x: bounds.x - sensitiveArea, y: bounds.y - sensitiveArea, width: threshold, height: threshold };
   const topRightBounds = { x: cWidth - sensitiveArea, y: bounds.y - sensitiveArea, width: threshold, height: threshold };
   const bottomRightBounds = { x: bounds.x - sensitiveArea, y: cHeight - sensitiveArea, width: threshold, height: threshold };
   const bottomLeftBounds = { x: cWidth - sensitiveArea, y: cHeight - sensitiveArea, width: threshold, height: threshold };
   const middleTop = { x: midWith - sensitiveArea, y: bounds.y - sensitiveArea, width: threshold, height: threshold } , 
   middleBottom = { x: midWith - sensitiveArea, y: cHeight - sensitiveArea, width: threshold, height: threshold }, 
   middleLeft = { x: bounds.x - sensitiveArea, y: midHeight - sensitiveArea, width: threshold, height: threshold }, 
   middleRight = { x: cWidth - sensitiveArea, y: midHeight - sensitiveArea, width: threshold, height: threshold };

   let hit = -1;
   if (isPointInRect(topLeftBounds, new Victor(mouse.x, mouse.y))) {
       hit = 0;
   }

   if (isPointInRect(topRightBounds, new Victor(mouse.x, mouse.y))) {
       hit = 1;
   }

   if (isPointInRect(bottomRightBounds, new Victor(mouse.x, mouse.y))) {
       hit = 2;
   }
       
   if (isPointInRect(bottomLeftBounds, new Victor(mouse.x, mouse.y))) {
       hit = 3;
   }

   if (isPointInRect(middleTop, new Victor(mouse.x, mouse.y))) {
      hit = 4;
   }

   if (isPointInRect(middleBottom, new Victor(mouse.x, mouse.y))) {
      hit = 5;
   }

   if (isPointInRect(middleRight, new Victor(mouse.x, mouse.y))) {
      hit = 6;
   }

   if (isPointInRect(middleLeft, new Victor(mouse.x, mouse.y))) {
      hit = 7;
   }

   return hit;
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
 
 export { isPointInRect, calculateAspectRatioFit, min, max, getCanvasImage, checkCorner, cursors};