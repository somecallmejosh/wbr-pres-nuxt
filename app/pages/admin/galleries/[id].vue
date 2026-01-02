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
const pendingUploads = ref([])

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
        if (!error && result) {
          if (result.event === 'success') {
            console.log('Upload successful:', result.info)
            // Buffer uploads to insert in one batch to avoid duplicate positions
            pendingUploads.value.push(result.info)
          }

          // When all uploads complete or widget closes, persist buffered rows
          if (result.event === 'queues-end' || result.event === 'close') {
            if (pendingUploads.value.length) {
              const base = (gallery.value?.gallery_images?.length || 0)
              const rows = pendingUploads.value.map((info, idx) => ({
                gallery_id: route.params.id,
                cloudinary_id: info.public_id,
                url: info.secure_url,
                position: base + idx + 1
              }))
              const { error: insertError } = await client.from('gallery_images').insert(rows)
              if (insertError) {
                console.error('Failed to save uploaded images:', insertError)
                toast.add({ title: 'Upload save failed', description: insertError.message || 'Failed to save uploaded images', color: 'error' })
              } else {
                await refresh()
                toast.add({ title: 'Images added', color: 'success' })
              }
              // Clear buffer regardless of outcome
              pendingUploads.value = []
            }
          }
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

    <UCard>
      <UAlert icon="mdi-information" variant="subtle" class="mb-8">
        <template #title><p><strong>Drag and drop images to reorder them.</strong></p></template>
        <template #description>
          <p><strong>After reordering, the new order will be saved automatically.</strong></p>
        </template>
      </UAlert>
      <Draggable v-model="orderedImages" item-key="id" handle=".drag-handle" @end="saveOrder"
        class="divide-y divide-gray-200 bg-white">
        <template #item="{ element }">
          <div class="flex gap-4 p-2 items-center bg-white">
            <div class="drag-handle cursor-move" title="Drag to reorder">
              <Icon name="mdi-drag" size="2rem" />
            </div>
            <div>
              <output class="size-8 flex items-center justify-center rounded-full bg-gray-200 font-bold"><span
                  class="sr-only">Position: </span>{{ element.position }}</output>
            </div>
            <div>
              <div class="drag-handle aspect-square w-28 relative cursor-move" title="Drag to reorder">
                <img :src="element.url" :alt="gallery.title" class="object-cover w-full aspect-square rounded" />
              </div>
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ element.cloudinary_id }}</p>
              <p class="text-sm">{{ element.url }}</p>
            </div>
            <div>
              <UButton @click="deleteImage(element)" color="error">
                Remove
              </UButton>
            </div>
          </div>
        </template>
      </Draggable>
    </UCard>

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
.sortable-ghost {
  border: 2px dashed var(--color-sky-500); /* Tailwind slate-400 */
}
</style>
