<script setup>
const props = defineProps({
  links: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
<template>
  <nav>
    <ul class="flex items-center gap-4">
      <li v-for="(link, index) in props.links" :key="index" class="admin-link-item">
        <UIcon v-if="link.icon" :name="link.icon" class="icon" />
        <ULink v-if="link.to" :to="link.to">{{ link.label }}</ULink>
        <span v-else>{{ link.label }}</span>
      </li>
    </ul>
  </nav>
</template>
