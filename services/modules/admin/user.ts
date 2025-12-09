import { request } from '~~/utils/request'
import type { 
  PageResult,
  AdminUserVO,
  AdminUserQueryRequest,
  AdminUpdateUserStatusRequest,
  AdminUpdateUserRoleRequest
} from '~~/types/api'

/**
 * 分页查询用户（管理员）
 * GET /api/admin/users
 */
export function getAdminUserPage(params: AdminUserQueryRequest) {
  return request<PageResult<AdminUserVO>>('/api/admin/users', {
    method: 'GET',
    params
  })
}

/**
 * 更新用户状态（禁用/启用）
 * PUT /api/admin/users/{id}/status
 */
export function updateUserStatus(id: number, data: AdminUpdateUserStatusRequest) {
  return request<void>(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    body: data
  })
}

/**
 * 更新用户角色
 * PUT /api/admin/users/{id}/role
 */
export function updateUserRole(id: number, data: AdminUpdateUserRoleRequest) {
  return request<void>(`/api/admin/users/${id}/role`, {
    method: 'PUT',
    body: data
  })
}
