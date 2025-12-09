<script setup lang="ts">
import { getAdminOrderPage, getAdminOrderDetail, updateOrderStatus } from '~~/services/modules/admin/order'
import type { AdminOrderSummaryVO, OrderDetailVO } from '~~/types/api'

definePageMeta({
  middleware: ['auth']
})

const toast = useToast()

// State
const loading = ref(false)
const orders = ref<AdminOrderSummaryVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// Filters
const searchOrderNo = ref('')
const selectedStatus = ref<number | undefined>(undefined)
const dateRange = ref({ start: '', end: '' })

// Status Options
const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '待支付', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已取消', value: 2 },
  { label: '已完成', value: 3 }
]

// Detail Modal
const isDetailModalOpen = ref(false)
const selectedOrder = ref<OrderDetailVO | null>(null)
const detailLoading = ref(false)

// Helper: Status Info
const getStatusInfo = (status: number) => {
  switch (status) {
    case 0: return { text: '待支付', color: 'text-orange-500', bg: 'bg-orange-50', badge: 'orange' }
    case 1: return { text: '进行中', color: 'text-blue-500', bg: 'bg-blue-50', badge: 'blue' }
    case 2: return { text: '已取消', color: 'text-gray-500', bg: 'bg-gray-50', badge: 'gray' }
    case 3: return { text: '已完成', color: 'text-green-500', bg: 'bg-green-50', badge: 'green' }
    default: return { text: '未知', color: 'text-gray-500', bg: 'bg-gray-50', badge: 'gray' }
  }
}

