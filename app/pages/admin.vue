<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user } = useAuth()
const toast = useToast()

// 父级路由统一做权限检查，子路由通过 <NuxtPage /> 渲染
onMounted(() => {
  if (user.value?.role !== 1) {
    navigateTo('/')
    toast.add({ title: '无权访问', color: 'error' })
  }
})
</script>

<template>
  <NuxtPage />
</template>
