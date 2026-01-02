<script setup lang="ts">
  const client = useSupabaseClient()

  const fetchEvents = async () => {
    const { data: events } = await client
    .from('events')
    .select('*')
    .order('date', { ascending: true })

    return events
  }

  // load events on component mount
  const savedEvents = reactive([])
  onMounted(async () => {
    const events = await fetchEvents()
    Object.assign(savedEvents, events)
  })
</script>
<template>
  <UPageList class="flex-1">
    <h2 class="font-semibold mb-2">Existing Events</h2>
    <UPageCard
      v-for="event in savedEvents"
      :key="event.id"
      variant="ghost"
      :to="`/admin/events/${event.id}`"
    >
      <template #body>
        <h2 class="text-lg font-semibold mb-2">{{ event.title }} - {{ new Date(event.date).toLocaleDateString() }}</h2>
        <p>{{ event.description }}</p>
      </template>
    </UPageCard>
  </UPageList>
</template>
