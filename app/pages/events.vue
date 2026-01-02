<script setup lang="ts">
  const user = useSupabaseUser()
</script>
<template>
  <UPageSection>
    <EventList />
    <div v-if="user" >
      <UButton href="/admin/events/create">Create New Event</UButton>
    </div>
  </UPageSection>
</template>
