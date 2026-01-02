<script setup>
const client = useSupabaseClient()

const fetchgalleries = async () => {
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
const savedgalleries = reactive([])
onMounted(async () => {
  const galleries = await fetchgalleries()
  Object.assign(savedgalleries, galleries)
})
</script>
<template>
  <UPageGrid class="flex-1">
    <UPageCard v-for="gallery in savedgalleries" :key="gallery.id" :to="`/admin/galleries/${gallery.id}`">
      <template #body>
        <img v-if="gallery.gallery_images && gallery.gallery_images[0]" :src="gallery.gallery_images[0].url"
          :alt="gallery.title" class="w-full aspect-video object-cover rounded mb-2">
        <h2 class="text-lg font-semibold mb-2">{{ gallery.title }}</h2>
      </template>
    </UPageCard>
  </UPageGrid>
</template>
