import { request } from '~~/utils/request'
import type { ReviewVO, CreateReviewRequest, PageResult } from '~~/types/api'

/**
 * 创建评价
 * POST /api/reviews
 */
export function createReview(data: CreateReviewRequest) {
  return request<void>('/api/reviews', {
    method: 'POST',
    body: data
  })
}

/**
 * 某个菜品的评价列表
 * GET /api/reviews/dish/{dishId}
 */
export function getDishReviews(dishId: number, page: number = 1, size: number = 10) {
  return request<PageResult<ReviewVO>>(`/api/reviews/dish/${dishId}`, {
    method: 'GET',
    params: { page, size }
  })
}

/**
 * 我的评价列表
 * GET /api/reviews/my
 */
export function getMyReviews(page: number = 1, size: number = 10) {
  return request<PageResult<ReviewVO>>('/api/reviews/my', {
    method: 'GET',
    params: { page, size }
  })
}
