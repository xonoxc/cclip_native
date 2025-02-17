/*
 * helper function to convert image uri to blob
 */

export function convertURItoBlob(uri: string, type: string): Blob {
   const base64Image = uri.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
   const binary = atob(base64Image)
   const array = []
   for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i))
   }
   return new Blob([new Uint8Array(array)], { type })
}
