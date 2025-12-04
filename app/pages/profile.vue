<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'
import { updateUserInfo } from '~~/services/modules/user'
import { 
  getAddressList, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  type AddressVO
} from '~~/services/modules/address'

const { user, logout, isAuthenticated, updateUser, refreshUser } = useAuth()
const toast = useToast()

// Edit Profile State
const isEditProfileModalOpen = ref(false)
const profileForm = reactive({
  nickname: '',
  avatarFile: null as File | null,
  avatarPreview: ''
})
const profileSaving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Open Edit Modal
const openEditProfileModal = () => {
  profileForm.nickname = user.value?.nickname || user.value?.username || ''
  profileForm.avatarFile = null
  profileForm.avatarPreview = user.value?.avatar || ''
  isEditProfileModalOpen.value = true
}

// Handle File Change
const onAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // Validate file size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.add({ title: '图片大小不能超过2MB', color: 'warning' })
      input.value = ''
      return
    }
    
    profileForm.avatarFile = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.avatarPreview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Save Profile
const saveProfile = async () => {
  if (!profileForm.nickname.trim()) {
    toast.add({ title: '请输入昵称', color: 'warning' })
    return
  }
  
  profileSaving.value = true
  try {
    await updateUserInfo({
      nickname: profileForm.nickname,
      avatarFile: profileForm.avatarFile || undefined
    })
    
    // 从服务器刷新用户信息以获取最新的头像URL
    await refreshUser()
    
    toast.add({ title: '个人信息更新成功', color: 'success' })
    isEditProfileModalOpen.value = false
    
  } catch (error: any) {
    console.error('更新失败:', error)
    toast.add({ title: '更新失败', description: error.message, color: 'error' })
  } finally {
    profileSaving.value = false
  }
}

// 如果未登录，重定向到登录页
if (!isAuthenticated.value) {
  await navigateTo('/login')
}

// Address State
const addresses = ref<AddressVO[]>([])
const loading = ref(false)
const saving = ref(false)
const isAddressModalOpen = ref(false)
const editingAddress = ref<AddressVO | null>(null)
const pageLoading = ref(true)

// Map Component Ref
const addressMapRef = ref()

const addressForm = reactive({
  receiverName: '',
  receiverPhone: '',
  detailAddress: ''
})

// 监听地址输入，防抖搜索
let searchTimer: any = null
const onAddressInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (addressMapRef.value && addressForm.detailAddress) {
      addressMapRef.value.searchAddressLocation(addressForm.detailAddress)
    }
  }, 1000) // 1秒防抖
}

// Fetch Addresses

