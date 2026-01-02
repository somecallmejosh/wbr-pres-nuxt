<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
const client = useSupabaseClient()

const state = reactive({
  title: undefined,
  date: undefined,
  description: undefined
})


type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.title) errors.push({ name: 'title', message: 'Required' })
  if (!state.date) errors.push({ name: 'date', message: 'Required' })
  if (!state.description) errors.push({ name: 'description', message: 'Required' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { data, error } = await client
    .from('events')
    .insert([{
      title: event.data.title,
      date: event.data.date,
      description: event.data.description
    }])
    .select()
  if (error) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
    return
  } else {
    // Reset form state
    state.title = undefined
    state.date = undefined
    state.description = undefined
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  }
}

const links = [
  { label: 'Back to Events', to: '/admin/events' }
]
</script>

<template>
  <admin-inner-wrapper title="Create Event" description="Create a new event for WBR Presbyterian Church.">
    <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Title" name="title">
        <UInput v-model="state.title" />
      </UFormField>
      <UFormField label="Date" name="date">
        <UInput v-model="state.date" type="date" />
      </UFormField>
      <UFormField label="Description" name="description">
        <UTextarea v-model="state.description" />
      </UFormField>
      <UButton type="submit">
        Submit
      </UButton>
    </UForm>
    <admin-wrapper-links :links="links" />
  </admin-inner-wrapper>
</template>
