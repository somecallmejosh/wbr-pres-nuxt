<script setup lang="ts">
const user = useSupabaseUser()
</script>
<template>
  <page-wrapper title="Events" description="Upcoming events at WBR Presbyterian Church">
    <EventList />
    <div v-if="user">
      <UButton href="/admin/events/create">Create New Event</UButton>
    </div>
  </page-wrapper>
</template>
