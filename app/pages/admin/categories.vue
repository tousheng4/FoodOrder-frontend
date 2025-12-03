<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">分类管理</h1>
        </div>
        <UButton to="/admin" color="primary" variant="ghost" icon="i-lucide-arrow-left">返回后台</UButton>
      </div>
      <UCard>
        <div class="text-center py-20 text-gray-500">
          <UIcon name="i-lucide-hammer" class="w-16 h-16 mb-4 mx-auto text-gray-300" />
          <p>分类管理模块正在开发中...</p>
        </div>
      </UCard>
    </div>
  </div>
</template>
