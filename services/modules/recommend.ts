import { request } from '~~/utils/request'
import type { Dish } from '~~/types/api'

/**
 * 按评分推荐菜品
 * GET /api/recommend/rating?num=
 */
export function getRecommendByRating(num: number = 8) {
  return request<Dish[]>('/api/recommend/rating', {
    method: 'GET',
    params: { num }
  })
}

/**
 * 按销量推荐菜品
 * GET /api/recommend/sales?num=
 */
export function getRecommendBySales(num: number = 8) {
  return request<Dish[]>('/api/recommend/sales', {
    method: 'GET',
    params: { num }
  })
}

