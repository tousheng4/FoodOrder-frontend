<script setup lang="ts">
// 分类数据 - 使用 Lucide 图标
const categories = [
  { name: '汉堡', icon: 'i-lucide-sandwich', color: 'text-orange-500', bg: 'bg-orange-50 group-hover:bg-orange-100' },
  { name: '披萨', icon: 'i-lucide-pizza', color: 'text-red-500', bg: 'bg-red-50 group-hover:bg-red-100' },
  { name: '寿司', icon: 'i-lucide-fish', color: 'text-blue-500', bg: 'bg-blue-50 group-hover:bg-blue-100' },
  { name: '甜点', icon: 'i-lucide-cake-slice', color: 'text-pink-500', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  { name: '饮品', icon: 'i-lucide-cup-soda', color: 'text-green-500', bg: 'bg-green-50 group-hover:bg-green-100' },
  { name: '面食', icon: 'i-lucide-soup', color: 'text-yellow-500', bg: 'bg-yellow-50 group-hover:bg-yellow-100' },
]

// 热门菜品数据
const popularDishes = [
  {
    id: 1,
    name: '至尊牛肉汉堡',
    desc: '双层安格斯牛肉，特制秘制酱料，新鲜有机蔬菜，搭配酥脆薯条',
    price: 38,
    originalPrice: 49,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
    rating: 4.8,
    sales: 2341,
    time: '25分钟',
    tags: ['热销', '免运费']
  },
  {
    id: 2,
    name: '意式萨拉米披萨',
    desc: '经典意式风味，手工拍打饼底，进口马苏里拉芝士拉丝',
    price: 68,
    originalPrice: 88,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    rating: 4.9,
    sales: 1892,
    time: '30分钟',
    tags: ['新品']
  },
  {
    id: 3,
    name: '三文鱼刺身拼盘',
    desc: '挪威直运三文鱼，厚切口感饱满，搭配现磨山葵',
    price: 128,
    originalPrice: 168,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop',
    rating: 4.7,
    sales: 956,
    time: '20分钟',
    tags: ['高端']
  },
  {
    id: 4,
    name: '提拉米苏蛋糕',
    desc: '意大利经典甜品，马斯卡彭芝士与手指饼干的完美融合',
    price: 45,
    originalPrice: 58,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    rating: 4.6,
    sales: 1456,
    time: '15分钟',
    tags: ['甜点']
  }
]

const searchQuery = ref('')
const activeTab = ref('nearby')
</script>

<template>
  <div class="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-600">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- Hero 区域 -->
    <section class="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div class="absolute top-20 right-0 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply animate-blob"></div>
        <div class="absolute top-40 -left-20 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-yellow-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <UContainer>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- 左侧文字 -->
          <div class="text-center md:text-left relative z-10">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-8 border border-orange-100 shadow-sm">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              超过 5000+ 用户的选择
            </div>
            
            <h1 class="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              品味生活，<br />
              <span class="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">从这一口开始</span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
              无论是深夜的慰藉，还是聚会的狂欢。我们为您甄选全城美食，30分钟极速送达，让美味不再等待。
            </p>
            
            <div class="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <UButton color="primary" size="xl" class="w-full sm:w-auto h-14 rounded-full px-8 font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
                开始点餐
                <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5" />
              </UButton>
            </div>

            <div class="mt-10 flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500 font-medium">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                <span>免配送费</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                <span>极速送达</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-500" />
                <span>食品安全险</span>
              </div>
            </div>
          </div>

          <!-- 右侧图片 -->
          <div class="relative hidden md:block">
            <div class="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop" 
                alt="Delicious Food" 
                class="w-full h-auto rounded-[2.5rem] shadow-2xl shadow-orange-900/20 rotate-2"
              />
              <!-- 浮动卡片 1 -->
              <div class="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/50 animate-float">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <UIcon name="i-lucide-star" class="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">用户评分</div>
                    <div class="font-bold text-gray-900">4.9 分</div>
                  </div>
                </div>
              </div>
              <!-- 浮动卡片 2 -->
              <div class="absolute -right-4 bottom-20 bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/50 animate-float animation-delay-2000">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UIcon name="i-lucide-clock" class="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">平均送达</div>
                    <div class="font-bold text-gray-900">28 分钟</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 分类导航 -->
    <section class="py-16 bg-gray-50/50">
      <UContainer>
        <div class="flex justify-between items-end mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">探索美食分类</h2>
            <p class="text-gray-500">总有一款适合您的口味</p>
          </div>
          <UButton to="/categories" color="neutral" variant="ghost" class="group text-gray-600 hover:text-orange-600">
            查看全部
            <UIcon name="i-lucide-arrow-right" class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </UButton>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="group cursor-pointer bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div :class="[cat.bg, 'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300']">
              <UIcon :name="cat.icon" :class="[cat.color, 'w-7 h-7']" />
            </div>
            <span class="font-semibold text-gray-700 group-hover:text-gray-900">{{ cat.name }}</span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 今日推荐 -->
    <section class="py-20">
      <UContainer>
        <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h2 class="text-3xl font-bold text-gray-900">今日热门推荐 🔥</h2>
          
          <div class="flex bg-gray-100 p-1 rounded-full">
            <button 
              v-for="tab in ['nearby', 'rating', 'sales']" 
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'px-6 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ tab === 'nearby' ? '附近' : tab === 'rating' ? '好评优先' : '销量最高' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="dish in popularDishes"
            :key="dish.id"
            class="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
          >
            <!-- 图片区域 -->
            <div class="relative h-56 overflow-hidden">
              <img
                :src="dish.image"
                :alt="dish.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
              
              <!-- 标签 -->
              <div class="absolute top-4 left-4 flex gap-2">
                <span v-for="tag in dish.tags" :key="tag" class="bg-white/90 backdrop-blur text-orange-600 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  {{ tag }}
                </span>
              </div>
              
              <!-- 收藏按钮 -->
              <button class="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors group/btn">
                <UIcon name="i-lucide-heart" class="w-4 h-4 text-white group-hover/btn:text-red-500 transition-colors" />
              </button>

              <!-- 评分 -->
              <div class="absolute bottom-4 left-4 flex items-center gap-1 text-white text-sm font-medium">
                <UIcon name="i-lucide-star" class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{{ dish.rating }}</span>
                <span class="text-white/70 text-xs ml-1">({{ dish.sales }}+)</span>
              </div>
            </div>
            
            <!-- 内容区域 -->
            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{{ dish.name }}</h3>
                <span class="text-xs text-gray-400 whitespace-nowrap mt-1">{{ dish.time }}</span>
              </div>
              
              <p class="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{{ dish.desc }}</p>
              
              <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-bold text-orange-600">¥</span>
                  <span class="text-2xl font-bold text-gray-900">{{ dish.price }}</span>
                  <span class="text-sm text-gray-400 line-through decoration-gray-300">¥{{ dish.originalPrice }}</span>
                </div>
                <UButton color="primary" size="md" class="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-plus" class="w-5 h-5" />
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>



    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-100 pt-20 pb-10">
      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <!-- 品牌列 -->
          <div class="md:col-span-4">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <UIcon name="i-lucide-utensils" class="w-6 h-6 text-white" />
              </div>
              <span class="text-2xl font-bold text-gray-900">FoodOrder</span>
            </div>
            <p class="text-gray-500 leading-relaxed mb-8">
              致力于为您提供最优质的美食外卖服务。连接城市美味，传递生活温度。
            </p>
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                <UIcon name="i-lucide-twitter" class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                <UIcon name="i-lucide-facebook" class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                <UIcon name="i-lucide-instagram" class="w-5 h-5" />
              </a>
            </div>
          </div>

          <!-- 链接列 -->
          <div class="md:col-span-2 md:col-start-6">
            <h4 class="font-bold text-gray-900 mb-6">关于我们</h4>
            <ul class="space-y-4 text-gray-500">
              <li><a href="#" class="hover:text-orange-600 transition-colors">公司介绍</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">加入我们</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">联系方式</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">新闻动态</a></li>
            </ul>
          </div>
          
          <div class="md:col-span-2">
            <h4 class="font-bold text-gray-900 mb-6">帮助中心</h4>
            <ul class="space-y-4 text-gray-500">
              <li><a href="#" class="hover:text-orange-600 transition-colors">常见问题</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">配送说明</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">退款政策</a></li>
              <li><a href="#" class="hover:text-orange-600 transition-colors">用户协议</a></li>
            </ul>
          </div>


        </div>
        
        <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-sm">© 2025 FoodOrder. All rights reserved.</p>
          <div class="flex gap-6 text-sm text-gray-400">
            <a href="#" class="hover:text-gray-600">隐私政策</a>
            <a href="#" class="hover:text-gray-600">服务条款</a>
            <a href="#" class="hover:text-gray-600">Cookie 设置</a>
          </div>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<style>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
