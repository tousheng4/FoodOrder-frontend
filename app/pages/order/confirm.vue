<script setup lang="ts">
import { useCart } from '~~/composables/useCart'
import { getAddressList, addAddress } from '~~/services/modules/address'
import { createOrder } from '~~/services/modules/order'
import type { AddressVO, AddressCreateRequest } from '~~/services/modules/address'

definePageMeta({
  middleware: ['auth']
})

const router = useRouter()
const toast = useToast()
const { cartItems, totalAmount, loading: cartLoading } = useCart()

// Redirect if cart is empty
watchEffect(() => {
  if (!cartLoading.value && cartItems.value.length === 0) {
    toast.add({ title: '购物车为空', color: 'warning' })
    router.replace('/cart')
  }
})

// State
const loading = ref(false)
const addresses = ref<AddressVO[]>([])
const selectedAddressId = ref<number | undefined>(undefined)
const remark = ref('')

// Add Address Form
const showAddAddressForm = ref(false)
const newAddress = reactive<AddressCreateRequest>({
  receiverName: '',
  receiverPhone: '',
  detailAddress: ''
})

// Fetch Data
const fetchAddresses = async () => {
  try {
    const res = await getAddressList()
    addresses.value = res || []
    // Set default address if available
    const defaultAddr = addresses.value.find(a => a.isDefault === 1)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (error) {
    console.error('Fetch addresses error:', error)
  }
}

const handleAddAddress = async () => {
  if (!newAddress.receiverName || !newAddress.receiverPhone || !newAddress.detailAddress) {
    toast.add({ title: '请填写完整地址信息', color: 'warning' })
    return
  }

  try {
    await addAddress(newAddress)
    toast.add({ title: '地址添加成功', color: 'success' })
    showAddAddressForm.value = false
    // Reset form
    newAddress.receiverName = ''
    newAddress.receiverPhone = ''
    newAddress.detailAddress = ''
    // Refresh list
    await fetchAddresses()
  } catch (error) {
    toast.add({ title: '添加地址失败', color: 'error' })
  }
}

const handleSubmitOrder = async () => {
  if (!selectedAddressId.value) {
    toast.add({ title: '请选择收货地址', color: 'warning' })
    return
  }

  const address = addresses.value.find(a => a.id === selectedAddressId.value)
  if (!address) return

  loading.value = true
  try {
    const orderId = await createOrder({
      addressId: address.id,
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      receiverAddress: address.detailAddress,
      remark: remark.value
    })
    
    toast.add({ title: '订单创建成功', color: 'success' })
    router.push(`/order/pay/${orderId}`)
  } catch (error: any) {
    toast.add({ title: '下单失败', description: error.message || '请稍后重试', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
    <AppHeader />

    <UContainer class="py-8">
      <div class="flex items-center gap-4 mb-8">
        <UButton 
          icon="i-lucide-arrow-left" 
          variant="ghost" 
          color="gray" 
          @click="$router.back()"
        />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">确认订单</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Address & Items -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Address Section -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="text-orange-500" />
                收货地址
              </h2>
              <UButton 
                v-if="!showAddAddressForm"
                size="sm" 
                variant="soft" 
                color="primary" 
                icon="i-lucide-plus"
                @click="showAddAddressForm = true"
              >
                新增地址
              </UButton>
            </div>

            <!-- New Address Form -->
            <div v-if="showAddAddressForm" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <UFormGroup label="收货人">
                  <UInput v-model="newAddress.receiverName" placeholder="请输入姓名" />
                </UFormGroup>
                <UFormGroup label="手机号码">
                  <UInput v-model="newAddress.receiverPhone" placeholder="请输入手机号" />
                </UFormGroup>
                <UFormGroup label="详细地址" class="sm:col-span-2">
                  <UTextarea v-model="newAddress.detailAddress" placeholder="请输入详细地址（街道、门牌号等）" autoresize />
                </UFormGroup>
              </div>
              <div class="flex gap-3 justify-end">
                <UButton color="gray" variant="ghost" @click="showAddAddressForm = false">取消</UButton>
                <UButton color="primary" @click="handleAddAddress">保存地址</UButton>
              </div>
            </div>

            <!-- Address List -->
            <div v-if="addresses.length > 0" class="grid gap-4">
              <div 
                v-for="addr in addresses" 
                :key="addr.id"
                class="relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4"
                :class="selectedAddressId === addr.id 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
                  : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'"
                @click="selectedAddressId = addr.id"
              >
                <div class="flex h-6 items-center">
                  <div class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                    :class="selectedAddressId === addr.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'"
                  >
                    <div v-if="selectedAddressId === addr.id" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-bold text-gray-900 dark:text-white">{{ addr.receiverName }}</span>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">{{ addr.receiverPhone }}</span>
                    <span v-if="addr.isDefault" class="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-xs text-gray-600 dark:text-gray-300">默认</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-300 text-sm">{{ addr.detailAddress }}</p>
                </div>
              </div>
            </div>
            <div v-else-if="!showAddAddressForm" class="text-center py-8 text-gray-500">
              暂无收货地址，请先添加
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="text-lg font-bold flex items-center gap-2 mb-6">
              <UIcon name="i-lucide-shopping-bag" class="text-orange-500" />
              商品清单
            </h2>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="item in cartItems" :key="item.dishId" class="py-4 first:pt-0 last:pb-0 flex gap-4">
                <img :src="item.dishImage" :alt="item.dishName" class="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ item.dishName }}</h3>
                    <span class="font-bold">¥{{ item.price * item.quantity }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-500">
                    <span>x {{ item.quantity }}</span>
                    <span>单价: ¥{{ item.price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Summary & Submit -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="text-lg font-bold mb-6">订单备注</h2>
            <UTextarea 
              v-model="remark" 
              placeholder="口味偏好、餐具数量等..." 
              :rows="3" 
              class="mb-8"
            />

            <h2 class="text-lg font-bold mb-4">费用明细</h2>
            <div class="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>商品总价</span>
                <span>¥{{ totalAmount }}</span>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>配送费</span>
                <span class="text-green-500">免运费</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-8">
              <span class="font-bold text-gray-900 dark:text-white">合计</span>
              <div class="flex items-baseline gap-1 text-orange-600">
                <span class="text-sm font-bold">¥</span>
                <span class="text-3xl font-extrabold">{{ totalAmount }}</span>
              </div>
            </div>

            <UButton 
              block 
              size="xl" 
              color="primary" 
              :loading="loading"
              :disabled="addresses.length === 0 && !showAddAddressForm"
              class="font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 rounded-xl"
              @click="handleSubmitOrder"
            >
              提交订单
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>