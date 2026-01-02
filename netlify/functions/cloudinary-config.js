exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
  }
}
