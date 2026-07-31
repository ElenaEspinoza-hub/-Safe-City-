<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initializeAuth } from './utils/authStore'

onMounted(() => {
  void initializeAuth()
})
</script>

<template>
  <RouterView />
</template>
