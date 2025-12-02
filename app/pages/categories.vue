<script setup lang="ts">
import { getCategoryList } from '~~/services/modules/category'
import { getDishPage } from '~~/services/modules/dish'
import type { Category, Dish } from '~~/types/api'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const loading = ref(false)
const categories = ref<Category[]>([])
const dishes = ref<Dish[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

// Filters
const selectedCategoryId = ref<number | undefined>(undefined)
const searchQuery = ref('')

// Initialize from query params
if (route.query.category) {
  selectedCategoryId.value = Number(route.query.category)
}
if (route.query.q) {
  searchQuery.value = String(route.query.q)
}

// Fetch Categories
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res || []
  } catch (error) {
    console.error('Failed to fetch categories', error)
  }
}

// Fetch Dishes
const fetchDishes = async () => {
  loading.value = true
  try {
    const res = await getDishPage({
      page: page.value,
      size: pageSize.value,
      categoryId: selectedCategoryId.value,
      name: searchQuery.value || undefined,
      status: 1 // Only show active dishes
    })
    dishes.value = res?.records || res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    toast.add({ title: '获取菜品失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Handlers
const handleCategorySelect = (id: number | undefined) => {
  selectedCategoryId.value = id
  page.value = 1
  // Update URL without reload
  const query: any = { ...route.query }
  if (id) query.category = id
  else delete query.category
  router.replace({ query })
}

const handleSearch = () => {
  page.value = 1
  const query: any = { ...route.query }
  if (searchQuery.value) query.q = searchQuery.value
  else delete query.q
  router.replace({ query })
  fetchDishes()
}

const handleAddToCart = (dish: Dish) => {
  // TODO: Implement Cart Store
  toast.add({ 
    title: '已加入购物车', 
    description: `${dish.name} +1`,
    icon: 'i-lucide-shopping-cart',
    color: 'primary'
  })
}

// Watchers
watch(selectedCategoryId, () => {
  fetchDishes()
})

watch(page, () => {
  fetchDishes()
  // Scroll to top of grid
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Lifecycle
onMounted(async () => {
  await fetchCategories()
  await fetchDishes()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- App Header -->
    <AppHeader />

    <!-- Sub Header Section -->
    <div class="bg-white dark:bg-gray-800 shadow-sm sticky top-20 z-30">
      <UContainer>

        
        <!-- Mobile Category Scroll -->
        <div class="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div class="flex gap-2">
            <UButton
              :variant="selectedCategoryId === undefined ? 'solid' : 'ghost'"
              :color="selectedCategoryId === undefined ? 'primary' : 'secondary'"
              size="sm"
              class="rounded-full px-4"
              @click="handleCategorySelect(undefined)"
            >
              全部
            </UButton>
            <UButton
              v-for="category in categories"
              :key="category.id"
              :variant="selectedCategoryId === category.id ? 'solid' : 'ghost'"
              :color="selectedCategoryId === category.id ? 'primary' : 'secondary'"
              size="sm"
              class="rounded-full px-4 whitespace-nowrap"
              @click="handleCategorySelect(category.id)"
            >
              {{ category.name }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer class="mt-6 md:mt-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Desktop Sidebar -->
        <aside class="hidden md:block w-64 flex-shrink-0">
          <div class="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
                菜品分类
              </h3>
            </div>
            <div class="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              <button
                class="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group"
                :class="selectedCategoryId === undefined 
                  ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/20 dark:text-orange-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'"
                @click="handleCategorySelect(undefined)"
              >
                <span>全部菜品</span>
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': selectedCategoryId === undefined }" />
              </button>
              
              <button
                v-for="category in categories"
                :key="category.id"
                class="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group"
                :class="selectedCategoryId === category.id 
                  ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/20 dark:text-orange-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'"
                @click="handleCategorySelect(category.id)"
              >
                <span>{{ category.name }}</span>
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': selectedCategoryId === category.id }" />
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <!-- Loading State -->
          <div v-if="loading && page === 1" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <USkeleton class="h-48 w-full rounded-lg mb-4" />
              <USkeleton class="h-6 w-3/4 mb-2" />
              <USkeleton class="h-4 w-1/2 mb-4" />
              <div class="flex justify-between items-center">
                <USkeleton class="h-6 w-20" />
                <USkeleton class="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="dishes.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <UIcon name="i-lucide-search-x" class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">未找到相关菜品</h3>
            <p class="text-gray-500 mb-6">试试切换其他分类或搜索关键词</p>
            <UButton color="primary" variant="soft" @click="handleCategorySelect(undefined); searchQuery = ''; handleSearch()">
              查看全部菜品
            </UButton>
          </div>

          <!-- Dish Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="dish in dishes" 
              :key="dish.id"
              class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <!-- Image -->
              <div class="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img 
                  :src="dish.image || 'https://placehold.co/600x400?text=No+Image'" 
                  :alt="dish.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <!-- Tags (Optional) -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <UBadge v-if="dish.sales > 100" color="primary" variant="solid" size="xs" class="shadow-sm">
                    热销
                  </UBadge>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {{ dish.name }}
                  </h3>
                </div>
                
                <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                  {{ dish.description || '暂无描述' }}
                </p>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50">
                  <div class="flex flex-col">
                    <span class="text-xs text-gray-400 mb-0.5">月售 {{ dish.sales || 0 }}</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-xs text-orange-600 font-medium">¥</span>
                      <span class="text-xl font-bold text-orange-600">{{ dish.price }}</span>
                    </div>
                  </div>
                  
                  <UButton 
                    icon="i-lucide-plus"
                    color="primary" 
                    variant="solid"
                    class="rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:shadow-orange-200 dark:hover:shadow-none transition-all active:scale-95"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="handleAddToCart(dish)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="total > pageSize" class="mt-10 flex justify-center">
            <UPagination 
              v-model:page="page" 
              :items-per-page="pageSize" 
              :total="total"
              :max="5"
              :ui="{ wrapper: 'gap-2' }"
            />
          </div>
        </main>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>
