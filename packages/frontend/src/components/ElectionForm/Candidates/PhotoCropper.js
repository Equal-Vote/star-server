export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return null
    }
    canvas.width = 300
    canvas.height = 300
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 300, 300)
    return new Promise((resolve) => {
        canvas.toBlob((file) => {
            resolve(file)
        }, 'image/jpeg')
    })
}
