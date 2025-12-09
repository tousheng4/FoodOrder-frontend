<script setup lang="ts">
import { getOrderDetail, cancelOrder, getPaymentStatus } from '~~/services/modules/order'
import { createReview } from '~~/services/modules/review'
import type { OrderDetailVO, OrderItemVO } from '~~/types/api'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const orderId = Number(route.params.id)
const loading = ref(true)
const order = ref<OrderDetailVO | null>(null)

// 支付状态轮询（用于从支付宝回来后）
let pollTimer: any = null
let pollAttempts = 0
const maxPollAttempts = 60 // 最多轮询60次（5分钟）
const isPolling = ref(false)

// Review Modal State
const isReviewModalOpen = ref(false)
const submittingReview = ref(false)
const reviewForm = reactive({
  dishId: 0,
  rating: 5,
  content: ''
})
const currentReviewDish = ref<OrderItemVO | null>(null)

const statusInfo = computed(() => {
  if (!order.value) return {}
  switch (order.value.status) {
    case 0: return { text: '待支付', icon: 'i-lucide-clock', color: 'text-orange-500', bg: 'bg-orange-50', desc: '请尽快完成支付' }
    case 1: return { text: '进行中', icon: 'i-lucide-chef-hat', color: 'text-blue-500', bg: 'bg-blue-50', desc: '商家正在准备您的美食' } // 后端状态 1=已支付(进行中)
    case 2: return { text: '已取消', icon: 'i-lucide-x-circle', color: 'text-gray-500', bg: 'bg-gray-50', desc: order.value.cancelReason ? `原因: ${order.value.cancelReason}` : '订单已取消' }
    case 3: return { text: '已完成', icon: 'i-lucide-check-circle-2', color: 'text-green-500', bg: 'bg-green-50', desc: '感谢您的订购，期待再次光临' }
    default: return { text: '未知状态', icon: 'i-lucide-help-circle', color: 'text-gray-400', bg: 'bg-gray-50', desc: '' }
  }
})

const fetchOrder = async () => {
  loading.value = true
  try {
    // 订单详情接口会自动同步支付服务的最新状态
    const res = await getOrderDetail(orderId)
    order.value = res
    
    // 检查是否从支付宝跳转回来（通过 localStorage 标记判断）
    const alipayPendingKey = `alipay_pending_${orderId}`
    const alipayPending = localStorage.getItem(alipayPendingKey)
    
    if (alipayPending && res.status === 0) {
      // 用户从支付宝回来，订单还是待支付状态，开始轮询
      startPaymentPolling()
    } else if (alipayPending) {
      // 订单已支付或已取消，清除标记
      localStorage.removeItem(alipayPendingKey)
    }
  } catch (error) {
    toast.add({ title: '获取订单详情失败', color: 'error' })
    router.replace('/orders')
  } finally {
    loading.value = false
  }
}

// 轮询支付状态（从支付宝回来后使用）
const startPaymentPolling = () => {
  if (isPolling.value) return
  
  isPolling.value = true
  pollAttempts = 0
  
  toast.add({ title: '正在查询支付结果...', color: 'info' })
  
  const poll = async () => {
    pollAttempts++
    
    try {
      const status = await getPaymentStatus(orderId)
      
      if (status.status === 'PAID') {
        stopPaymentPolling()
        localStorage.removeItem(`alipay_pending_${orderId}`)
        toast.add({ title: '支付成功', color: 'success' })
        // 重新获取订单详情更新页面
        const res = await getOrderDetail(orderId)
        order.value = res
        return
      } else if (status.status === 'FAILED') {
        stopPaymentPolling()
        localStorage.removeItem(`alipay_pending_${orderId}`)
        toast.add({ title: '支付失败或已取消', color: 'error' })
        const res = await getOrderDetail(orderId)
        order.value = res
        return
      }
    } catch (error) {
      console.error('轮询支付状态失败:', error)
    }
    
    // 继续轮询
    if (pollAttempts < maxPollAttempts) {
      pollTimer = setTimeout(poll, 5000) // 5秒后继续轮询
    } else {
      stopPaymentPolling()
      localStorage.removeItem(`alipay_pending_${orderId}`)
      toast.add({ title: '查询超时，请刷新页面查看最新状态', color: 'warning' })
    }
  }
  
  poll()
}

const stopPaymentPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  pollAttempts = 0
  isPolling.value = false
}

const handlePay = () => {
  router.push(`/order/pay/${orderId}`)
}

const handleCancel = async () => {
  const confirmed = confirm('确定要取消该订单吗？')
  if (!confirmed) return

  try {
    await cancelOrder(orderId)
    toast.add({ title: '订单已取消', color: 'success' })
    fetchOrder()
  } catch (error: any) {
    toast.add({ title: '取消失败', description: error.message, color: 'error' })
  }
}

// Open Review Modal
const openReviewModal = (item: OrderItemVO) => {
  currentReviewDish.value = item
  reviewForm.dishId = item.dishId
  reviewForm.rating = 5
  reviewForm.content = ''
  isReviewModalOpen.value = true
}

// Submit Review
const handleSubmitReview = async () => {
  if (!reviewForm.content.trim()) {
    toast.add({ title: '请输入评价内容', color: 'warning' })
    return
  }

  submittingReview.value = true
  try {
    await createReview({
      orderId: orderId,
      dishId: reviewForm.dishId,
      rating: reviewForm.rating,
      content: reviewForm.content
    })
    toast.add({ title: '评价成功', color: 'success' })
    isReviewModalOpen.value = false
  } catch (error: any) {
    toast.add({ title: '评价失败', description: error.message, color: 'error' })
  } finally {
    submittingReview.value = false
  }
}

