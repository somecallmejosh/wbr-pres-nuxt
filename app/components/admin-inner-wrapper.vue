<script setup>
const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
})
</script>
<template>
  <UPage>
    <h2 class="text-2xl font-bold">{{ props.title }}</h2>
    <p v-if="props.description">{{ props.description }}</p>
    <UPageBody>
      <slot />
    </UPageBody>
  </UPage>
</template>
