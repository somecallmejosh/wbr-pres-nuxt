<script setup lang="ts">
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
<template></template>
