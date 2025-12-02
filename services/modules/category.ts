import { request } from '~~/utils/request'
import type { Category } from '~~/types/api'

/**
 * 获取所有启用的分类列表
 * GET /api/categories
 */
export function getCategoryList() {
  return request<Category[]>('/api/categories', {
    method: 'GET'
  })
}
