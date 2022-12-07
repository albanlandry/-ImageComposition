
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => { resolve(reader.result); });
    
        reader.addEventListener("error", (e) => { reject(e); })

        reader.readAsDataURL(file);
    });
}