<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'

const { login, register } = useAuth()
const toast = useToast()

const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

// 注册表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  agree: false
})

// 表单验证
const validateLoginForm = (): string | null => {
  if (!loginForm.value.username.trim()) {
    return '请输入用户名'
  }
  if (loginForm.value.username.length < 3) {
    return '用户名至少 3 个字符'
  }
  if (!loginForm.value.password) {
    return '请输入密码'
  }
  if (loginForm.value.password.length < 6) {
    return '密码至少 6 位'
  }
  return null
}

const validateRegisterForm = (): string | null => {
  if (!registerForm.value.username.trim()) {
    return '请输入用户名'
  }
  if (registerForm.value.username.length < 3 || registerForm.value.username.length > 20) {
    return '用户名长度在 3~20 个字符之间'
  }
  if (!registerForm.value.phone.trim()) {
    return '请输入手机号'
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.value.phone)) {
    return '请输入正确的手机号'
  }
  if (!registerForm.value.password) {
    return '请输入密码'
  }
  if (registerForm.value.password.length < 6) {
    return '密码至少 6 位'
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    return '两次输入的密码不一致'
  }
  if (!registerForm.value.agree) {
    return '请阅读并同意服务条款和隐私政策'
  }
  return null
}

// 切换模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  // 重置表单
  loginForm.value = { username: '', password: '', remember: false }
  registerForm.value = { username: '', password: '', confirmPassword: '', nickname: '', phone: '', agree: false }
}

