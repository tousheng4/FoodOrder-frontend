<script setup lang="ts">
import { getAdminUserPage, updateUserStatus, updateUserRole } from '~~/services/modules/admin/user'
import type { AdminUserVO } from '~~/types/api'

definePageMeta({
  middleware: ['auth']
})

const toast = useToast()

// State
const loading = ref(false)
const users = ref<AdminUserVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// Filters
const searchUsername = ref('')
const selectedRole = ref<number | undefined>(undefined)
const selectedStatus = ref<number | undefined>(undefined)

// Filter Options
const roleOptions = [
  { label: '全部角色', value: undefined },
  { label: '普通用户', value: 0 },
  { label: '管理员', value: 1 }
]

const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

// Detail Modal
const isDetailModalOpen = ref(false)
const selectedUser = ref<AdminUserVO | null>(null)

// Helpers
const getRoleInfo = (role: number) => {
  return role === 1 
    ? { text: '管理员', color: 'primary' as const, icon: 'i-lucide-shield-check' }
    : { text: '普通用户', color: 'neutral' as const, icon: 'i-lucide-user' }
}

const getStatusInfo = (status: number) => {
  return status === 1
    ? { text: '正常', color: 'success' as const, bg: 'bg-green-50', textColor: 'text-green-600' }
    : { text: '禁用', color: 'error' as const, bg: 'bg-red-50', textColor: 'text-red-600' }
}

