// netlify/functions/cloudinary-signature.js
const cloudinary = require('cloudinary').v2

exports.handler = async (event) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  const timestamp = Math.round(new Date().getTime() / 1000)
  const params_to_sign = {
    timestamp: timestamp,
    folder: 'galleries'
  }

  const signature = cloudinary.utils.api_sign_request(
    params_to_sign,
    process.env.CLOUDINARY_API_SECRET
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    })
  }
}
