import { request } from '~~/utils/request'
import type { LoginRequest, RegisterRequest, LoginResponse } from '~~/types/api'

/**
 * 用户注册
 */
export function register(data: RegisterRequest) {
  return request<void>('/api/auth/register', {
    method: 'POST',
    body: data,
  })
}

/**
 * 用户登录
 */
export function login(data: LoginRequest) {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  })
}
