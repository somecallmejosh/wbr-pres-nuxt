<script setup>
  definePageMeta({
    middleware: 'admin'
  })
  const items = ref([
    {
      label: 'Admin',
      icon: 'i-lucide-book-open',
      to: '/admin'
    },
    {
      label: 'Events',
      icon: 'i-lucide-calendar',
      to: '/admin/events'
    },
  ])
</script>
<template>
  <NuxtPage />
</template>
