const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxOriginalSize = 8 * 1024 * 1024
const outputType = 'image/jpeg'
const outputQuality = 0.82
const maxDimension = 1200
const outputType = 'image/jpeg'
const outputQuality = 0.72
const maxDimension = 1000

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível ler a imagem selecionada.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Não foi possível otimizar a imagem.'))
          return
        }
        resolve(blob)
      },
      outputType,
      outputQuality,
    )
  })
}

export function validateImageFile(file) {
  if (!file) return ''
  if (!acceptedImageTypes.includes(file.type)) {
    return 'Selecione uma imagem nos formatos JPG, PNG ou WebP.'
  }
  if (file.size > maxOriginalSize) {
    return 'A imagem deve ter no máximo 8 MB antes da otimização.'
  }
  return ''
}

export async function optimizeProductImage(file) {
  const validationError = validateImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const image = await loadImageFromFile(file)
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Seu navegador não conseguiu processar a imagem.')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const blob = await canvasToBlob(canvas)
  const optimizedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-otimizada.jpg`, {
    type: outputType,
    lastModified: Date.now(),
  })

  return {
    file: optimizedFile,
    previewUrl: URL.createObjectURL(blob),
    originalSize: file.size,
    optimizedSize: optimizedFile.size,
    width,
    height,
  }
}
