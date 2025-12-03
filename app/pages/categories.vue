<script setup lang="ts">
import { getCategoryList } from '~~/services/modules/category'
import { getDishPage } from '~~/services/modules/dish'
import type { Category, Dish } from '~~/types/api'
import { useCart } from '~~/composables/useCart'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { addToCart } = useCart()
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
  addToCart(dish.id)
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
    <!-- App Header -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="relative bg-white dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-800">
      <!-- Decorative Background -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-orange-50/30 dark:from-orange-950/20 dark:via-gray-900 dark:to-gray-900"></div>
        <div class="absolute right-0 top-0 -mr-32 -mt-32 w-96 h-96 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50"></div>
        <div class="absolute left-0 bottom-0 -ml-32 -mb-32 w-96 h-96 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <UContainer class="relative py-8 md:py-12">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium mb-4 border border-orange-100 dark:border-orange-800/50">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            全城美食，极速送达
          </div>
          
          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
            探索您身边的 <span class="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">美味佳肴</span>
          </h1>
          
          <p class="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            从经典主食到精致甜点，我们为您精选了各类美食。
          </p>
          
          <!-- Search Bar -->
          <div class="relative max-w-xl mx-auto group">
            <div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-full shadow-xl shadow-gray-200/50 dark:shadow-none p-1.5 flex items-center ring-1 ring-gray-100 dark:ring-gray-700">
              <div class="pl-4 text-gray-400">
                <UIcon name="i-lucide-search" class="w-5 h-5" />
              </div>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="搜索您想吃的美食..."
                class="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2 outline-none h-10"
                @keyup.enter="handleSearch"
              />
              <UButton 
                color="primary" 
                size="lg" 
                class="rounded-full px-6 font-medium transition-transform active:scale-95"
                @click="handleSearch"
              >
                搜索
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer class="mt-12 pb-20">
      <div class="flex flex-col md:flex-row gap-8 lg:gap-12">
        
        <!-- Sidebar (Categories) -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="sticky top-24 space-y-6">
            
            <!-- Mobile Category Select -->
            <div class="md:hidden bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <USelectMenu 
                 v-model="selectedCategoryId" 
                 :options="[{id: undefined as number | undefined, name: '全部菜品'}, ...categories]"
                 value-attribute="id"
                 option-attribute="name"
                 placeholder="选择分类"
                 size="lg"
                 class="w-full"
               />
            </div>

            <!-- Desktop Category List -->
            <div class="hidden md:block bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 px-2">
                <UIcon name="i-lucide-layout-grid" class="w-5 h-5 text-primary-500" />
                菜品分类
              </h3>
              <nav class="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <button
                  class="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-between group relative overflow-hidden shrink-0"
                  :class="selectedCategoryId === undefined 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm ring-1 ring-primary-100 dark:ring-primary-800' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
                  @click="handleCategorySelect(undefined)"
                >
                  <span class="relative z-10">全部菜品</span>
                  <UIcon name="i-lucide-chevron-right" class="w-4 h-4 transition-transform duration-300" :class="selectedCategoryId === undefined ? 'translate-x-0 text-primary-500' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'" />
                </button>
                
                <button
                  v-for="category in categories"
                  :key="category.id"
                  class="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-between group relative overflow-hidden shrink-0"
                  :class="selectedCategoryId === category.id 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm ring-1 ring-primary-100 dark:ring-primary-800' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
                  @click="handleCategorySelect(category.id)"
                >
                  <span class="relative z-10">{{ category.name }}</span>
                  <UIcon name="i-lucide-chevron-right" class="w-4 h-4 transition-transform duration-300" :class="selectedCategoryId === category.id ? 'translate-x-0 text-primary-500' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'" />
                </button>
              </nav>
            </div>
          </div>
        </aside>

        <!-- Main Grid -->
        <main class="flex-1 min-w-0">
          <!-- Filter Bar -->
          <div class="flex justify-between items-center mb-8 px-2">
            <p class="text-gray-500 dark:text-gray-400">
              共找到 <span class="font-bold text-gray-900 dark:text-white mx-1">{{ total }}</span> 道美味
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="loading && page === 1" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <USkeleton class="h-48 w-full rounded-2xl mb-4" />
              <USkeleton class="h-6 w-3/4 mb-3" />
              <USkeleton class="h-4 w-1/2 mb-6" />
              <div class="flex justify-between items-center pt-2">
                <USkeleton class="h-6 w-20" />
                <USkeleton class="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="dishes.length === 0" class="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div class="bg-orange-50 dark:bg-gray-800 p-6 rounded-full mb-6">
              <UIcon name="i-lucide-search-x" class="w-12 h-12 text-orange-300" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">未找到相关菜品</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">试试切换其他分类，或者换个搜索关键词试试看</p>
            <UButton color="primary" variant="soft" size="lg" class="rounded-full px-8" @click="handleCategorySelect(undefined); searchQuery = ''; handleSearch()">
              查看全部菜品
            </UButton>
          </div>

          <!-- Dish Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              v-for="dish in dishes" 
              :key="dish.id"
              class="group bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary-100 dark:hover:border-primary-900/50 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col overflow-hidden transform hover:-translate-y-1"
            >
              <!-- Image Area -->
              <div class="relative aspect-[4/3] overflow-hidden p-3 pb-0">
                <div class="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                  <img 
                    :src="dish.image || 'https://placehold.co/600x400?text=FoodOrder'" 
                    :alt="dish.name"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <!-- Overlay -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                  
                  <!-- Top Badges -->
                  <div class="absolute top-3 left-3 flex gap-2">
                    <span v-if="dish.sales > 100" class="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-orange-600 shadow-sm flex items-center gap-1">
                      <UIcon name="i-lucide-flame" class="w-3 h-3" />
                      热销
                    </span>
                  </div>
                </div>
              </div>

              <!-- Content Area -->
              <div class="p-6 pt-4 flex-1 flex flex-col">
                <div class="mb-4">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {{ dish.name }}
                    </h3>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 h-10 leading-relaxed">
                    {{ dish.description || '暂无描述，但这道菜一定很美味...' }}
                  </p>
                </div>

                <div class="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-gray-100 dark:border-gray-800">
                  <div class="flex flex-col">
                    <p class="text-xs text-gray-400 mb-0.5">月售 {{ dish.sales || 0 }}</p>
                    <div class="flex items-baseline gap-0.5 text-gray-900 dark:text-white">
                      <span class="text-sm font-bold text-primary-600">¥</span>
                      <span class="text-2xl font-extrabold text-primary-600">{{ dish.price }}</span>
                    </div>
                  </div>
                  
                  <UButton 
                    icon="i-lucide-plus"
                    size="md"
                    color="primary" 
                    variant="solid"
                    class="rounded-full w-11 h-11 flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-300 p-0"
                    @click="handleAddToCart(dish)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="total > pageSize" class="mt-16 flex justify-center">
            <UPagination 
              v-model:page="page" 
              :items-per-page="pageSize" 
              :total="total"
              :max="5"
            />
          </div>
        </main>
      </div>
    </UContainer>
  </div>
</template>
