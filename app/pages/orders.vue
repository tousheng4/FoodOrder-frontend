<script setup lang="ts">
import { getOrderList, cancelOrder } from '~~/services/modules/order'
import type { OrderSummaryVO } from '~~/types/api'

definePageMeta({
  middleware: ['auth']
})

const toast = useToast()
const router = useRouter()

// State
const loading = ref(false)
const orders = ref<OrderSummaryVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const currentStatus = ref<number | undefined>(undefined)

// Status Tabs
const statusTabs = [
  { label: '全部订单', value: undefined },
  { label: '待支付', value: 0 },
  { label: '进行中', value: 1 }, // 已支付
  { label: '已完成', value: 3 },
  { label: '已取消', value: 2 }
]

// Helper: Status Text & Color
const getStatusInfo = (status: number) => {
  switch (status) {
    case 0: return { text: '待支付', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
    case 1: return { text: '进行中', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
    case 2: return { text: '已取消', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
    case 3: return { text: '已完成', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' }
    default: return { text: '未知状态', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
  }
}

// Fetch Orders
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: page.value,
      size: pageSize.value,
      status: currentStatus.value
    })
    orders.value = res?.records || res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    toast.add({ title: '获取订单列表失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Handlers
const handleStatusChange = (status: number | undefined) => {
  currentStatus.value = status
  page.value = 1
  fetchOrders()
}

const handlePay = (orderId: number) => {
  router.push(`/order/pay/${orderId}`)
}

const handleDetail = (orderId: number) => {
  router.push(`/order/${orderId}`)
}

const handleCancel = async (orderId: number) => {
  const confirmed = confirm('确定要取消该订单吗？')
  if (!confirmed) return

  try {
    await cancelOrder(orderId)
    toast.add({ title: '订单已取消', color: 'success' })
    fetchOrders()
  } catch (error: any) {
    toast.add({ title: '取消失败', description: error.message, color: 'error' })
  }
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})

watch(page, () => {
  fetchOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
    <AppHeader />

    <UContainer class="py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的订单</h1>

      <!-- Status Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="tab in statusTabs"
          :key="tab.label"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          :class="currentStatus === tab.value 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          @click="handleStatusChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && orders.length === 0" class="py-20 flex justify-center">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-clipboard-list" class="w-12 h-12 text-gray-300 dark:text-gray-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">暂无相关订单</h3>
        <p class="text-gray-500 mb-8">去看看有什么好吃的吧</p>
        <UButton to="/categories" color="primary" size="lg">
          去逛逛
        </UButton>
      </div>

      <!-- Order List -->
      <div v-else class="space-y-6">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
        >
          <!-- Header -->
          <div class="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700/50 mb-4">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ order.createdAt?.replace('T', ' ') }}
              </span>
              <span class="text-xs text-gray-400 hidden sm:inline">
                订单号: {{ order.orderNo }}
              </span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold border"
              :class="[getStatusInfo(order.status).color, getStatusInfo(order.status).bg, getStatusInfo(order.status).border]"
            >
              {{ getStatusInfo(order.status).text }}
            </span>
          </div>

          <!-- Content (Summary) -->
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-1">
               <div class="text-sm text-gray-500">订单总额</div>
               <div class="text-2xl font-bold text-gray-900 dark:text-white">
                 ¥{{ order.totalAmount }}
               </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-3">
              <UButton 
                v-if="order.status === 0"
                color="neutral" 
                variant="ghost"
                size="sm"
                class="text-gray-500 hover:text-red-500"
                @click.stop="handleCancel(order.id)"
              >
                取消订单
              </UButton>
              
              <UButton 
                color="gray" 
                variant="soft"
                size="sm"
                @click="handleDetail(order.id)"
              >
                查看详情
              </UButton>
              
              <UButton 
                v-if="order.status === 0"
                color="primary" 
                size="sm"
                class="px-6 shadow-lg shadow-primary-500/20"
                @click.stop="handlePay(order.id)"
              >
                去支付
              </UButton>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="flex justify-center pt-8">
          <UPagination 
            v-model:page="page" 
            :items-per-page="pageSize" 
            :total="total"
            :max="5"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>