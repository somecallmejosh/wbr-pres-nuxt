<script setup lang="ts">
  const client = useSupabaseClient()

  const fetchGalleries = async () => {
    const { data: galleries } = await client
    .from('galleries')
    .select('*')
    .order('title', { ascending: true })

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
  <UPageSection class="flex-1">
    <h2 class="font-semibold mb-2">Existing Galleries</h2>
    <UPageCard
      v-for="gallery in savedGalleries"
      :key="gallery.id"
      variant="ghost"
      :to="`/galleries/${gallery.id}`"
    >
      <template #body>
        <h2 class="text-lg font-semibold mb-2">{{ gallery.title }}</h2>
      </template>
    </UPageCard>
  </UPageSection>
</template>