const formatTime = (time?: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

// Fetch Users
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getAdminUserPage({
      page: page.value,
      size: pageSize.value,
      username: searchUsername.value || undefined,
      role: selectedRole.value,
      status: selectedStatus.value
    })
    users.value = res?.records || res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    toast.add({ title: '获取用户列表失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Handlers
const handleSearch = () => {
  page.value = 1
  fetchUsers()
}

const handleReset = () => {
  searchUsername.value = ''
  selectedRole.value = undefined
  selectedStatus.value = undefined
  page.value = 1
  fetchUsers()
}

const openDetail = (user: AdminUserVO) => {
  selectedUser.value = user
  isDetailModalOpen.value = true
}

const handleToggleStatus = async (user: AdminUserVO) => {
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  
  if (!confirm(`确定要${action}用户「${user.nickname || user.username}」吗？`)) return

  try {
    await updateUserStatus(user.id, { status: newStatus })
    user.status = newStatus
    toast.add({ title: `已${action}用户`, color: 'success' })
  } catch (error: any) {
    toast.add({ title: '操作失败', description: error.message, color: 'error' })
  }
}

const handleToggleRole = async (user: AdminUserVO) => {
  const newRole = user.role === 1 ? 0 : 1
  const action = newRole === 1 ? '设为管理员' : '取消管理员'
  
  if (!confirm(`确定要将用户「${user.nickname || user.username}」${action}吗？`)) return

  try {
    await updateUserRole(user.id, { role: newRole })
    user.role = newRole
    toast.add({ title: '角色已更新', color: 'success' })
  } catch (error: any) {
    toast.add({ title: '操作失败', description: error.message, color: 'error' })
  }
}

// Watchers
watch(page, fetchUsers)

// Lifecycle
onMounted(fetchUsers)
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
            color="neutral" 
            variant="ghost" 
            class="hidden md:flex"
          />
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-users" class="w-7 h-7 text-primary-500" />
              用户管理
            </h1>
            <p class="text-gray-500 text-sm mt-1">管理系统中的所有用户账户</p>
          </div>
        </div>
        <div class="flex gap-3">
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="fetchUsers" :loading="loading">刷新</UButton>
        </div>
      </div>

      <!-- Filters -->
      <UCard class="mb-8 overflow-visible">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <UInput 
            v-model="searchUsername" 
            icon="i-lucide-search" 
            placeholder="搜索用户名..." 
            @keyup.enter="handleSearch"
          />
          
          <USelectMenu 
            v-model="selectedRole" 
            :options="roleOptions" 
            value-attribute="value"
            option-attribute="label"
            placeholder="用户角色"
          />

          <USelectMenu 
            v-model="selectedStatus" 
            :options="statusOptions" 
            value-attribute="value"
            option-attribute="label"
            placeholder="账户状态"
          />
          
          <div class="md:col-span-2 flex gap-2 justify-end">
            <UButton icon="i-lucide-search" color="primary" @click="handleSearch">查询</UButton>
            <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="handleReset">重置</UButton>
          </div>
        </div>
      </UCard>

      <!-- Table -->
      <UCard class="overflow-hidden">
        <!-- Loading -->
        <div v-if="loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        </div>

        <!-- Empty -->
        <div v-else-if="users.length === 0" class="p-12 text-center">
          <UIcon name="i-lucide-user-x" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">暂无符合条件的用户</p>
        </div>

        <!-- Data -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th class="px-6 py-4">用户信息</th>
                <th class="px-6 py-4">联系方式</th>
                <th class="px-6 py-4">角色</th>
                <th class="px-6 py-4">状态</th>
                <th class="px-6 py-4">注册时间</th>
                <th class="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <UAvatar 
                      :src="user.avatar" 
                      :alt="user.nickname || user.username"
                      size="lg"
                      class="ring-2 ring-gray-100 dark:ring-gray-700"
                    />
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {{ user.nickname || user.username }}
                        <UBadge v-if="user.role === 1" color="primary" variant="subtle" size="xs">
                          <UIcon name="i-lucide-shield-check" class="w-3 h-3 mr-0.5" />
                          管理员
                        </UBadge>
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-phone" class="w-4 h-4 text-gray-400" />
                    {{ user.phone || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="getRoleInfo(user.role).color" variant="subtle" size="xs">
                    <UIcon :name="getRoleInfo(user.role).icon" class="w-3 h-3 mr-1" />
                    {{ getRoleInfo(user.role).text }}
                  </UBadge>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    :class="[getStatusInfo(user.status).bg, getStatusInfo(user.status).textColor]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 1 ? 'bg-green-500' : 'bg-red-500'"></span>
                    {{ getStatusInfo(user.status).text }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">
                  {{ formatTime(user.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-1 justify-end">
                    <UTooltip text="查看详情">
                      <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-eye" @click="openDetail(user)" />
                    </UTooltip>
                    <UTooltip :text="user.role === 1 ? '取消管理员' : '设为管理员'">
                      <UButton 
                        size="xs" 
                        :color="user.role === 1 ? 'warning' : 'primary'" 
                        variant="ghost" 
                        :icon="user.role === 1 ? 'i-lucide-shield-off' : 'i-lucide-shield-check'"
                        @click="handleToggleRole(user)"
                      />
                    </UTooltip>
                    <UTooltip :text="user.status === 1 ? '禁用账户' : '启用账户'">
                      <UButton 
                        size="xs" 
                        :color="user.status === 1 ? 'error' : 'success'" 
                        variant="ghost" 
                        :icon="user.status === 1 ? 'i-lucide-user-x' : 'i-lucide-user-check'"
                        @click="handleToggleStatus(user)"
                      />
                    </UTooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
          <p class="text-sm text-gray-500">共 <span class="font-medium text-gray-900 dark:text-white">{{ total }}</span> 位用户</p>
          <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
        </div>
      </UCard>
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="isDetailModalOpen">
      <template #content>
        <div v-if="selectedUser" class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden max-w-lg mx-auto">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-primary-500 to-blue-500 px-6 py-8 text-center relative overflow-hidden">
            <div class="relative z-10">
              <UAvatar 
                :src="selectedUser.avatar" 
                :alt="selectedUser.nickname || selectedUser.username"
                size="3xl"
                class="ring-4 ring-white/30 mx-auto mb-4"
              />
              <h3 class="text-xl font-bold text-white">{{ selectedUser.nickname || selectedUser.username }}</h3>
              <p class="text-white/70 text-sm">@{{ selectedUser.username }}</p>
              <div class="flex justify-center gap-2 mt-3">
                <UBadge color="neutral" variant="subtle" size="xs">
                  <UIcon :name="getRoleInfo(selectedUser.role).icon" class="w-3 h-3 mr-1" />
                  {{ getRoleInfo(selectedUser.role).text }}
                </UBadge>
                <UBadge :color="selectedUser.status === 1 ? 'success' : 'error'" variant="subtle" size="xs">
                  {{ getStatusInfo(selectedUser.status).text }}
                </UBadge>
              </div>
            </div>
            <!-- Decorative -->
            <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
            
            <!-- Close Button -->
            <UButton 
              color="neutral" 
              variant="ghost" 
              icon="i-lucide-x" 
              class="absolute top-4 right-4 hover:bg-white/20 text-white"
              @click="isDetailModalOpen = false" 
            />
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">用户ID</p>
                <p class="font-mono font-medium text-gray-900 dark:text-white">#{{ selectedUser.id }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">手机号码</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedUser.phone || '-' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">注册时间</p>
                <p class="font-medium text-gray-900 dark:text-white text-sm">{{ formatTime(selectedUser.createdAt) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">最后登录</p>
                <p class="font-medium text-gray-900 dark:text-white text-sm">{{ formatTime(selectedUser.lastLoginAt) }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <UButton 
                block
                :color="selectedUser.role === 1 ? 'warning' : 'primary'" 
                variant="soft"
                :icon="selectedUser.role === 1 ? 'i-lucide-shield-off' : 'i-lucide-shield-check'"
                @click="handleToggleRole(selectedUser)"
              >
                {{ selectedUser.role === 1 ? '取消管理员' : '设为管理员' }}
              </UButton>
              <UButton 
                block
                :color="selectedUser.status === 1 ? 'error' : 'success'" 
                variant="soft"
                :icon="selectedUser.status === 1 ? 'i-lucide-user-x' : 'i-lucide-user-check'"
                @click="handleToggleStatus(selectedUser)"
              >
                {{ selectedUser.status === 1 ? '禁用账户' : '启用账户' }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
