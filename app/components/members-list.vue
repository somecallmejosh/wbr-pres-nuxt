<script setup>
import { normalizeDate } from '~/utilities/date-format'
const client = useSupabaseClient()

const fetchMembers = async () => {
  const { data: members } = await client
    .from('members')
    .select('*')
    .order('birth_date', { ascending: true })

  return members
}

// load members on component mount
const savedMembers = reactive([])
onMounted(async () => {
  const members = await fetchMembers()
  Object.assign(savedMembers, members)
})
</script>
<template>
  <div class="@container">
    <ul class="grid @xs:grid-cols-2 @lg:grid-cols-3 gap-6">
      <li v-for="member in savedMembers" :key="member.id" class="relative p-4 bg-amber-950/[0.05]">
        <NuxtTime :datetime="normalizeDate(member.birth_date)" weekday="long"
          class="font-display text-xs font-semibold" />,
        <NuxtTime :datetime="normalizeDate(member.birth_date)" month="long" day="numeric"
          class="font-display text-xs font-semibold" />

        <h2 class="text-lg font-semibold mb-2">{{ member.name }}</h2>
        <ULink class="absolute inset-0" :to="`/admin/members/${member.id}`">
          <div class="sr-only">View member details</div>
        </ULink>
      </li>
    </ul>
  </div>
</template>
