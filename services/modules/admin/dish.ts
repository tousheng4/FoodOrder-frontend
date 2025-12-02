import { request } from '~~/utils/request'
import type { PageResult } from '~~/types/api'

// 管理员菜品 VO
export interface AdminDishVO {
  id: number
  name: string
  description: string
  image: string
  price: number
  categoryId: number
  status: number
  createdAt: string
}

// 管理员保存菜品请求
export interface AdminSaveDishRequest {
  name: string
  description?: string
  image?: string
  price: number
  categoryId: number
  status: number
}

// 菜品查询参数
export interface AdminDishQueryParams {
  name?: string
  categoryId?: number
  status?: number
  page?: number
  size?: number
}

/**
 * 分页查询菜品（管理员）
 * GET /api/admin/dishes
 */
export function getAdminDishPage(params: AdminDishQueryParams) {
  return request<PageResult<AdminDishVO>>('/api/admin/dishes', {
    method: 'GET',
    params: params
  })
}

/**
 * 创建菜品（管理员）
 * POST /api/admin/dishes
 */
export function createAdminDish(data: AdminSaveDishRequest) {
  return request<number>('/api/admin/dishes', {
    method: 'POST',
    body: data
  })
}

/**
 * 更新菜品（管理员）
 * PUT /api/admin/dishes/{id}
 */
export function updateAdminDish(id: number, data: AdminSaveDishRequest) {
  return request<void>(`/api/admin/dishes/${id}`, {
    method: 'PUT',
    body: data
  })
}

/**
 * 更新菜品状态（管理员）
 * PUT /api/admin/dishes/{id}/status?status=
 */
export function updateAdminDishStatus(id: number, status: number) {
  return request<void>(`/api/admin/dishes/${id}/status`, {
    method: 'PUT',
    params: { status }
  })
}

/**
 * 删除菜品（管理员）
 * DELETE /api/admin/dishes/{id}
 */
export function deleteAdminDish(id: number) {
  return request<void>(`/api/admin/dishes/${id}`, {
    method: 'DELETE'
  })
}
