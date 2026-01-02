<script setup lang="ts">
const route = useRoute()
const memberId = route.params.id as string
const client = useSupabaseClient()

const getMember = async (id: string) => {
  const { data } = await client
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// load member on component mount
const member = ref<{ id: string; name: string; date_of_birth: string;} | null>(null)
onMounted(async () => {
  const fetchedMember = await getMember(memberId)
  member.value = fetchedMember
})
</script>



<template>
  <UPageCard v-if="member">
    <h1 class="font-semibold text-xl">{{ member?.name }}</h1>
    <p>{{ new Date(member?.date_of_birth).toLocaleDateString() }}</p>
  </UPageCard>
</template>
