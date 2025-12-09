<script setup lang="ts">
import { 
  getAdminDishPage, 
  createAdminDish, 
  updateAdminDish, 
  deleteAdminDish, 
  updateAdminDishStatus,
  type AdminDishVO,
  type AdminSaveDishRequest
} from '~~/services/modules/admin/dish'
import { getCategoryList } from '~~/services/modules/category'
import type { Category } from '~~/types/api'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const toast = useToast()

// State
const loading = ref(false)
const dishes = ref<AdminDishVO[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const queryParams = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

// Modal State
const isModalOpen = ref(false)
const isEditing = ref(false)
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  categoryId: undefined as number | undefined,
  price: 0,
  image: '',
  description: '',
  status: 1
})

// Columns for UTable (TanStack Table schema)
const columns = [
  { accessorKey: 'image', header: '图片', enableSorting: false },
  { accessorKey: 'name', header: '名称' },
  { accessorKey: 'categoryName', header: '分类' },
  { accessorKey: 'price', header: '价格' },
  { accessorKey: 'status', header: '状态' },
  { accessorKey: 'createdAt', header: '创建时间' },
  { id: 'actions', header: '操作', enableSorting: false, enableHiding: false }
]

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminDishPage({
      page: page.value,
      size: pageSize.value,
      name: queryParams.name || undefined,
      categoryId: queryParams.categoryId,
      status: queryParams.status
    })
    // 后端返回的是 records 字段
    dishes.value = res?.records || res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    console.error('Fetch error:', error)
    dishes.value = []
    total.value = 0
    toast.add({ title: '获取数据失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res || []
  } catch (error) {
    console.error(error)
  }
}

// Actions
const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.categoryId = undefined
  queryParams.status = undefined
  handleSearch()
}

const openAddModal = () => {
  isEditing.value = false
  form.id = undefined
  form.name = ''
  form.categoryId = categories.value.length > 0 ? categories.value[0]?.id : undefined
  form.price = 0
  form.image = ''
  form.description = ''
  form.status = 1
  isModalOpen.value = true
}

const openEditModal = (row: AdminDishVO) => {
  isEditing.value = true
  form.id = row.id
  form.name = row.name
  form.categoryId = row.categoryId
  form.price = row.price
  form.image = row.image
  form.description = row.description
  form.status = row.status
  isModalOpen.value = true
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    toast.add({ title: '请输入菜品名称', color: 'warning' })
    return
  }
  if (!form.categoryId) {
    toast.add({ title: '请选择分类', color: 'warning' })
    return
  }
  if (form.price <= 0) {
    toast.add({ title: '请输入有效价格', color: 'warning' })
    return
  }

  const reqData: AdminSaveDishRequest = {
    name: form.name.trim(),
    description: form.description || undefined,
    image: form.image || undefined,
    price: form.price,
    categoryId: form.categoryId,
    status: form.status
  }

  try {
    if (isEditing.value && form.id) {
      await updateAdminDish(form.id, reqData)
      toast.add({ title: '更新成功', color: 'success' })
    } else {
      await createAdminDish(reqData)
      toast.add({ title: '添加成功', color: 'success' })
    }
    isModalOpen.value = false
    fetchData()
  } catch (error) {
    toast.add({ title: '操作失败', color: 'error' })
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除吗？')) return
  try {
    await deleteAdminDish(id)
    toast.add({ title: '删除成功', color: 'success' })
    fetchData()
  } catch (error) {
    toast.add({ title: '删除失败', color: 'error' })
  }
}

const handleStatusChange = async (row: AdminDishVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await updateAdminDishStatus(row.id, newStatus)
    row.status = newStatus
    toast.add({ title: '状态更新成功', color: 'success' })
  } catch (error) {
    toast.add({ title: '状态更新失败', color: 'error' })
  }
}

// Helper
const getCategoryName = (id: number) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未知分类'
}

// Computed for table data with category name
const tableData = computed(() => {
  if (!dishes.value) return []
  return dishes.value.map(dish => ({
    ...dish,
    categoryName: getCategoryName(dish.categoryId)
  }))
})

// 监听页码变化
watch(page, () => {
  fetchData()
})

