<script setup>
const client = useSupabaseClient()

const fetchGalleries = async () => {
  const { data: galleries } = await client
    .from('galleries')
    .select(`
      id, title,
      gallery_images (id, url, position)
    `)
    .order('title', { ascending: true })
    .order('position', { foreignTable: 'gallery_images', ascending: true })
    .limit(1, { foreignTable: 'gallery_images' })

  return galleries
}

// load galleries on component mount
const savedGalleries = reactive([])
onMounted(async () => {
  const galleries = await fetchGalleries()
  Object.assign(savedGalleries, galleries)
})
</script>
<template>
  <page-wrapper title="Galleries" description="Explore our collection of galleries.">
    <UPageGrid class="flex-1">
      <UPageCard v-for="gallery in savedGalleries" :key="gallery.id" :to="`/galleries/${gallery.id}`">
        <template #body>
          <img
            v-if="gallery.gallery_images && gallery.gallery_images[0]"
            :src="gallery.gallery_images[0].url"
            :alt="gallery.title"
            class="w-full aspect-video object-cover rounded mb-2"
          >
          <h2 class="text-lg font-semibold mb-2">{{ gallery.title }}</h2>
        </template>
      </UPageCard>
    </UPageGrid>
  </page-wrapper>
</template>