// Fetch Addresses
const fetchAddresses = async () => {
  loading.value = true
  try {
    const data = await getAddressList()
    addresses.value = data || []
  } catch (error: any) {
    console.error('获取地址失败:', error)
    toast.add({ 
      title: '获取地址失败', 
      description: error.message || '网络错误，请稍后重试',
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
}

// Open Modal
const openAddressModal = (address?: AddressVO) => {
  if (address) {
    editingAddress.value = address
    addressForm.receiverName = address.receiverName
    addressForm.receiverPhone = address.receiverPhone
    addressForm.detailAddress = address.detailAddress
  } else {
    editingAddress.value = null
    addressForm.receiverName = ''
    addressForm.receiverPhone = ''
    addressForm.detailAddress = ''
  }
  isAddressModalOpen.value = true
}

// Save Address
const saveAddress = async () => {
  // 表单验证
  if (!addressForm.receiverName.trim()) {
    toast.add({ title: '请输入收货人姓名', color: 'warning' })
    return
  }
  if (!addressForm.receiverPhone.trim()) {
    toast.add({ title: '请输入手机号码', color: 'warning' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(addressForm.receiverPhone.trim())) {
    toast.add({ title: '请输入正确的手机号码', color: 'warning' })
    return
  }
  if (!addressForm.detailAddress.trim()) {
    toast.add({ title: '请输入详细地址', color: 'warning' })
    return
  }

  saving.value = true
  try {
    if (editingAddress.value) {
      await updateAddress(editingAddress.value.id, {
        receiverName: addressForm.receiverName.trim(),
        receiverPhone: addressForm.receiverPhone.trim(),
        detailAddress: addressForm.detailAddress.trim()
      })
      toast.add({ title: '地址更新成功', color: 'success' })
    } else {
      await addAddress({
        receiverName: addressForm.receiverName.trim(),
        receiverPhone: addressForm.receiverPhone.trim(),
        detailAddress: addressForm.detailAddress.trim()
      })
      toast.add({ title: '地址添加成功', color: 'success' })
    }
    isAddressModalOpen.value = false
    await fetchAddresses()
  } catch (error: any) {
    console.error('保存地址失败:', error)
    toast.add({ 
      title: '保存失败', 
      description: error.message || '网络错误，请稍后重试', 
      color: 'error' 
    })
  } finally {
    saving.value = false
  }
}

// Delete Address
const removeAddress = async (id: number, addressName: string) => {
  const confirmed = confirm(`确定要删除"${addressName}"的地址吗？此操作不可恢复。`)
  if (!confirmed) return
  
  try {
    await deleteAddress(id)
    toast.add({ 
      title: '删除成功', 
      description: `已成功删除"${addressName}"的地址`,
      color: 'success' 
    })
    await fetchAddresses()
  } catch (error: any) {
    console.error('删除地址失败:', error)
    toast.add({ 
      title: '删除失败', 
      description: error.message || '网络错误，请稍后重试',
      color: 'error' 
    })
  }
}

// Set Default
const setAsDefault = async (id: number, addressName: string) => {
  try {
    await setDefaultAddress(id)
    toast.add({ 
      title: '设置成功', 
      description: `已将"${addressName}"的地址设为默认`,
      color: 'success' 
    })
    await fetchAddresses()
  } catch (error: any) {
    console.error('设置默认地址失败:', error)
    toast.add({ 
      title: '设置失败', 
      description: error.message || '网络错误，请稍后重试',
      color: 'error' 
    })
  }
}

onMounted(async () => {
  if (user.value) {
    await fetchAddresses()
  }
  pageLoading.value = false
})
</script>

<template>
  <!-- 页面加载状态 -->
  <div v-if="pageLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">加载中...</p>
    </div>
  </div>

  <!-- 主要内容 -->
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader />
    
    <!-- Page Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="container mx-auto px-4 py-6 max-w-6xl">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <UIcon name="i-lucide-user-cog" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">个人中心</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">管理您的个人信息和收货地址</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Left: User Profile -->
        <div class="lg:col-span-1">
          <UCard class="overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="text-primary-500" />
                  <span class="font-semibold text-gray-900 dark:text-white">个人信息</span>
                </div>
                <UButton 
                  size="xs" 
                  icon="i-lucide-edit" 
                  color="gray" 
                  variant="ghost"
                  @click="openEditProfileModal"
                >
                  编辑
                </UButton>
              </div>
            </template>
            
            <div class="text-center py-6">
              <div class="relative inline-block mb-4">
                <UAvatar 
                  :src="user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'" 
                  size="3xl" 
                  alt="头像"
                  class="ring-4 ring-primary-50 dark:ring-primary-900/20 shadow-lg"
                />
                <div class="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {{ user?.nickname || user?.username }}
              </h2>
              <p class="text-gray-500 text-sm mb-3">{{ user?.phone }}</p>
              
              <UBadge 
                :color="user?.role === 1 ? 'primary' : 'success'" 
                variant="soft" 
                class="px-3 py-1"
              >
                <UIcon 
                  :name="user?.role === 1 ? 'i-lucide-crown' : 'i-lucide-user'" 
                  class="w-3 h-3 mr-1" 
                />
                {{ user?.role === 1 ? '管理员' : '普通用户' }}
              </UBadge>
            </div>

            <div class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user-2" class="text-gray-400" />
                  <span class="text-sm text-gray-600 dark:text-gray-400">用户名</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.username }}</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-hash" class="text-gray-400" />
                  <span class="text-sm text-gray-600 dark:text-gray-400">用户ID</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">#{{ user?.id }}</span>
              </div>
            </div>

            <template #footer>
              <UButton 
                block 
                color="secondary" 
                variant="ghost" 
                icon="i-lucide-log-out" 
                @click="logout"
                class="font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              >
                退出登录
              </UButton>
            </template>
          </UCard>
        </div>

        <!-- Right: Address Management -->
        <div class="lg:col-span-3">
          <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" class="text-primary-500" />
                  <span class="font-semibold text-gray-900 dark:text-white">收货地址</span>
                  <UBadge size="sm" variant="soft" color="primary">{{ addresses.length }}</UBadge>
                </div>
                <UButton 
                  size="sm" 
                  icon="i-lucide-plus" 
                  color="primary"
                  variant="solid"
                  @click="openAddressModal()"
                  class="font-medium text-white"
                >
                  新增地址
                </UButton>
              </div>
            </template>

            <!-- Loading State -->
            <div v-if="loading" class="py-12 text-center">
              <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-primary-400 mb-4" />
              <p class="text-gray-500">加载地址信息中...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="addresses.length === 0" class="py-12 text-center">
              <div class="mb-4">
                <div class="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto">
                  <UIcon name="i-lucide-map-pin-off" class="text-4xl text-primary-300 dark:text-primary-600" />
                </div>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无收货地址</h3>
              <p class="text-gray-500 mb-6">添加您的第一个收货地址，享受便捷的配送服务</p>
              <UButton icon="i-lucide-plus" color="primary" @click="openAddressModal()">
                立即添加
              </UButton>
            </div>

            <!-- Address List -->
            <div v-else>
              <TransitionGroup name="list" tag="div" class="space-y-3">
                <div 
                  v-for="addr in addresses" 
                  :key="addr.id" 
                  class="group relative border rounded-xl p-5 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800"
                  :class="{
                    'border-primary-200 bg-primary-50/30 ring-1 ring-primary-200 dark:border-primary-800 dark:bg-primary-900/10': addr.isDefault === 1,
                    'border-gray-200 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-700': addr.isDefault !== 1
                  }"
                >
                  <!-- Default Badge -->
                  <div 
                    v-if="addr.isDefault === 1" 
                    class="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-primary-500 to-red-500 text-white text-xs font-medium rounded-full shadow-sm"
                  >
                    <UIcon name="i-lucide-star" class="w-3 h-3 mr-1" />
                    默认地址
                  </div>

                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-3">
                        <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ addr.receiverName }}</h4>
                        <div class="flex items-center gap-1 text-gray-500">
                          <UIcon name="i-lucide-phone" class="w-4 h-4" />
                          <span class="text-sm">{{ addr.receiverPhone }}</span>
                        </div>
                      </div>
                      
                      <div class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                        <UIcon name="i-lucide-map-pin" class="w-4 h-4 mt-0.5 text-gray-400" />
                        <p class="text-sm leading-relaxed">{{ addr.detailAddress }}</p>
                      </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UTooltip text="设为默认" v-if="addr.isDefault !== 1">
                        <UButton 
                          icon="i-lucide-star" 
                          color="primary" 
                          variant="ghost" 
                          size="sm" 
                          @click="setAsDefault(addr.id, addr.receiverName)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="编辑地址">
                        <UButton 
                          icon="i-lucide-pencil" 
                          color="primary" 
                          variant="ghost" 
                          size="sm" 
                          @click="openAddressModal(addr)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="删除地址">
                        <UButton 
                          icon="i-lucide-trash-2" 
                          color="secondary" 
                          variant="ghost" 
                          size="sm" 
                          @click="removeAddress(addr.id, addr.receiverName)"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <UModal 
      v-model:open="isEditProfileModalOpen" 
      :ui="{ width: 'sm:max-w-lg', padding: 'p-0', overlay: { background: 'bg-gray-900/50 backdrop-blur-sm' } }"
    >
      <template #content>
        <!-- Custom Header with Gradient -->
        <div class="relative bg-gradient-to-br from-primary-500 to-red-600 px-6 py-6 overflow-hidden">
          <div class="relative z-10 flex items-center justify-between text-white">
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                <UIcon name="i-lucide-user-cog" class="w-6 h-6" />
                编辑个人信息
              </h3>
              <p class="text-primary-100 text-sm mt-1">更新您的头像与昵称，展示个性化形象</p>
            </div>
            <UButton 
              color="white" 
              variant="ghost" 
              icon="i-lucide-x" 
              size="sm"
              class="hover:bg-white/20 text-white"
              @click="isEditProfileModalOpen = false"
            />
          </div>
          
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 -mb-8 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
        </div>
        
        <div class="p-8 bg-white dark:bg-gray-800">
          <div class="space-y-8">
            <!-- Avatar Upload Section -->
            <div class="flex flex-col items-center justify-center">
              <div class="relative group cursor-pointer" @click="fileInput?.click()">
                <div class="relative">
                  <UAvatar 
                    :src="profileForm.avatarPreview || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'" 
                    size="3xl" 
                    class="ring-4 ring-white dark:ring-gray-700 shadow-xl transition-transform duration-300 group-hover:scale-105"
                    :ui="{ root: 'w-28 h-28 text-3xl' }"
                  />
                  <!-- Edit Overlay -->
                  <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                    <UIcon name="i-lucide-camera" class="text-white w-8 h-8 drop-shadow-md transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                  </div>
                  <!-- Status Badge -->
                  <div class="absolute bottom-1 right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                    <div class="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                       <UIcon name="i-lucide-pencil" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <p class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400 group-hover:text-primary-500 transition-colors font-medium">点击更换头像</p>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*"
                @change="onAvatarChange" 
              />
            </div>

            <!-- Form Inputs -->
            <div class="space-y-5">
              <div class="group">
                <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-primary-600 transition-colors">
                  <UIcon name="i-lucide-smile" class="w-4 h-4 mr-2 text-gray-400 group-focus-within:text-primary-500" />
                  用户昵称
                </label>
                <UInput 
                  v-model="profileForm.nickname" 
                  placeholder="请输入您的昵称" 
                  icon="i-lucide-user"
                  size="lg"
                  :ui="{ 
                    icon: { trailing: { pointer: '' } }
                  }"
                  class="transition-all duration-200"
                />
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">这将是您在平台上的公开显示名称</p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <UButton 
              color="gray" 
              variant="ghost" 
              size="md"
              @click="isEditProfileModalOpen = false"
              :disabled="profileSaving"
              class="px-6 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              取消
            </UButton>
            <UButton 
              color="primary" 
              variant="solid"
              size="md"
              :loading="profileSaving"
              @click="saveProfile"
              class="px-8 bg-gradient-to-r from-primary-500 to-red-600 hover:from-primary-600 hover:to-red-700 shadow-lg shadow-primary-500/25 border-none text-white"
              icon="i-lucide-save"
            >
              保存修改
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Address Modal -->
    <UModal 
      v-model:open="isAddressModalOpen" 
      :ui="{ width: 'sm:max-w-2xl', padding: 'p-0' }"
    >
      <template #content>
        <!-- Custom Header -->
        <div class="relative bg-gradient-to-r from-orange-500 to-red-600 px-6 py-6">
          <div class="flex items-center justify-between text-white">
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                <UIcon :name="editingAddress ? 'i-lucide-pencil' : 'i-lucide-plus-circle'" class="w-6 h-6" />
                {{ editingAddress ? '编辑收货地址' : '新增收货地址' }}
              </h3>
              <p class="text-orange-100 text-sm mt-1">
                {{ editingAddress ? '更新您的配送信息' : '添加新的配送目的地' }}
              </p>
            </div>
            <UButton 
              color="secondary" 
              variant="ghost" 
              icon="i-lucide-x" 
              size="sm"
              class="hover:bg-white/20 text-white"
              @click="isAddressModalOpen = false"
            />
          </div>
          <!-- Decorative Circles -->
          <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveAddress" class="space-y-5">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="group">
                <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-orange-600 transition-colors">
                  <UIcon name="i-lucide-user" class="w-4 h-4 mr-1.5 text-gray-400 group-focus-within:text-orange-500" />
                  收货人姓名
                </label>
                <UInput 
                  v-model="addressForm.receiverName" 
                  placeholder="请输入姓名" 
                  size="lg"
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                  class="transition-all duration-200"
                />
              </div>
              
              <div class="group">
                <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-orange-600 transition-colors">
                  <UIcon name="i-lucide-phone" class="w-4 h-4 mr-1.5 text-gray-400 group-focus-within:text-orange-500" />
                  手机号码
                </label>
                <UInput 
                  v-model="addressForm.receiverPhone" 
                  placeholder="请输入11位手机号" 
                  size="lg"
                  class="w-full"
                />
              </div>
            </div>
            
            <div class="group">
              <label class="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-orange-600 transition-colors">
                <div class="flex items-center">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4 mr-1.5 text-gray-400 group-focus-within:text-orange-500" />
                  详细地址
                </div>
                <span class="text-xs text-gray-500 font-normal group-focus-within:text-orange-500">支持智能解析与地图选点</span>
              </label>
              
              <div class="relative">
                <UTextarea 
                  v-model="addressForm.detailAddress" 
                  placeholder="请输入详细地址（街道、门牌号、楼层等）" 
                  :rows="1"
                  size="lg"
                  class="mb-3 w-full"
                  @input="onAddressInput"
                />
                
                <!-- 地图组件容器 -->
                <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm w-full ring-1 ring-transparent hover:ring-orange-200 transition-all" v-if="isAddressModalOpen">
                  <AddressMap 
                    ref="addressMapRef"
                    v-model="addressForm.detailAddress" 
                    height="280px"
                  >
                    <template #actions>
                      <div class="flex items-center gap-2">
                        <UBadge color="secondary" variant="soft" size="xs" class="bg-orange-50 text-orange-600">地图选点模式</UBadge>
                        <span class="hidden sm:inline text-gray-500 text-xs">点击地图以精准定位</span>
                      </div>
                      <UButton 
                        size="xs" 
                        variant="solid" 
                        class="bg-orange-500 hover:bg-orange-600 text-white shadow-sm ml-auto"
                        icon="i-lucide-locate"
                        @click="addressMapRef?.searchAddressLocation(addressForm.detailAddress)"
                      >
                        定位输入地址
                      </UButton>
                    </template>
                  </AddressMap>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-2">
              <UButton 
                color="secondary" 
                variant="ghost" 
                @click="isAddressModalOpen = false"
                :disabled="saving"
                class="hover:bg-gray-100"
              >
                取消
              </UButton>
              <UButton 
                type="submit" 
                :loading="saving"
                :disabled="saving"
                class="px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30 border-none"
                icon="i-lucide-check"
              >
                {{ editingAddress ? '保存修改' : '确认添加' }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