onMounted(() => {
  fetchCategories()
  fetchData()
})
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
              <UIcon name="i-lucide-utensils" class="w-7 h-7 text-primary-500" />
              菜品管理
            </h1>
            <p class="text-gray-500 text-sm mt-1">管理系统中的所有菜品信息</p>
          </div>
        </div>
        <div class="flex gap-3">
          <UButton icon="i-lucide-refresh-cw" color="gray" variant="ghost" @click="fetchData" :loading="loading">刷新</UButton>
          <UButton icon="i-lucide-plus" color="primary" @click="openAddModal">新增菜品</UButton>
        </div>
      </div>

      <!-- Filters -->
      <UCard class="mb-8 overflow-visible">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <UInput 
            v-model="queryParams.name" 
            icon="i-lucide-search" 
            placeholder="搜索菜品名称..." 
            @keyup.enter="handleSearch"
          />
          
            <USelect 
              v-model="queryParams.categoryId" 
              :items="categories" 
              label-key="name" 
              value-key="id"
              placeholder="全部分类"
            />
          
            <USelect 
              v-model="queryParams.status" 
              :items="[{ label: '起售', value: 1 }, { label: '停售', value: 0 }]" 
              label-key="label"
              value-key="value"
              placeholder="全部状态"
            />
          
          <div class="md:col-span-2 flex gap-2 justify-end">
            <UButton icon="i-lucide-search" color="primary" @click="handleSearch">查询</UButton>
            <UButton icon="i-lucide-x" color="gray" variant="soft" @click="handleReset">重置</UButton>
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
        <div v-else-if="dishes.length === 0" class="p-12 text-center">
          <UIcon name="i-lucide-utensils-crossed" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">暂无菜品数据</p>
          <UButton color="primary" variant="soft" class="mt-4" @click="openAddModal">添加第一道菜品</UButton>
        </div>

        <!-- Data -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th class="px-6 py-4">菜品信息</th>
                <th class="px-6 py-4">分类</th>
                <th class="px-6 py-4">价格</th>
                <th class="px-6 py-4">状态</th>
                <th class="px-6 py-4">销量/库存</th>
                <th class="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="dish in tableData" :key="dish.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img 
                      :src="dish.image || 'https://placehold.co/100x100?text=No+Image'" 
                      :alt="dish.name"
                      class="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100 dark:border-gray-700"
                    />
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">{{ dish.name }}</div>
                      <div class="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xs">{{ dish.description || '暂无描述' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UBadge color="primary" variant="subtle" size="xs">{{ dish.categoryName }}</UBadge>
                </td>
                <td class="px-6 py-4">
                  <span class="text-lg font-bold text-orange-600">¥{{ dish.price }}</span>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="dish.status === 1 ? 'green' : 'red'" variant="subtle" size="xs">
                    {{ dish.status === 1 ? '起售中' : '已停售' }}
            </UBadge>
                </td>
                <td class="px-6 py-4 text-gray-500">
                  <div class="text-xs">
                    <span>销量: {{ dish.sales || 0 }}</span>
                    <span class="mx-2">|</span>
                    <span>库存: {{ dish.stock || '-' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-1 justify-end">
                    <UTooltip :text="dish.status === 1 ? '停售' : '起售'">
              <UButton 
                size="xs" 
                        :color="dish.status === 1 ? 'orange' : 'green'" 
                variant="ghost"
                        :icon="dish.status === 1 ? 'i-lucide-pause-circle' : 'i-lucide-play-circle'"
                        @click="handleStatusChange(dish)"
                      />
                    </UTooltip>
                    <UTooltip text="编辑">
                      <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-pencil" @click="openEditModal(dish)" />
                    </UTooltip>
                    <UTooltip text="删除">
                      <UButton size="xs" color="red" variant="ghost" icon="i-lucide-trash-2" @click="handleDelete(dish.id)" />
                    </UTooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
            </div>

        <!-- Pagination -->
        <div class="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
          <p class="text-sm text-gray-500">共 <span class="font-medium text-gray-900 dark:text-white">{{ total }}</span> 道菜品</p>
          <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
        </div>
      </UCard>
    </div>

    <!-- Edit/Add Modal -->
    <UModal v-model:open="isModalOpen" :ui="{ width: 'sm:max-w-xl', padding: 'p-0' }">
      <template #content>
        <div class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-primary-500 to-orange-500 px-6 py-5">
            <div class="flex items-center justify-between text-white">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <UIcon :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-plus-circle'" class="w-5 h-5" />
                {{ isEditing ? '编辑菜品' : '新增菜品' }}
              </h3>
              <UButton color="white" variant="ghost" icon="i-lucide-x" @click="isModalOpen = false" class="hover:bg-white/20" />
            </div>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <!-- Image Preview -->
            <div class="flex justify-center mb-2">
              <div class="relative group">
                <img 
                  :src="form.image || 'https://placehold.co/200x200?text=菜品图片'" 
                  class="w-32 h-32 rounded-2xl object-cover border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-colors"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="菜品名称" required>
                <UInput v-model="form.name" placeholder="请输入菜品名称" />
              </UFormGroup>

              <UFormGroup label="菜品分类" required>
              <USelect 
                v-model="form.categoryId" 
                :items="categories" 
                label-key="name" 
                value-key="id"
                placeholder="请选择分类"
              />
              </UFormGroup>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="价格" required>
                <UInput v-model="form.price" type="number" step="0.01" placeholder="0.00">
                  <template #leading>
                    <span class="text-gray-400">¥</span>
                  </template>
              </UInput>
              </UFormGroup>

              <UFormGroup label="状态">
                <div class="flex gap-4 h-full items-center">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.status" :value="1" class="text-primary-500 focus:ring-primary-500" />
                    <span class="text-sm">起售</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.status" :value="0" class="text-red-500 focus:ring-red-500" />
                    <span class="text-sm">停售</span>
                  </label>
                </div>
              </UFormGroup>
              </div>

            <UFormGroup label="图片链接">
              <UInput v-model="form.image" placeholder="请输入图片URL" icon="i-lucide-image" />
            </UFormGroup>

            <UFormGroup label="菜品描述">
              <UTextarea v-model="form.description" placeholder="请输入菜品描述..." :rows="3" />
            </UFormGroup>
          </form>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="isModalOpen = false">取消</UButton>
            <UButton color="primary" @click="handleSubmit" class="px-6">
              <UIcon name="i-lucide-check" class="w-4 h-4 mr-1" />
              {{ isEditing ? '保存修改' : '确认添加' }}
            </UButton>
          </div>
            </div>
      </template>
    </UModal>
  </div>
</template>
