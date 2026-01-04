<script setup>
import { normalizeDate } from '~/utilities/date-format'
const client = useSupabaseClient()
const user = useSupabaseUser()

const fetchMembers = async () => {
  const month = new Date().getMonth() + 1 // 1-12
  const { data: members } = await client
    .from('members_birth_view')
    .select('id,name,birth_date,birth_month,birth_day,age_years,next_birthday,days_until_birthday')
    .eq('birth_month', month)
    .order('birth_day', { ascending: true })
  return members ?? []
}

// load members on component mount
const savedMembers = reactive([])
onMounted(async () => {
  const members = await fetchMembers()
  Object.assign(savedMembers, members)

  // Subscribe to realtime changes on the base members table and refresh the view data
  const channel = client.channel('members_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, async () => {
      const updated = await fetchMembers()
      // replace array contents to keep reactivity
      savedMembers.length = 0
      savedMembers.push(...updated)
    })
    .subscribe()

  // Cleanup on component unmount
  onUnmounted(() => {
    channel.unsubscribe()
  })
})
</script>
<template>

  <div v-if="savedMembers.length > 0" class="@container">
    <ul class="grid @xs:grid-cols-2 @lg:grid-cols-3 gap-6">
      <li v-for="member in savedMembers" :key="member.id" class="relative p-4 bg-amber-950/[0.05]">
        <NuxtTime :datetime="normalizeDate(member.birth_date)" month="long" day="numeric"
          class="font-display text-xs font-semibold" />
          <h2 class="text-lg font-semibold">{{ member.name }}</h2>
          <p v-if="member.days_until_birthday > 0">will be <span class="font-display font-bold">{{ member.age_years + 1}} years old</span> in {{ member.days_until_birthday }} {{  member.days_until_birthday === 1 ? 'day' : 'days' }}.</p>
          <p v-else>turns <span class="font-display font-bold">{{ member.age_years}} years old today</span> 🎉 Happy birthday!</p>

        <ULink v-if="user" class="absolute inset-0" :to="`/admin/members/${member.id}`">
          <div class="sr-only">View member details</div>
        </ULink>
      </li>
    </ul>
  </div>
  <UEmpty v-else title="No birthdays this month" />
</template>
