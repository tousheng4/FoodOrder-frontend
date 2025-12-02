import type { ApiResult } from '~~/types/api'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}

/**
 * 封装的请求工具函数
 */
export async function request<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // 在函数内部获取运行时配置，确保在 Nuxt 上下文中调用
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBaseUrl as string

  const { method = 'GET', body, params, headers = {} } = options

  // 从 Cookie 获取 token
  const token = useCookie('auth_token').value
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await $fetch<ApiResult<T>>(`${BASE_URL}${url}`, {
      method,
      body,
      params,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    // 后端返回的统一格式：{ code, msg, data }
    if (response.code === 0) {
      return response.data
    } else {
      // 处理业务错误
      const errorMsg = response.msg || '请求失败'
      throw new Error(errorMsg)
    }
  } catch (error: any) {
    console.error('API Error:', error)
    
    // 处理不同类型的错误
    if (error.statusCode === 401) {
      // 401 未授权：token 过期或无效
      handleUnauthorized()
      throw new Error('登录状态已过期，请重新登录')
    } else if (error.statusCode === 403) {
      // 403 权限不足
      throw new Error('您没有权限执行此操作')
    } else if (error.statusCode === 404) {
      // 404 资源不存在
      throw new Error('请求的资源不存在')
    } else if (error.statusCode === 500) {
      // 500 服务器错误
      throw new Error('服务器错误，请稍后重试')
    } else if (error.statusCode) {
      // 其他 HTTP 错误
      throw new Error(error.data?.msg || error.message || '网络请求失败')
    } else {
      // 网络错误或其他未知错误
      throw new Error(error.message || '网络连接失败，请检查网络后重试')
    }
  }
}

/**
 * 处理未授权错误：清除本地存储并跳转登录页
 */
function handleUnauthorized() {
  if (process.client) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 避免在登录页重复跳转
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}
