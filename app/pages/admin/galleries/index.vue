<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import admin from '~/middleware/admin'
const client = useSupabaseClient()

const state = reactive({
  title: undefined,
})


type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.title) errors.push({ name: 'title', message: 'Required' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { data, error } = await client
    .from('galleries')
    .insert([{
      title: event.data.title
    }])
    .select()
  if (error) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
    return
  } else {
    // Reset form state
    state.title = undefined
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  }
}
</script>

<template>
  <admin-inner-wrapper title="Galleries" description="Manage photo galleries for WBR Presbyterian Church.">
    <GalleriesList />

    <UCard>
      <h2 class="font-semibold">Create a New Gallery</h2>
      <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField
          label="Title of the Gallery" name="title"
          help="You will be able to add photos to the gallery after creating it."
        >
          <UInput v-model="state.title" />
        </UFormField>
        <UButton type="submit">
          Create Gallery
        </UButton>
      </UForm>
    </UCard>
  </admin-inner-wrapper>
</template>