onMounted(() => {
  fetchOrder()
})

onUnmounted(() => {
  stopPaymentPolling()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24">
    <AppHeader />

    <div v-if="loading" class="py-20 flex justify-center">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
    </div>

    <UContainer v-else-if="order" class="py-8 max-w-4xl">
      <!-- Header Status -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 mb-6 shadow-sm text-center relative overflow-hidden">
        <div class="relative z-10">
          <div :class="[statusInfo.bg, 'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors']">
            <UIcon :name="statusInfo.icon" :class="[statusInfo.color, 'w-10 h-10']" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ statusInfo.text }}</h1>
          <p class="text-gray-500 dark:text-gray-400">{{ statusInfo.desc }}</p>
          
          <div v-if="order.status === 0" class="mt-6 flex justify-center gap-4">
            <UButton color="neutral" variant="soft" @click="handleCancel">取消订单</UButton>
            <UButton color="primary" class="px-8 shadow-lg shadow-primary-500/20" @click="handlePay">立即支付</UButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Items -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <UIcon name="i-lucide-shopping-bag" class="text-orange-500" />
              商品详情
            </h2>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="item in order.items" :key="item.id" class="py-4 first:pt-0 last:pb-0 flex gap-4 group">
                <img :src="item.dishImage" :alt="item.dishName" class="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-100 dark:border-gray-700" />
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium text-gray-900 dark:text-white">{{ item.dishName }}</h3>
                      <div class="flex justify-between text-sm text-gray-500 mt-1">
                        <span>单价: ¥{{ item.unitPrice }}</span>
                        <span class="mx-2">x</span>
                        <span>{{ item.quantity }}</span>
                      </div>
                    </div>
                    <span class="font-bold text-gray-900 dark:text-white">¥{{ item.subTotal }}</span>
                  </div>
                  
                  <!-- Review Button -->
                  <div v-if="order.status === 3" class="flex justify-end mt-2">
                    <UButton 
                      size="xs" 
                      color="primary" 
                      variant="soft" 
                      icon="i-lucide-star"
                      @click="openReviewModal(item)"
                    >
                      评价
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
               <span class="text-gray-500">实付金额</span>
               <span class="text-2xl font-bold text-orange-600">¥{{ order.payAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Delivery Info -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="text-orange-500" />
              配送信息
            </h2>
            <div class="space-y-4 text-sm">
              <div>
                <span class="text-gray-500 block mb-1">收货人</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ order.receiverName }}</span>
              </div>
              <div>
                <span class="text-gray-500 block mb-1">联系电话</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ order.receiverPhone }}</span>
              </div>
              <div>
                <span class="text-gray-500 block mb-1">收货地址</span>
                <span class="font-medium text-gray-900 dark:text-white leading-relaxed">{{ order.receiverAddress }}</span>
              </div>
              <div v-if="order.remark">
                <span class="text-gray-500 block mb-1">订单备注</span>
                <span class="font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">{{ order.remark }}</span>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="text-orange-500" />
              订单信息
            </h2>
            <div class="space-y-3 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>订单编号</span>
                <span class="font-mono text-gray-900 dark:text-white">{{ order.orderNo }}</span>
              </div>
              <div class="flex justify-between">
                <span>下单时间</span>
                <span>{{ order.createdAt.replace('T', ' ') }}</span>
              </div>
              <div v-if="order.payTime" class="flex justify-between">
                <span>支付时间</span>
                <span>{{ order.payTime.replace('T', ' ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Review Modal -->
    <UModal v-model:open="isReviewModalOpen" :ui="{ width: 'sm:max-w-md' }">
      <template #content>
        <UCard :ui="{ body: { padding: 'p-0' } }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-message-square-plus" class="text-primary-500" />
                评价商品
              </h3>
              <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isReviewModalOpen = false" />
            </div>
          </template>

          <div class="p-6 space-y-6">
            <!-- Dish Info -->
            <div v-if="currentReviewDish" class="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
              <img :src="currentReviewDish.dishImage" class="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div class="font-medium text-gray-900 dark:text-white">{{ currentReviewDish.dishName }}</div>
                <div class="text-xs text-gray-500">留下您的宝贵意见</div>
              </div>
            </div>

            <!-- Rating -->
            <div class="text-center">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">评分</label>
              <div class="flex justify-center gap-2">
                <button 
                  v-for="star in 5" 
                  :key="star"
                  type="button"
                  @click="reviewForm.rating = star"
                  class="focus:outline-none transition-transform active:scale-95 hover:scale-110"
                >
                  <UIcon 
                    name="i-lucide-star" 
                    class="w-8 h-8" 
                    :class="star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'" 
                  />
                </button>
              </div>
              <p class="text-sm text-yellow-500 mt-2 font-medium">
                {{ ['非常不满意', '不满意', '一般', '满意', '非常满意'][reviewForm.rating - 1] }}
              </p>
            </div>

            <!-- Content -->
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">评价内容</label>
              <UTextarea 
                v-model="reviewForm.content" 
                placeholder="口味如何？环境怎样？服务周到吗？写点什么吧..." 
                :rows="4" 
                autoresize
              />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="gray" variant="ghost" @click="isReviewModalOpen = false">取消</UButton>
              <UButton 
                color="primary" 
                :loading="submittingReview"
                @click="handleSubmitReview"
              >
                提交评价
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>