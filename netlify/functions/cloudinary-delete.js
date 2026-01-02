import { v2 as cloudinary } from 'cloudinary'

export default async (event) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  const { publicId } = JSON.parse(event.body || '{}')

  try {
    const result = await cloudinary.uploader.destroy(publicId)

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(result)
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
