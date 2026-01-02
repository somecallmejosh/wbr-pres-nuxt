<!-- pages/galleries/[id].vue -->
<script setup>
const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

// Fetch gallery with images (no auth needed - public!)
const { data: gallery } = await useAsyncData('public-gallery', async () => {
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

// Handle gallery not found
if (!gallery.value) {
  throw createError({
    statusCode: 404,
    message: 'Gallery not found'
  })
}

// Optional: Lightbox state for full-size image viewing
const selectedImage = ref(null)

function openLightbox(image) {
  selectedImage.value = image
}

function closeLightbox() {
  selectedImage.value = null
}
</script>

<template>
  <page-wrapper :title="gallery.title" :description="`View images from the ${gallery.title} gallery.`">
    <!-- Image Grid -->
    <div v-if="gallery.gallery_images?.length" class="image-grid">
      <div v-for="image in gallery.gallery_images" :key="image.id" class="image-card" @click="openLightbox(image)">
        <img :src="image.url" :alt="`${gallery.title} image`" loading="lazy">
      </div>
    </div>
    <!-- Empty State -->
    <div v-else class="empty-state">
       <UEmpty
        title="No images in this gallery yet."
        description="It looks like you haven't added any images. Add some to get started."
      />
    </div>
    <!-- Lightbox Modal -->
    <div v-if="selectedImage" class="lightbox" @click="closeLightbox">
      <button class="close-btn" @click="closeLightbox">×</button>
      <img :src="selectedImage.url" :alt="`${gallery.title} image`" @click.stop>
    </div>

    <div class="flex items-center justify-between gap-1">
      <UButton to="/galleries" variant="outline">
        ← All Galleries
      </UButton>
      <UButton v-if="user" :to="`/admin/galleries/${gallery.id}`">
        Edit this Gallery
      </UButton>
    </div>
  </page-wrapper>
</template>

<style scoped>
.gallery-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #333;
}

.back-link {
  color: #0078FF;
  text-decoration: none;
  font-size: 1.1rem;
}

.back-link:hover {
  text-decoration: underline;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.image-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.image-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.2rem;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  padding: 20px;
}

.lightbox img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  cursor: default;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: white;
  font-size: 50px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 50px;
  height: 50px;
  z-index: 1001;
}

.close-btn:hover {
  color: #ccc;
}

/* Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .image-card img {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
