<script setup>
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const client = useSupabaseClient()
const config = useRuntimeConfig()

// Fetch gallery with images
const { data: gallery, refresh } = await useAsyncData('gallery', async () => {
  const { data } = await client
    .from('galleries')
    .select(`
      *,
      gallery_images (*)
    `)
    .eq('id', route.params.id)
    .single()
  return data
})

// Cloudinary widget
const cloudinaryLoaded = ref(false)
let widget = null

// Load Cloudinary script
onMounted(() => {
  if (!window.cloudinary) {
    const script = document.createElement('script')
    script.src = 'https://upload-widget.cloudinary.com/global/all.js'
    script.onload = () => {
      cloudinaryLoaded.value = true
    }
    document.head.appendChild(script)
  } else {
    cloudinaryLoaded.value = true
  }
})

// Open upload widget
async function openUploadWidget() {
  // Get config - use direct values in dev, function in production
  let cloudName, uploadPreset

  if (process.dev) {
    // Local dev - use runtime config directly
    cloudName = config.public.cloudinary.cloudName
    uploadPreset = config.public.cloudinary.uploadPreset
  } else {
    // Production - use Netlify function
    const response = await fetch('/.netlify/functions/cloudinary-config')
    const configData = await response.json()
    cloudName = configData.cloudName
    uploadPreset = configData.uploadPreset
  }

  if (!widget) {
    widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: 'galleries',
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 10,
        clientAllowedFormats: ['image'],
        maxImageFileSize: 5000000, // 5MB
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          }
        }
      },
      async (error, result) => {
        if (!error && result && result.event === 'success') {
          console.log('Upload successful:', result.info)

          // Save to Supabase
          await client.from('gallery_images').insert({
            gallery_id: route.params.id,
            cloudinary_id: result.info.public_id,
            url: result.info.secure_url
          })

          // Refresh gallery
          await refresh()
        }

        if (error) {
          console.error('Upload error:', error)
        }
      }
    )
  }

  widget.open()
}

// Delete image
async function deleteImage(image) {
  if (!confirm('Delete this image?')) return

  try {
    // Only call function in production
    if (!process.dev) {
      await fetch('/.netlify/functions/cloudinary-delete', {
        method: 'POST',
        body: JSON.stringify({ publicId: image.cloudinary_id })
      })
    }

    // Delete from Supabase
    await client
      .from('gallery_images')
      .delete()
      .eq('id', image.id)

    await refresh()
  } catch (error) {
    console.error('Delete error:', error)
    alert('Delete failed')
  }
}
</script>

<template>
  <div>
    <h1>{{ gallery?.title }}</h1>

    <!-- Upload Button -->
    <button
      @click="openUploadWidget"
      :disabled="!cloudinaryLoaded"
      class="upload-btn"
    >
      {{ cloudinaryLoaded ? 'Upload Images' : 'Loading...' }}
    </button>

    <!-- Image Grid -->
    <div class="image-grid">
      <div
        v-for="image in gallery?.gallery_images"
        :key="image.id"
        class="image-card"
      >
        <img :src="image.url" :alt="gallery.title">
        <button @click="deleteImage(image)" class="delete-btn">
          Delete
        </button>
      </div>
    </div>

    <p v-if="!gallery?.gallery_images?.length">
      No images yet. Click "Upload Images" to add some!
    </p>

    <NuxtLink to="/admin/galleries">← Back to Galleries</NuxtLink>
  </div>
</template>

<style scoped>
.upload-btn {
  background: #0078FF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin: 20px 0;
}

.upload-btn:hover {
  background: #0056CC;
}

.upload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.image-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 1);
}
</style>
