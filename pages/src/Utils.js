
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => { resolve(reader.result); });
    
        reader.addEventListener("error", (e) => { reject(e); })

        reader.readAsDataURL(file);
    });
}

/**
 * 
 * @param {*} file 
 * @returns 
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            resolve(reader.result);
        }, false);

        reader.addEventListener('error', (err) => {
            reject(err);
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        } else {
            reject(new Error('NO FILE FOUND'));
        }
    })
}

/**
 * 
 * @param {*} url or url-based imageData
 * @returns 
 */
function readImage(url) {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = (e) => {
            resolve(image);
        }

        image.onerror = (e) => {
            reject(err)
        }

        image.src = url;
    })
}

/**
 * 
 * @param {*} ev 
 * @param {*} reg 
 * @returns 
 */
function getDatatransferFiles(ev, kind = 'file', reg) {
    let files = [];

    if(ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items].filter((item) => item.kind === kind)
        .map((item) => item.getAsFile())
    } else {
        files = ev.dataTransfer.files;
    }

    const image_reg = reg || /^image\/(jpg|jpeg|png|webp)$/i;
    // We make sure that the files received are images by checking the mime type of the file
    
    return files.filter((file) => file.type.trim().match(image_reg));
}

/**
 * Calls the callback function passed as 1st parameters with the given arguments (params).
 * The function is called after checking that it is not undefined or null
 * @param {*} callback 
 * @param {*} params 
 */
function callback(callback, params) {
    if(callback) callback(params);
}

export { callback, getDatatransferFiles, readFile, readImage }