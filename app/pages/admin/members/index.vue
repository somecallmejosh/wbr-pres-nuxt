<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
const client = useSupabaseClient()

const state = reactive({
  name: undefined,
  birth_date: undefined
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  if (!state.birth_date) errors.push({ name: 'birth_date', message: 'Required' })
  return errors
}

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { data, error } = await client
    .from('members')
    .insert([{
      name: event.data.name,
      birth_date: event.data.birth_date,
    }])
    .select()
  if (error) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
    return
  } else {
    // Reset form state
    state.name = undefined
    state.birth_date = undefined
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  }
}
</script>

<template>
  <UPageCard>
    <MembersList />
    <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
      <h1 class="font-semibold text-2xl">Add New Church Member</h1>
      <UFormField label="Church Member Name" name="name">
        <UInput v-model="state.name" />
      </UFormField>
      <UFormField label="Birth Day" name="birth_date">
        <UInput v-model="state.birth_date" type="date" />
      </UFormField>
      <UButton type="submit">
        Submit
      </UButton>
    </UForm>
  </UPageCard>
</template>
