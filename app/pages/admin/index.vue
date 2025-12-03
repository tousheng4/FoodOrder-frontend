<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'

const { user, logout } = useAuth()

const stats = [
  { label: '总用户', value: '1,234', icon: 'i-lucide-users', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '今日订单', value: '45', icon: 'i-lucide-shopping-bag', color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: '总收入', value: '¥12,345', icon: 'i-lucide-dollar-sign', color: 'text-green-500', bg: 'bg-green-50' },
  { label: '待处理', value: '8', icon: 'i-lucide-clock', color: 'text-red-500', bg: 'bg-red-50' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">管理员控制台</h1>
          <p class="text-gray-500 mt-1">欢迎回来，{{ user?.nickname || '管理员' }}</p>
        </div>
        <div class="flex gap-3">
          <UButton to="/" color="primary" variant="ghost" icon="i-lucide-home">返回首页</UButton>
          <UButton color="secondary" variant="ghost" icon="i-lucide-log-out" @click="logout">退出</UButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard v-for="stat in stats" :key="stat.label">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
              <h3 class="text-2xl font-bold">{{ stat.value }}</h3>
            </div>
            <div :class="`p-3 rounded-xl ${stat.bg}`">
              <UIcon :name="stat.icon" :class="`w-6 h-6 ${stat.color}`" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <UCard class="lg:col-span-2">
          <template #header>
            <h3 class="font-semibold">快捷管理</h3>
          </template>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <UButton block color="primary" variant="soft" class="h-24 flex flex-col gap-2" to="/admin/users">
              <UIcon name="i-lucide-users" class="w-6 h-6" />
              <span>用户管理</span>
            </UButton>
            <UButton block color="primary" variant="soft" class="h-24 flex flex-col gap-2" to="/admin/dishes">
              <UIcon name="i-lucide-utensils" class="w-6 h-6" />
              <span>菜品管理</span>
            </UButton>
            <UButton block color="primary" variant="soft" class="h-24 flex flex-col gap-2" to="/admin/orders">
              <UIcon name="i-lucide-clipboard-list" class="w-6 h-6" />
              <span>订单管理</span>
            </UButton>
          </div>
        </UCard>

        <!-- Notifications -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">系统消息</h3>
          </template>
          <div class="space-y-4">
            <div class="flex gap-3 text-sm">
              <div class="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <p class="text-gray-600">系统运行正常，暂无异常告警。</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
