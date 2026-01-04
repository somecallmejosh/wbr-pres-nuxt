<script setup lang="ts">
const route = useRoute()
import { normalizeDate } from '~/utilities/date-format'
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

const links = [
  { label: '← All Members', to: '/admin/members' },
  { label: 'Edit this Member', to: `/admin/members/${memberId}/edit` }
]
</script>



<template>
  <admin-inner-wrapper :title="member.name" v-if="member">
    <p>{{ new Date(normalizeDate(member?.birth_date)).toLocaleDateString() }}</p>

    <admin-wrapper-links :links="links" />
  </admin-inner-wrapper>
</template>
