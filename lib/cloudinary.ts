import { Cloudinary } from "@cloudinary/url-gen"

export const cloudinaryConfg = {
   cloud_name: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
}

export const cloud = new Cloudinary({
   cloud: {
      cloudName: cloudinaryConfg.cloud_name,
      apiKey: cloudinaryConfg.api_key,
      apiSecret: cloudinaryConfg.api_secret,
   },
   url: {
      secure: true,
   },
})
