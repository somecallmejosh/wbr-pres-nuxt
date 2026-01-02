<script setup lang="ts">
const route = useRoute()
const eventId = route.params.id as string
const client = useSupabaseClient()

const getEvent = async (id: string) => {
  const { data } = await client
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// load event on component mount
const event = ref<{ id: string; title: string; date: string; description: string } | null>(null)
onMounted(async () => {
  const fetchedEvent = await getEvent(eventId)
  event.value = fetchedEvent
})
</script>



<template>
  <div v-if="event">
    <h1 class="font-semibold text-xl">{{ event?.title }}</h1>
    <p>{{ event?.description }}</p>
    <p>{{ new Date(event?.date).toLocaleDateString() }}</p>
  </div>
</template>
