<script setup>
  import { normalizeDate, getCurrentWeekRange } from '~/utilities/date-format'
  const client = useSupabaseClient()

  const fetchEvents = async () => {
    const { startYmd, endYmd } = getCurrentWeekRange({ startOnMonday: false })
    const { data: events } = await client
      .from('events')
      .select('*')
      .gte('date', startYmd)
      .lte('date', endYmd)
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
  <div v-if="savedEvents.length > 0" class="@container">
    <USeparator label="Events This Week" color="primary" label-alignment="left" class="my-8" />
    <ul class="grid @xs:grid-cols-2 @lg:grid-cols-3 gap-6">
      <li v-for="event in savedEvents"
          :key="event.id" class="relative bg-white p-4">
          <div class="flex flex-col h-full space-y-4">
              <div class="flex gap-1">
                <NuxtTime :datetime="normalizeDate(event.date)" locale="en-us" weekday="long" class="font-display text-xs font-semibold"  />
                <NuxtTime :datetime="normalizeDate(event.date)" locale="en-us" month="long" class="font-display text-xs"  />
              </div>
              <NuxtTime :datetime="normalizeDate(event.date)" locale="en-us" day="numeric" class="font-display text-5xl font-bold block mb-6 text-amber-500" />
              <h2 class="font-bold text-lg mb-2 leading-tight text-balance">{{ event.title }}</h2>
              <p class="text-pretty">{{ event.description }}</p>
              <p class="mt-auto pt-8">
                (<NuxtTime :datetime="normalizeDate(event.date)" relative class="text-xs "/>)
              </p>
            </div>
        <ULink
          class="absolute inset-0"
          :to="`/admin/events/${event.id}`"
        >
        </ULink>
      </li>
    </ul>
  </div>
  <UEmpty v-else title="No events this week" />
</template>
