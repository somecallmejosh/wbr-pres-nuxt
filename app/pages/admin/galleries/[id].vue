<script setup>
import Draggable from 'vuedraggable'
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const toast = useToast()

// Fetch gallery with images
const { data: gallery, refresh } = await useAsyncData('gallery', async () => {
  const { data } = await client
    .from('galleries')
    .select(`
      *,
      gallery_images (*)
    `)
    .eq('id', route.params.id)
    .order('position', { foreignTable: 'gallery_images', ascending: true })
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
          const nextPosition = (gallery.value?.gallery_images?.length || 0) + 1
          await client.from('gallery_images').insert({
            gallery_id: route.params.id,
            cloudinary_id: result.info.public_id,
            url: result.info.secure_url,
            position: nextPosition
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

// Drag-and-drop reordering
const orderedImages = ref([])

watch(
  () => gallery.value?.gallery_images || [],
  (imgs) => {
    orderedImages.value = Array.isArray(imgs) ? [...imgs] : []
  },
  { immediate: true }
)

async function saveOrder() {
  if (!orderedImages.value?.length) return
  const galleryId = route.params.id
  const payload = orderedImages.value
    .filter((img) => !!img?.id)
    .map((img, idx) => ({ id: img.id, position: idx + 1 }))

  const { error } = await client.rpc('update_gallery_positions', {
    payload,
    p_gallery_id: galleryId
  })
  if (error) {
    console.error('Failed to save order', error)
    toast.add({ title: 'Save failed', description: error.message || 'Failed to save new order', color: 'error' })
    return
  }
  // Optimistically keep local order, then refresh from server
  if (gallery.value) {
    gallery.value.gallery_images = [...orderedImages.value]
  }
  await refresh()
  toast.add({ title: 'Order saved', color: 'success' })
}
</script>

<template>
  <admin-inner-wrapper :title="gallery?.title" description="Manage photos in this gallery" v-if="gallery">
    <!-- Image Grid with Drag-and-Drop -->
    <Draggable v-model="orderedImages" item-key="id" class="image-grid" handle=".drag-handle" @end="saveOrder">
      <template #item="{ element }">
        <div class="image-card">
          <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
          <img :src="element.url" :alt="gallery.title">
          <UButton @click="deleteImage(element)" color="error" class="absolute top-2 right-2">
            Remove
          </UButton>
        </div>
      </template>
    </Draggable>

    <div class="space-y-2">
      <UEmpty v-if="!gallery?.gallery_images?.length" title="No images in this gallery yet."
        description="It looks like you haven't added any images. Click 'Upload Images' to get started." />
      <UButton @click="openUploadWidget" :disabled="!cloudinaryLoaded" size="xl">
        {{ cloudinaryLoaded ? 'Upload Images' : 'Loading...' }}
      </UButton>
    </div>

    <NuxtLink to="/admin/galleries">← Back to Galleries</NuxtLink>
  </admin-inner-wrapper>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.drag-handle {
  position: absolute;
  left: 10px;
  top: 10px;
  cursor: grab;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
}
</style>
