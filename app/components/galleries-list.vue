<script setup lang="ts">
  const client = useSupabaseClient()

  const fetchgalleries = async () => {
    const { data: galleries } = await client
    .from('galleries')
    .select('*')
    .order('title', { ascending: true })
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
  <UPageList class="flex-1">
    <h2 class="font-semibold mb-2">Existing galleries</h2>
    <UPageCard
      v-for="gallery in savedgalleries"
      :key="gallery.id"
      variant="ghost"
      :to="`/admin/galleries/${gallery.id}`"
    >
      <template #body>
        <h2 class="text-lg font-semibold mb-2">{{ gallery.title }}</h2>
      </template>
    </UPageCard>
  </UPageList>
</template>
