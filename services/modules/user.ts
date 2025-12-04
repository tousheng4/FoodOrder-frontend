import { request } from '~~/utils/request'
import type { UserVO } from '~~/types/api'

/**
 * 更新用户信息请求
 */
export interface UpdateUserInfoRequest {
  nickname?: string
  avatarFile?: File
}

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return request<UserVO>('/api/user/info', {
    method: 'GET'
  })
}

/**
 * 更新用户信息
 * @param data UpdateUserInfoRequest
 */
export function updateUserInfo(data: UpdateUserInfoRequest) {
  const formData = new FormData()
  if (data.nickname) {
    formData.append('nickname', data.nickname)
  }
  if (data.avatarFile) {
    formData.append('avatarFile', data.avatarFile)
  }

  return request<void>('/api/user/info', {
    method: 'PUT',
    body: formData
  })
}