// Fetch Orders
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getAdminOrderPage({
      page: page.value,
      size: pageSize.value,
      orderNo: searchOrderNo.value || undefined,
      status: selectedStatus.value,
      // simple date handling
      from: dateRange.value.start ? new Date(dateRange.value.start).toISOString() : undefined,
      to: dateRange.value.end ? new Date(dateRange.value.end).toISOString() : undefined
    })
    orders.value = res?.records || res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    toast.add({ title: '获取订单列表失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Open Detail
const openDetail = async (id: number) => {
  isDetailModalOpen.value = true
  detailLoading.value = true
  try {
    const res = await getAdminOrderDetail(id)
    selectedOrder.value = res
  } catch (error) {
    toast.add({ title: '获取详情失败', color: 'error' })
    isDetailModalOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

// Update Status
const handleStatusUpdate = async (newStatus: number, cancelReason?: string) => {
  if (!selectedOrder.value) return
  
  // Confirmation
  if (!confirm('确定要更改订单状态吗？')) return

  try {
    await updateOrderStatus(selectedOrder.value.id, {
      status: newStatus,
      cancelReason
    })
    toast.add({ title: '状态更新成功', color: 'success' })
    
    // Refresh Detail & List
    await openDetail(selectedOrder.value.id)
    fetchOrders()
  } catch (error: any) {
    toast.add({ title: '操作失败', description: error.message, color: 'error' })
  }
}

const handleCancelOrder = () => {
  const reason = prompt('请输入取消原因：')
  if (reason === null) return // Cancelled prompt
  handleStatusUpdate(2, reason || '管理员取消')
}

// Watchers
watch(page, fetchOrders)

// Lifecycle
onMounted(fetchOrders)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <UButton 
            to="/admin" 
            icon="i-lucide-arrow-left" 
            color="gray" 
            variant="ghost" 
            class="hidden md:flex"
          />
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-clipboard-list" class="w-7 h-7 text-primary-500" />
              订单管理
            </h1>
            <p class="text-gray-500 text-sm mt-1">查看和管理系统中的所有订单</p>
          </div>
        </div>
        <div class="flex gap-3">
          <UButton icon="i-lucide-refresh-cw" color="gray" variant="ghost" @click="fetchOrders" :loading="loading">刷新</UButton>
        </div>
      </div>

      <!-- Filters -->
      <UCard class="mb-8 overflow-visible">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UInput 
            v-model="searchOrderNo" 
            icon="i-lucide-search" 
            placeholder="搜索订单号..." 
            @keyup.enter="page = 1; fetchOrders()" 
          />
          
          <USelectMenu 
            v-model="selectedStatus" 
            :options="statusOptions" 
            value-attribute="value"
            option-attribute="label"
            placeholder="订单状态"
          />

          <div class="flex gap-2 md:col-span-2">
             <!-- Simple Date Inputs for now -->
             <input 
               v-model="dateRange.start"
               type="date" 
               class="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
             />
             <span class="self-center text-gray-400">-</span>
             <input 
               v-model="dateRange.end"
               type="date" 
               class="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
             />
             <UButton icon="i-lucide-search" color="primary" @click="page = 1; fetchOrders()" />
             <UButton 
               icon="i-lucide-x" 
               color="gray" 
               variant="soft" 
               @click="searchOrderNo = ''; selectedStatus = undefined; dateRange = {start: '', end: ''}; page = 1; fetchOrders()" 
             />
          </div>
        </div>
      </UCard>

      <!-- Table -->
      <UCard class="overflow-hidden" :ui="{ body: { padding: 'p-0' } }">
        <!-- Loading -->
        <div v-if="loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        </div>

        <!-- Empty -->
        <div v-else-if="orders.length === 0" class="p-12 text-center">
           <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <p class="text-gray-500">暂无符合条件的订单</p>
        </div>

        <!-- Data -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
            <tr>
                <th class="px-6 py-4">订单信息</th>
                <th class="px-6 py-4">用户ID</th>
                <th class="px-6 py-4">金额</th>
                <th class="px-6 py-4">状态</th>
                <th class="px-6 py-4">下单时间</th>
                <th class="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-mono font-medium text-gray-900 dark:text-white">{{ order.orderNo }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600">#{{ order.userId }}</td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900 dark:text-white">¥{{ order.totalAmount }}</div>
                  <div v-if="order.status !== 0" class="text-xs text-gray-400">实付: ¥{{ order.payAmount }}</div>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="getStatusInfo(order.status).badge" variant="subtle" size="xs">
                    {{ getStatusInfo(order.status).text }}
                </UBadge>
              </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ order.createdAt.replace('T', ' ') }}
                </td>
                <td class="px-6 py-4 text-right">
                  <UButton size="xs" color="gray" variant="ghost" @click="openDetail(order.id)">详情</UButton>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end">
          <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
        </div>
      </UCard>
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="isDetailModalOpen" :ui="{ width: 'sm:max-w-3xl', padding: 'p-0' }">
      <template #content>
        <div class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-orange-500">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <UIcon name="i-lucide-clipboard-list" class="w-5 h-5" />
              订单详情
              <span v-if="selectedOrder" class="text-sm font-normal font-mono bg-white/20 px-2 py-0.5 rounded">
                {{ selectedOrder.orderNo }}
              </span>
            </h3>
            <UButton color="white" variant="ghost" icon="i-lucide-x" @click="isDetailModalOpen = false" class="hover:bg-white/20" />
          </div>

          <!-- Modal Body -->
          <div v-if="detailLoading" class="p-12 text-center">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        </div>

          <div v-else-if="selectedOrder" class="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            <!-- Status Bar -->
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <div class="flex items-center gap-3">
                <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${getStatusInfo(selectedOrder.status).bg}`">
                  <UIcon :name="selectedOrder.status === 3 ? 'i-lucide-check' : 'i-lucide-clock'" :class="`w-5 h-5 ${getStatusInfo(selectedOrder.status).color}`" />
                </div>
                <div>
                  <div class="font-bold text-gray-900 dark:text-white">{{ getStatusInfo(selectedOrder.status).text }}</div>
                  <div v-if="selectedOrder.cancelReason" class="text-xs text-red-500">原因: {{ selectedOrder.cancelReason }}</div>
            </div>
          </div>

              <!-- Actions -->
              <div class="flex gap-2">
            <UButton 
                  v-if="selectedOrder.status === 0" 
              color="red" 
              variant="soft" 
                  size="sm"
                  @click="handleCancelOrder"
            >
              取消订单
            </UButton>
                <UButton 
                  v-if="selectedOrder.status === 1" 
                  color="green" 
                  variant="solid" 
                  size="sm"
                  @click="handleStatusUpdate(3)"
                >
                  完成订单
                </UButton>
              </div>
          </div>

            <!-- Items -->
          <div>
              <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-wider">商品明细</h4>
             <div class="space-y-3">
                <div v-for="item in selectedOrder.items" :key="item.id" class="flex gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <img :src="item.dishImage" class="w-16 h-16 object-cover rounded-md bg-gray-100" />
                 <div class="flex-1">
                   <div class="flex justify-between mb-1">
                     <span class="font-medium text-gray-900 dark:text-white">{{ item.dishName }}</span>
                     <span class="font-bold">¥{{ item.subTotal }}</span>
                   </div>
                    <div class="text-sm text-gray-500 flex justify-between">
                      <span>单价: ¥{{ item.unitPrice }}</span>
                      <span>x{{ item.quantity }}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>

            <!-- Grid Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Delivery -->
          <div>
                <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-wider">配送信息</h4>
                <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex gap-2">
                    <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-400" />
                    <span>{{ selectedOrder.receiverName }}</span>
               </div>
                  <div class="flex gap-2">
                    <UIcon name="i-lucide-phone" class="w-4 h-4 text-gray-400" />
                    <span>{{ selectedOrder.receiverPhone }}</span>
               </div>
                  <div class="flex gap-2">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{{ selectedOrder.receiverAddress }}</span>
               </div>
                  <div v-if="selectedOrder.remark" class="mt-2 bg-yellow-50 text-yellow-800 p-2 rounded text-xs">
                    备注: {{ selectedOrder.remark }}
               </div>
             </div>
          </div>

              <!-- Payment -->
          <div>
                <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-wider">支付信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">下单时间</span>
                    <span class="text-gray-900 dark:text-white">{{ selectedOrder.createdAt.replace('T', ' ') }}</span>
                  </div>
                  <div v-if="selectedOrder.payTime" class="flex justify-between">
                    <span class="text-gray-500">支付时间</span>
                    <span class="text-gray-900 dark:text-white">{{ selectedOrder.payTime.replace('T', ' ') }}</span>
               </div>
                  <div class="border-t border-gray-100 dark:border-gray-700 my-2 pt-2"></div>
                  <div class="flex justify-between font-bold text-lg">
                    <span class="text-gray-900 dark:text-white">实付金额</span>
                    <span class="text-orange-600">¥{{ selectedOrder.payAmount }}</span>
               </div>
               </div>
               </div>
             </div>
          </div>
          </div>
        </template>
    </UModal>
  </div>
</template>
