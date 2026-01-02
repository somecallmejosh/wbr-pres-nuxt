import { v2 as cloudinary } from 'cloudinary'

export default async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  const timestamp = Math.round(Date.now() / 1000)
  const params_to_sign = {
    timestamp,
    folder: 'galleries'
  }

  const signature = cloudinary.utils.api_sign_request(
    params_to_sign,
    process.env.CLOUDINARY_API_SECRET
  )

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    })
  }
}
