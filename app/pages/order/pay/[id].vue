<script setup lang="ts">
import { getOrderDetail, payOrder, createAlipayPayment } from '~~/services/modules/order'
import type { OrderDetailVO } from '~~/types/api'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const orderId = Number(route.params.id)
const loading = ref(true)
const paying = ref(false)
const alipaying = ref(false)
const order = ref<OrderDetailVO | null>(null)

// 支付方式选择
const paymentMethod = ref<'mock' | 'alipay'>('alipay')


const fetchOrder = async () => {
  try {
    const res = await getOrderDetail(orderId)
    order.value = res
    
    // If already paid, redirect
    if (order.value.status !== 0) { // Assuming 0 is Pending Payment
       toast.add({ title: '订单已支付', color: 'info' })
       router.replace(`/order/${orderId}`)
    }
  } catch (error) {
    toast.add({ title: '获取订单失败', color: 'error' })
    router.replace('/cart')
  } finally {
    loading.value = false
  }
}

// 模拟支付
const handleMockPay = async () => {
  paying.value = true
  try {
    await payOrder(orderId)
    toast.add({ title: '支付成功', color: 'success' })
    setTimeout(() => {
      router.replace(`/order/${orderId}`) 
    }, 1000)
  } catch (error) {
    toast.add({ title: '支付失败', color: 'error' })
  } finally {
    paying.value = false
  }
}

// 支付宝支付
const handleAlipay = async () => {
  alipaying.value = true
  try {
    const response = await createAlipayPayment(orderId)
    
    if (response.formHtml) {
      // 标记用户正在使用支付宝支付，用于从支付宝回来后自动轮询
      localStorage.setItem(`alipay_pending_${orderId}`, Date.now().toString())
      
      // 创建一个临时容器来渲染支付宝表单
      const div = document.createElement('div')
      div.innerHTML = response.formHtml
      document.body.appendChild(div)
      
      // 查找表单并提交
      const form = div.querySelector('form')
      if (form) {
        // 跳转到支付宝（用户会离开当前页面）
        // 支付完成后会重定向到订单详情页，由订单详情页检测标记并开始轮询
        form.submit()
      } else {
        throw new Error('支付表单解析失败')
      }
    } else {
      throw new Error('未获取到支付信息')
    }
  } catch (error: any) {
    toast.add({ title: '发起支付失败', description: error.message, color: 'error' })
    alipaying.value = false
  }
}

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div v-if="loading" class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
      <p class="mt-4 text-gray-500">加载订单中...</p>
    </div>

    <div v-else-if="order" class="w-full max-w-md">
      <!-- Main Card -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-500 to-orange-500 px-8 py-6 text-center text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur">
              <UIcon name="i-lucide-credit-card" class="w-8 h-8" />
            </div>
            <h1 class="text-2xl font-bold mb-1">订单支付</h1>
            <p class="text-white/80 text-sm">请选择支付方式完成付款</p>
          </div>
        </div>

        <!-- Order Info -->
        <div class="p-6">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-6">
            <div class="flex justify-between items-center mb-3 text-sm">
              <span class="text-gray-500 dark:text-gray-400">订单编号</span>
              <span class="font-mono text-gray-900 dark:text-white text-xs">{{ order.orderNo }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">应付金额</span>
              <div class="text-right">
                <span class="text-sm text-gray-400 mr-1">¥</span>
                <span class="text-3xl font-bold text-orange-600">{{ order.payAmount }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="space-y-3 mb-6">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">选择支付方式</p>
            
            <!-- Alipay Option -->
            <label 
              class="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200"
              :class="paymentMethod === 'alipay' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
            >
              <input type="radio" v-model="paymentMethod" value="alipay" class="hidden" />
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <UIcon name="i-simple-icons-alipay" class="w-7 h-7 text-white" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">支付宝支付</div>
                <div class="text-xs text-gray-500">推荐使用，安全快捷</div>
              </div>
              <div 
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="paymentMethod === 'alipay' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
              >
                <div v-if="paymentMethod === 'alipay'" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </label>

            <!-- Mock Pay Option -->
            <label 
              class="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200"
              :class="paymentMethod === 'mock' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
            >
              <input type="radio" v-model="paymentMethod" value="mock" class="hidden" />
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="w-7 h-7 text-white" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">模拟支付</div>
                <div class="text-xs text-gray-500">仅供测试，直接完成</div>
              </div>
              <div 
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="paymentMethod === 'mock' ? 'border-green-500 bg-green-500' : 'border-gray-300'"
              >
                <div v-if="paymentMethod === 'mock'" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </label>
          </div>

          <!-- Pay Button -->
          <UButton 
            v-if="paymentMethod === 'alipay'"
            block 
            size="xl" 
            color="primary"
            :loading="alipaying"
            :disabled="alipaying"
            class="font-bold rounded-xl shadow-lg shadow-blue-500/30 bg-blue-500 hover:bg-blue-600 mb-3"
            @click="handleAlipay"
          >
            <UIcon name="i-simple-icons-alipay" class="w-5 h-5 mr-2" />
            {{ alipaying ? '正在跳转...' : '支付宝支付' }}
          </UButton>

          <UButton 
            v-else
            block 
            size="xl" 
            color="primary"
            :loading="paying"
            class="font-bold rounded-xl shadow-lg shadow-green-500/30 bg-green-500 hover:bg-green-600 mb-3"
            @click="handleMockPay"
          >
            <UIcon name="i-lucide-zap" class="w-5 h-5 mr-2" />
            确认支付 ¥{{ order.payAmount }}
          </UButton>

          <UButton 
            block 
            variant="ghost" 
            color="neutral" 
            to="/orders"
          >
            稍后支付
          </UButton>
        </div>
      </div>

      <!-- Tips -->
      <div class="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>支付过程中请勿关闭页面</p>
        <p>如遇支付问题，请联系客服</p>
      </div>
    </div>
  </div>
</template>
