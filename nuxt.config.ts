// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    cloudinary: {
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    public: {
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
      }
    }
  },
  supabase: {
    types: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/events', '/about', '/contact', '/galleries', '/galleries/*']
    }
  },
  ui: {
    colorMode: false
  }
})
