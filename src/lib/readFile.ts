export async function readFile(file: Blob, type: 'dataURL' | 'text') {
  return new Promise<string | ArrayBuffer | null | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result)
    }

    if (type === 'dataURL') {
      reader.readAsDataURL(file)
    } else if (type === 'text') {
      reader.readAsText(file)
    }
  })
}
