import axios from "axios"
import { useRouter } from "expo-router"
import { useCallback, useState, useMemo } from "react"
import * as VideoPicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

type FormErrors = { [key: string]: string }

export function useVideoUploadScreen() {
   const [fileUri, setFileUri] = useState<string | null>(null)
   const [fileName, setFileName] = useState<string>("")
   const [fileSize, setFileSize] = useState<number>(0)
   const [title, setTitle] = useState<string>("")
   const [description, setDescription] = useState<string>("")
   const [isUploading, setIsUploading] = useState<boolean>(false)
   const [errors, setErrors] = useState<FormErrors>({
      title: "",
      description: "",
      File: "",
   })

   const router = useRouter()
   const MAX_FILE_SIZE = useMemo(() => 70 * 1024 * 1024, [])
   const cancelSource = axios.CancelToken.source()

   const isValidData = useCallback((): boolean => {
      const validationErrors: FormErrors = {}

      if (!title.trim()) {
         validationErrors.title = "Title is required"
      }

      if (!fileUri) {
         validationErrors.file = "File is required"
      }

      if (!description.trim()) {
         validationErrors.description = "Description is required"
      }

      setErrors(prev => ({ ...prev, ...validationErrors }))
      return Object.keys(validationErrors).length === 0
   }, [title, fileUri, description])

   const createVideo = useCallback(async () => {
      if (!isValidData()) return

      if (!fileUri) return

      setIsUploading(true)
      try {
         const formData = new FormData()

         formData.append("title", fileName)
         formData.append("description", description)
         formData.append("originalSize", fileSize.toString())

         const uploadResp = await FileSystem.uploadAsync(
            `${process.env.EXPO_PUBLIC_SERVER_URL!}/api/video-upload?title=${title}&description=${description}&originalSize=${fileSize}`,
            fileUri,
            {
               httpMethod: "POST",
               uploadType: FileSystem.FileSystemUploadType.MULTIPART,
               fieldName: "file",
            }
         )

         if (uploadResp.status === 200) {
            router.push("/video")
         }
      } catch (e) {
         console.error("Error uploading video:", e)
      } finally {
         setIsUploading(false)
      }
   }, [fileUri, title, description, isValidData, fileSize, fileName])

   const handleFilePick = async () => {
      try {
         const permission =
            await VideoPicker.requestMediaLibraryPermissionsAsync()
         if (!permission.granted) {
            alert("Permission to access media library is required!")
            return
         }

         const result = await VideoPicker.launchImageLibraryAsync({
            mediaTypes: "videos",
            allowsEditing: false,
            quality: 1,
         })

         if (result.canceled || !result.assets?.[0]?.uri) return

         const asset = result.assets[0]

         if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            setErrors(prev => ({
               ...prev,
               file: "File size exceeds 70MB limit",
            }))
            return
         }

         setFileUri(asset.uri)
         setFileName(asset.fileName || "")
         setFileSize(asset.fileSize || 0)
         setErrors(prev => ({ ...prev, file: "" }))
      } catch (e) {
         console.error("File pick error:", e)
         setErrors(prev => ({
            ...prev,
            file: "Failed to select video file",
         }))
      }
   }

   return {
      fileUri,
      setFileUri,
      fileName,
      setFileName,
      fileSize,
      setFileSize,
      isUploading,
      createVideo,
      setIsUploading,
      cancelSource,
      errors,
      setErrors,
      description,
      title,
      setTitle,
      setDescription,
      handleFilePick,
   }
}
