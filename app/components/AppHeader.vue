<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'
import { useCart } from '~~/composables/useCart'

const { isAuthenticated, user, logout } = useAuth()
const { cartItems, totalCount, totalAmount, fetchCart, removeCartItem } = useCart()
const toast = useToast()

// 初始化购物车
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCart()
  }
})

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
      onSelect: () => navigateTo('/orders') 
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

// 购物车 Hover 控制
const isCartDropdownOpen = ref(false)
let cartCloseTimer: any = null

const handleCartMouseEnter = () => {
  if (cartCloseTimer) clearTimeout(cartCloseTimer)
  isCartDropdownOpen.value = true
}

const handleCartMouseLeave = () => {
  cartCloseTimer = setTimeout(() => {
    isCartDropdownOpen.value = false
  }, 200)
}

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
        
        <!-- 购物车下拉 -->
        <div 
          class="relative"
          @mouseenter="handleCartMouseEnter"
          @mouseleave="handleCartMouseLeave"
        >
          <UButton 
            to="/cart" 
            color="neutral" 
            variant="ghost" 
            size="lg" 
            class="relative group"
          >
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span v-if="totalCount > 0" class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
              {{ totalCount > 99 ? '99+' : totalCount }}
            </span>
          </UButton>

          <!-- 下拉面板 -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div 
              v-if="isCartDropdownOpen"
              class="absolute right-0 top-full mt-2 z-50"
            >
              <div class="p-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700">
                <div v-if="cartItems.length === 0" class="text-center py-8">
                  <div class="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UIcon name="i-lucide-shopping-cart" class="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">购物车是空的</p>
                  <UButton to="/categories" color="primary" variant="ghost" size="sm" class="mt-2">去逛逛</UButton>
                </div>
                
                <div v-else>
                  <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold text-gray-900 dark:text-white">购物车</h3>
                    <span class="text-xs text-gray-500 dark:text-gray-400">共 {{ totalCount }} 件商品</span>
                  </div>
                  
                  <div class="max-h-[300px] overflow-y-auto -mr-2 pr-2 space-y-4 custom-scrollbar">
                    <div v-for="item in cartItems" :key="item.dishId" class="flex gap-3 group/item">
                      <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                        <img :src="item.dishImage" :alt="item.dishName" class="w-full h-full object-cover" />
                      </div>
                      <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h4 class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ item.dishName }}</h4>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500 dark:text-gray-400">x{{ item.quantity }}</span>
                          <span class="font-medium text-orange-600 text-sm">¥{{ item.price * item.quantity }}</span>
                        </div>
                      </div>
                      <div class="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <UButton 
                          icon="i-lucide-trash-2" 
                          color="red" 
                          variant="ghost" 
                          size="xs"
                          @click.stop="removeCartItem(item.dishId)"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between items-center mb-4">
                      <span class="text-gray-600 dark:text-gray-300">合计</span>
                      <span class="text-lg font-bold text-orange-600">¥{{ totalAmount }}</span>
                    </div>
                    <UButton to="/cart" block color="primary">去结算</UButton>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        
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
