<script setup>
definePageMeta({
  middleware: 'admin'
})
const cards = ref([
  {
    title: 'Events',
    description: 'Manage all events in the system.',
    icon: 'i-lucide-calendar',
    to: '/admin/events'
  },
  {
    title: 'Members',
    description: 'Manage all members in the system.',
    icon: 'i-lucide-a-large-small',
    to: '/admin/members'
  },
  {
    title: 'Galleries',
    description: 'Manage all galleries in the system.',
    icon: 'i-lucide-image',
    to: '/admin/galleries'
  }
])
</script>
<template>
  <UPageSection>
    <UPageHeader title="Admin">
      <p>Manage your admin settings here.</p>
    </UPageHeader>
    <NuxtPage />
    <UPageGrid>
      <UPageCard v-for="(card, index) in cards" :key="index" v-bind="card" />
    </UPageGrid>
  </UPageSection>
</template>
