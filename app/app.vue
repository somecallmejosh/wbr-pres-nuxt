<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

const title = 'WBR Presbyterian Church'
const description = 'Welcome to WBR Presbyterian Church - A community of faith, worship, and service in West Baton Rouge.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const items = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Galleries', to: '/galleries' },
  { label: 'Contact', to: '/contact' },
]
</script>

<template>

  <UApp>
    <UHeader>
      <template #title>
        <div>WBR Presbyterian Church</div>
      </template>
      <UNavigationMenu :items="items" />
      <template #right>
        <UColorModeButton />
        <UButton v-if="user" variant="link" :to="{ path: '/admin' }">Admin</UButton>
        <UButton v-if="user" @click="logout">
          Logout
        </UButton>
        <UButton v-if="!user" variant="link" :to="{ path: '/login' }">
          Login
        </UButton>
      </template>
      <template #body>
        <UNavigationMenu :items="items" orientation="vertical" />
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter class="text-center">
      © {{ new Date().getFullYear() }} WBR Presbyterian Church. All rights reserved.
    </UFooter>
  </UApp>
</template>