// 处理登录
const handleLogin = async () => {
  errorMessage.value = ''
  
  // 表单验证
  const error = validateLoginForm()
  if (error) {
    errorMessage.value = error
    toast.add({
      title: '表单验证失败',
      description: error,
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    const result = await login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    if (result.success) {
      toast.add({
        title: '登录成功',
        description: `欢迎回来，${result.data?.user.nickname || result.data?.user.username}！`,
        color: 'success'
      })
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigateTo('/')
      }, 500)
    } else {
      errorMessage.value = result.error || '登录失败'
      toast.add({
        title: '登录失败',
        description: result.error || '请检查用户名和密码',
        color: 'error'
      })
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败'
    toast.add({
      title: '登录失败',
      description: error.message || '网络错误，请稍后重试',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  errorMessage.value = ''
  
  // 表单验证
  const error = validateRegisterForm()
  if (error) {
    errorMessage.value = error
    toast.add({
      title: '表单验证失败',
      description: error,
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    const result = await register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      phone: registerForm.value.phone,
      nickname: registerForm.value.nickname || undefined
    })

    if (result.success) {
      toast.add({
        title: '注册成功',
        description: '请使用您的账号登录',
        color: 'success'
      })
      
      // 注册成功后切换到登录模式，并预填用户名
      loginForm.value.username = registerForm.value.username
      isLogin.value = true
    } else {
      errorMessage.value = result.error || '注册失败'
      toast.add({
        title: '注册失败',
        description: result.error || '请稍后重试',
        color: 'error'
      })
    }
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败'
    toast.add({
      title: '注册失败',
      description: error.message || '网络错误，请稍后重试',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 统一提交处理
const handleSubmit = async () => {
  if (isLogin.value) {
    await handleLogin()
  } else {
    await handleRegister()
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 左侧图片区域 (桌面端显示) -->
    <div class="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-gray-900">
      <img 
        src="https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=2080&auto=format&fit=crop" 
        alt="Food Background" 
        class="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[20s]"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      
      <!-- 装饰元素 -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 p-16 flex flex-col justify-between h-full text-white w-full">
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <UIcon name="i-lucide-utensils" class="w-7 h-7 text-white" />
            </div>
            <span class="text-3xl font-bold tracking-tight">FoodOrder</span>
          </div>
          <h2 class="text-5xl font-bold leading-tight mb-6">
            探索城市<br/>
            <span class="text-orange-500">最美味</span>的角落
          </h2>
          <p class="text-xl text-gray-300 max-w-md leading-relaxed">
            加入我们，开启您的美食之旅。数千家餐厅，极速送达，尽在掌握。
          </p>
        </div>
        
        <div class="space-y-6">
          <!-- 评价卡片 -->
          <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-sm">
            <div class="flex gap-1 text-yellow-400 mb-2">
              <UIcon name="i-lucide-star" class="w-4 h-4 fill-yellow-400" v-for="i in 5" :key="i" />
            </div>
            <p class="text-sm text-gray-200 mb-3">"这是我用过最好的外卖平台，配送速度非常快，食物也很新鲜！"</p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" />
              </div>
              <div class="text-xs">
                <div class="font-bold">Alex Chen</div>
                <div class="text-gray-400">美食博主</div>
              </div>
            </div>
          </div>

          <div class="flex gap-6 text-sm text-gray-400 font-medium">
            <span>© 2025 FoodOrder</span>
            <a href="#" class="hover:text-white transition-colors">隐私政策</a>
            <a href="#" class="hover:text-white transition-colors">服务条款</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div class="absolute top-1/2 -left-20 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-20 right-20 w-80 h-80 bg-yellow-100 rounded-full blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <!-- 返回首页按钮 -->
      <UButton 
        to="/" 
        color="neutral" 
        variant="ghost" 
        class="absolute top-6 right-6 sm:top-10 sm:right-10 z-20"
        icon="i-lucide-x"
      />

      <div class="w-full max-w-md space-y-8 relative z-10 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-orange-500/5 border border-white">
        <!-- 移动端 Logo (仅在小屏显示) -->
        <div class="lg:hidden flex justify-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <UIcon name="i-lucide-utensils" class="w-7 h-7 text-white" />
          </div>
        </div>

        <!-- 标题 -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
            {{ isLogin ? '欢迎回来' : '创建账号' }}
          </h2>
          <p class="mt-3 text-gray-500">
            {{ isLogin ? '请输入您的账号信息以登录' : '填写以下信息注册新账号' }}
          </p>
        </div>

        <!-- 错误提示 -->
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          title="操作失败"
          :description="errorMessage"
          :close-button="{ icon: 'i-lucide-x', color: 'error', variant: 'ghost' }"
          @close="errorMessage = ''"
          class="mb-4"
        />

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-6 mt-8">
          
          <!-- 登录模式字段 -->
          <template v-if="isLogin">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <UInput 
                  v-model="loginForm.username"
                  icon="i-lucide-user" 
                  placeholder="请输入用户名" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div>
                <div class="flex justify-between mb-2">
                  <label class="text-sm font-medium text-gray-700">密码</label>
                  <a href="#" class="text-sm text-orange-600 hover:text-orange-700 font-medium">忘记密码？</a>
                </div>
                <UInput 
                  v-model="loginForm.password"
                  type="password" 
                  icon="i-lucide-lock" 
                  placeholder="请输入密码" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div class="flex items-center">
                <UCheckbox v-model="loginForm.remember" label="记住我" color="primary" />
              </div>
            </div>
          </template>

          <!-- 注册模式字段 -->
          <template v-else>
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">用户名 <span class="text-red-500">*</span></label>
                <UInput 
                  v-model="registerForm.username"
                  icon="i-lucide-user" 
                  placeholder="设置用户名" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                <UInput 
                  v-model="registerForm.nickname"
                  icon="i-lucide-smile" 
                  placeholder="您的昵称（选填）" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">手机号 <span class="text-red-500">*</span></label>
                <UInput 
                  v-model="registerForm.phone"
                  icon="i-lucide-phone" 
                  placeholder="请输入手机号" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">密码 <span class="text-red-500">*</span></label>
                <UInput 
                  v-model="registerForm.password"
                  type="password" 
                  icon="i-lucide-lock" 
                  placeholder="设置密码" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">确认密码 <span class="text-red-500">*</span></label>
                <UInput 
                  v-model="registerForm.confirmPassword"
                  type="password" 
                  icon="i-lucide-lock" 
                  placeholder="再次输入密码" 
                  size="xl" 
                  class="w-full"
                />
              </div>
              <div class="flex items-center pt-1">
                <UCheckbox v-model="registerForm.agree" color="primary">
                  <template #label>
                    <span class="text-sm text-gray-600">
                      我已阅读并同意 <a href="#" class="text-orange-600 hover:underline">服务条款</a> 和 <a href="#" class="text-orange-600 hover:underline">隐私政策</a>
                    </span>
                  </template>
                </UCheckbox>
              </div>
            </div>
          </template>

          <UButton 
            type="submit" 
            color="primary" 
            size="xl" 
            :loading="loading"
            class="w-full font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all justify-center"
          >
            {{ isLogin ? '立即登录' : '创建账号' }}
          </UButton>
        </form>

        <!-- 切换模式 -->
        <div class="text-center mt-6">
          <p class="text-gray-600">
            {{ isLogin ? '还没有账号？' : '已有账号？' }}
            <button 
              @click="toggleMode" 
              class="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors ml-1"
            >
              {{ isLogin ? '立即注册' : '直接登录' }}
            </button>
          </p>
        </div>


      </div>
    </div>
  </div>
</template>
