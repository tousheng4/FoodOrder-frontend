<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'

const { isAuthenticated, user, logout } = useAuth()
const toast = useToast()

// 下拉菜单项
const dropdownItems = computed(() => {
  const items = [
    [{ 
      label: '个人档案', 
      icon: 'i-lucide-user', 
      onSelect: () => navigateTo('/profile')
    }],
    [{ 
      label: '我的订单', 
      icon: 'i-lucide-package', 
      onSelect: () => console.log('Orders clicked') 
    }],
    [{ 
      label: '退出登录', 
      icon: 'i-lucide-log-out', 
      onSelect: handleLogout 
    }]
  ]

  // 如果是管理员，添加管理后台入口
  if (user.value?.role === 1) {
    items.unshift([{
      label: '管理后台',
      icon: 'i-lucide-shield-check',
      onSelect: () => navigateTo('/admin')
    }])
  }

  return items
})

// 登出处理
const handleLogout = () => {
  logout()
  toast.add({
    title: '已退出登录',
    description: '期待您的再次光临',
    color: 'success'
  })
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
    <UContainer class="h-20 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3 cursor-pointer group">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
          <UIcon name="i-lucide-utensils" class="w-6 h-6 text-white" />
        </div>
        <span class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          FoodOrder
        </span>
      </div>
      
      <!-- 中间导航 (桌面端) -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink to="/" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">首页</NuxtLink>
        <NuxtLink to="/categories" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">菜单</NuxtLink>
        <a href="#" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">优惠</a>
        <a href="#" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">关于</a>
      </nav>
      
      <!-- 右侧按钮 -->
      <div class="flex items-center gap-4">
        <UButton color="neutral" variant="ghost" size="lg" class="relative group">
          <UIcon name="i-lucide-search" class="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
        </UButton>
        <UButton color="neutral" variant="ghost" size="lg" class="relative group">
          <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </UButton>
        
        <!-- 未登录状态 -->
        <UButton 
          v-if="!isAuthenticated"
          to="/login" 
          color="primary" 
          variant="solid" 
          size="md" 
          class="rounded-full px-6 font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
        >
          登录
        </UButton>
        
        <!-- 已登录状态 -->
        <UDropdownMenu 
          v-else 
          :items="dropdownItems" 
          :content="{ align: 'end', side: 'bottom' }"
        >
          <UButton color="neutral" variant="ghost" size="lg" class="gap-2">
            <UAvatar 
              :alt="user?.nickname || user?.username" 
              size="sm"
              :ui="{ root: 'bg-gradient-to-br from-primary-500 to-red-600' }"
            />
            <span class="hidden md:inline text-sm font-medium text-gray-700">
              {{ user?.nickname || user?.username }}
            </span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-500" />
          </UButton>
        </UDropdownMenu>
      </div>
    </UContainer>
  </header>
</template>
