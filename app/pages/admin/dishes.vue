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
      <!-- Filters -->
      <UCard class="mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="w-full sm:w-48">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">菜品名称</label>
            <UInput v-model="queryParams.name" placeholder="搜索菜品名称..." icon="i-lucide-search" />
          </div>
          <div class="w-full sm:w-48">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">分类</label>
            <USelect 
              v-model="queryParams.categoryId" 
              :items="categories" 
              label-key="name" 
              value-key="id"
              placeholder="全部分类"
              class="w-full"
            />
          </div>
          <div class="w-full sm:w-48">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">状态</label>
            <USelect 
              v-model="queryParams.status" 
              :items="[{ label: '起售', value: 1 }, { label: '停售', value: 0 }]" 
              label-key="label"
              value-key="value"
              placeholder="全部状态"
              class="w-full"
            />
          </div>
          <div class="flex gap-2">
            <UButton color="primary" @click="handleSearch">查询</UButton>
            <UButton color="neutral" variant="soft" @click="handleReset">重置</UButton>
          </div>
        </div>
      </UCard>

      <!-- Table -->
      <UCard>
        <UTable :data="tableData" :columns="columns" :loading="loading">
          <template #image-cell="{ row }">
            <UAvatar :src="row.original.image" size="lg" :alt="row.original.name" />
          </template>
          
          <template #price-cell="{ row }">
            <span class="font-medium text-orange-600">¥{{ row.original.price }}</span>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 1 ? 'success' : 'error'" variant="subtle">
              {{ row.original.status === 1 ? '起售' : '停售' }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton 
                size="xs" 
                :color="row.original.status === 1 ? 'error' : 'success'" 
                variant="ghost"
                :icon="row.original.status === 1 ? 'i-lucide-stop-circle' : 'i-lucide-play-circle'"
                @click="handleStatusChange(row.original)"
              >
                {{ row.original.status === 1 ? '停售' : '起售' }}
              </UButton>
              <UButton size="xs" color="primary" variant="ghost" icon="i-lucide-pencil" @click="openEditModal(row.original)">编辑</UButton>
              <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="handleDelete(row.original.id)">删除</UButton>
            </div>
          </template>
        </UTable>

        <!-- Pagination -->
        <div class="flex justify-end px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <UPagination 
            v-model:page="page" 
            :items-per-page="pageSize" 
            :total="total"
          />
        </div>
      </UCard>
    </div>

    <!-- Edit/Add Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ isEditing ? '编辑菜品' : '新增菜品' }}
              </h3>
              <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isModalOpen = false" />
            </div>
          </template>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="菜品名称" required>
              <UInput v-model="form.name" placeholder="请输入菜品名称" class="w-full" />
            </UFormField>

            <UFormField label="菜品分类" required>
              <USelect 
                v-model="form.categoryId" 
                :items="categories" 
                label-key="name" 
                value-key="id"
                placeholder="请选择分类"
                class="w-full"
              />
            </UFormField>

            <UFormField label="价格" required>
              <UInput v-model="form.price" type="number" placeholder="0.00" class="w-full">
                <template #leading>¥</template>
              </UInput>
            </UFormField>

            <UFormField label="图片链接">
              <UInput v-model="form.image" placeholder="请输入图片URL" class="w-full" />
            </UFormField>

            <UFormField label="描述">
              <UTextarea v-model="form.description" placeholder="请输入菜品描述" class="w-full" />
            </UFormField>

            <UFormField label="状态">
              <div class="flex gap-4">
                <URadioGroup v-model="form.status" :items="[{ label: '起售', value: 1 }, { label: '停售', value: 0 }]" />
              </div>
            </UFormField>
          </form>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="isModalOpen = false">取消</UButton>
              <UButton color="primary" @click="handleSubmit">保存</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
