<script setup lang="ts">
import { useCart } from '~~/composables/useCart'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { cartItems, loading, totalCount, totalAmount, updateQuantity, removeCartItem, clear } = useCart()

const handleQuantityChange = (item: any, change: number) => {
  const newQty = item.quantity + change
  if (newQty > 0) {
    updateQuantity(item, newQty)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航 -->
    <AppHeader />
    
    <div class="py-12">
      <UContainer>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <UIcon name="i-lucide-shopping-cart" class="w-8 h-8" />
        我的购物车
      </h1>

      <div v-if="loading && cartItems.length === 0" class="py-20 flex justify-center">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
      </div>

      <div v-else-if="cartItems.length === 0" class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
        <div class="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-shopping-bag" class="w-12 h-12 text-gray-300 dark:text-gray-500" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">购物车还是空的</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">快去挑选心仪的美食吧！</p>
        <UButton to="/categories" color="primary" size="lg" icon="i-lucide-arrow-right" trailing>
          去逛逛
        </UButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 商品列表 -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span class="font-medium text-gray-900 dark:text-white">商品列表 ({{ totalCount }})</span>
              <UButton 
                color="red" 
                variant="ghost" 
                size="sm" 
                icon="i-lucide-trash-2"
                @click="clear"
              >
                清空购物车
              </UButton>
            </div>
            
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="item in cartItems" :key="item.dishId" class="p-4 sm:p-6 flex gap-4 sm:gap-6 group">
                <!-- 商品图片 -->
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700 bg-gray-50">
                  <img :src="item.dishImage" :alt="item.dishName" class="w-full h-full object-cover" />
                </div>

                <!-- 商品详情 -->
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-1">{{ item.dishName }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">单价：¥{{ item.price }}</p>
                    </div>
                    <div class="font-bold text-lg text-gray-900 dark:text-white">¥{{ item.price * item.quantity }}</div>
                  </div>

                  <div class="flex justify-between items-end mt-4">
                    <!-- 数量控制器 -->
                    <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                      <button 
                        class="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors text-gray-600 dark:text-gray-200"
                        @click="handleQuantityChange(item, -1)"
                        :disabled="item.quantity <= 1"
                      >
                        <UIcon name="i-lucide-minus" class="w-4 h-4" />
                      </button>
                      <span class="font-medium text-gray-900 dark:text-white w-8 text-center">{{ item.quantity }}</span>
                      <button 
                        class="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-600 dark:text-gray-200"
                        @click="handleQuantityChange(item, 1)"
                      >
                        <UIcon name="i-lucide-plus" class="w-4 h-4" />
                      </button>
                    </div>

                    <!-- 删除按钮 -->
                    <UButton 
                      color="neutral" 
                      variant="ghost" 
                      icon="i-lucide-trash" 
                      class="text-gray-400 hover:text-red-500"
                      @click="removeCartItem(item.dishId)"
                    >
                      删除
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结算卡片 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-24">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">订单摘要</h3>
            
            <div class="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex justify-between text-gray-500 dark:text-gray-400">
                <span>商品总额</span>
                <span>¥{{ totalAmount }}</span>
              </div>
              <div class="flex justify-between text-gray-500 dark:text-gray-400">
                <span>配送费</span>
                <span class="text-green-500">免运费</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-8">
              <span class="font-bold text-gray-900 dark:text-white">应付总额</span>
              <div class="text-right">
                <span class="text-3xl font-bold text-orange-600">¥{{ totalAmount }}</span>
              </div>
            </div>

            <UButton block size="xl" color="primary" class="font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 mb-4">
              去结算
              <UIcon name="i-lucide-arrow-right" class="ml-2" />
            </UButton>

            <p class="text-xs text-center text-gray-400">
              点击结算即表示您同意我们的<a href="#" class="underline hover:text-gray-600">服务条款</a>
            </p>
          </div>
        </div>
      </div>
    </UContainer>
    </div>
  </div>
</template>

