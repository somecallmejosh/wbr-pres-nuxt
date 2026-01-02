<script setup lang="ts">
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
  <UPageList class="flex-1">
    <h2 class="font-semibold mb-2">Existing Members</h2>
    <UPageCard
      v-for="member in savedMembers"
      :key="member.id"
      variant="ghost"
      :to="`/admin/members/${member.id}`"
    >
      <template #body>
        <h2 class="text-lg font-semibold mb-2">{{ new Date(member.birth_date).toLocaleDateString() }} - {{ member.name }}</h2>
      </template>
    </UPageCard>
  </UPageList>
</template>
