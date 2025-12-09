import { request } from '~~/utils/request'
import type { Dish, DishQueryRequest, DishSearchRequest, PageResult } from '~~/types/api'

/**
 * 用户端：分页查询菜品（仅上架的）
 * GET /api/dishes
 */
export function getDishPage(params: DishQueryRequest) {
  return request<PageResult<Dish>>('/api/dishes', {
    method: 'GET',
    params: params
  })
}

/**
 * 用户端：获取菜品详情
 * GET /api/dishes/{id}
 */
export function getDishById(id: number) {
  return request<Dish>(`/api/dishes/${id}`, {
    method: 'GET'
  })
}

/**
 * 用户端：搜索菜品（支持关键词、分类、价格区间筛选）
 * GET /api/dishes/search
 */
export function searchDishes(params: DishSearchRequest) {
  return request<PageResult<Dish>>('/api/dishes/search', {
    method: 'GET',
    params: params
  })
}
