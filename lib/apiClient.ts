import axios from "axios"

const apiServerURL = process.env.EXPO_PUBLIC_SERVER_URL

if (!apiServerURL) {
   throw new Error("Please set EXPO_PUBLIC_SERVER_URL in .env")
}

export const apiClient = axios.create({
   baseURL: apiServerURL,
})
