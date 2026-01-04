<script setup lang="ts">

</script>

<template>
  <div class="grid lg:grid-cols-2 bg-yellow-950/[0.05] md:min-h-[calc(100vh-4rem)] w-full">
    <div class="aspect-[16/9] lg:aspect-[initial] bg-[url('https://res.cloudinary.com/dwjulenau/image/upload/v1765053737/WBR%20Presbyterian/Mary.png')] bg-cover bg-center lg:bg-left">
    </div>
    <div class="px-6 py-12 lg:py-8 xl:px-8 2xl:px-28 2xl:py-20 lg:flex lg:items-center">
      <div class="space-y-6 ">
        <h1 class="text-2xl lg:text-5xl font-bold text-balance">Welcome to West Baton Rouge Presbyterian Church</h1>
        <p class="text-lg text-gray-700 text-balance">
          We are a community of faith, worship, and service located in West Baton Rouge. Join us for worship services,
          community events, and spiritual growth opportunities.
        </p>
        <EventsThisWeekList />
      </div>

    </div>
  </div>
  <page-wrapper>
    <MemberBirthdaysThisMonthList />
  </page-wrapper>
</template>
