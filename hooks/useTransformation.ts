interface ITransformationArgs {
   width: number
   height: number
   aspectRatio: string
   publicID: string
}

type ImageURLstringObj = {
   url: string
}

const useImageTransformation = ({
   width,
   height,
   aspectRatio,
   publicID,
}: ITransformationArgs): ImageURLstringObj => {
   const baseURL = process.env.EXPO_PUBLIC_CLOUDINARY_FETCH_IMAGE_BASE_URL!
   if (!baseURL) {
      throw new Error(
         "Please set EXPO_PUBLIC_CLOUDINARY_FETCH_IMAGE_BASE_URL in .env"
      )
   }
   return {
      url: `${baseURL}/c_fit,w_${width},h_${height},ar_${aspectRatio}/${publicID}`,
   }
}

export { useImageTransformation }
