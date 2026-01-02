<script setup>
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
  <div>
    <UPageGrid class="flex-1">

      <UPageCard
        v-for="member in savedMembers"
        :key="member.id"
        :to="`/admin/members/${member.id}`"
      >
        <template #body>
          <h2 class="text-lg font-semibold mb-2">{{ new Date(member.birth_date).toLocaleDateString() }} - {{ member.name }}</h2>
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
