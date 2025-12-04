import { ref, computed } from 'vue'
import type { UserVO, LoginRequest, RegisterRequest } from '~~/types/api'
import { login as apiLogin, register as apiRegister } from '~~/services/modules/auth'
import { getUserInfo as apiGetUserInfo } from '~~/services/modules/user'

/**
 * 用户认证状态管理 Composable
 */
export const useAuth = () => {
  // Token 使用 useCookie 自动管理 Cookie，实现持久化
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7天过期
    watch: 'shallow' // 监听变化
  })

  // 当前登录用户信息
  const user = useState<UserVO | null>('auth-user', () => null)

  // 客户端初始化时，尝试从 localStorage 恢复用户信息
  if (process.client && token.value && !user.value) {
    const savedUser = localStorage.getItem('auth_user_info')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse user info', e)
        // 如果解析失败，可能数据损坏，清除它
        localStorage.removeItem('auth_user_info')
      }
    }
  }

  // 是否已登录
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 是否为管理员
  const isAdmin = computed(() => user.value?.role === 1)

  /**
   * 用户登录
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiLogin(credentials)
      
      // 保存 token 和用户信息
      token.value = response.token
      user.value = response.user

      if (process.client) {
        // Token 由 useCookie 自动保存，这里只需要保存用户信息
        localStorage.setItem('auth_user_info', JSON.stringify(response.user))
      }

      return { success: true, data: response }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || '登录失败，请稍后重试' 
      }
    }
  }

  /**
   * 用户注册
   */
  const register = async (data: RegisterRequest) => {
    try {
      await apiRegister(data)
      return { success: true }
    } catch (error: any) {
      console.error('Register error:', error)
      return { 
        success: false, 
        error: error.message || '注册失败，请稍后重试' 
      }
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    user.value = null
    token.value = null

    if (process.client) {
      localStorage.removeItem('auth_user_info')
    }

    // 跳转到登录页
    navigateTo('/login')
  }

  /**
   * 检查 Token 是否有效
   * 简单检查：token 存在即认为有效
   * 复杂场景可以解析 JWT 判断过期时间
   */
  const checkAuth = () => {
    if (!token.value || !user.value) {
      return false
    }
    return true
  }

  /**
   * 更新用户信息
   */
  const updateUser = (newUser: Partial<UserVO>) => {
    if (user.value) {
      user.value = { ...user.value, ...newUser }
      
      if (process.client) {
        localStorage.setItem('auth_user_info', JSON.stringify(user.value))
      }
    }
  }

  /**
   * 刷新用户信息（从服务器重新获取）
   */
  const refreshUser = async () => {
    if (!token.value) return { success: false, error: '未登录' }
    
    try {
      const userInfo = await apiGetUserInfo()
      user.value = userInfo
      
      if (process.client) {
        localStorage.setItem('auth_user_info', JSON.stringify(userInfo))
      }
      
      return { success: true, data: userInfo }
    } catch (error: any) {
      console.error('Refresh user error:', error)
      return { 
        success: false, 
        error: error.message || '获取用户信息失败' 
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    refreshUser,
  }
}
