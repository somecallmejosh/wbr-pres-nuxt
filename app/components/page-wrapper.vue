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
  <UContainer>
    <UPage>
      <UPageHeader v-if="props.title" :title="props.title">
        <p v-if="props.description">{{ props.description }}</p>
      </UPageHeader>
      <UPageBody>
        <slot />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
