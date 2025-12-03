import { request } from '~~/utils/request'
import type { CartItemVO, AddCartItemRequest, UpdateCartItemRequest } from '~~/types/api'

/**
 * 获取购物车列表
 * GET /api/cart
 */
export function getCartList() {
  return request<CartItemVO[]>('/api/cart', {
    method: 'GET'
  })
}

/**
 * 添加商品到购物车
 * POST /api/cart
 */
export function addCartItem(data: AddCartItemRequest) {
  return request<void>('/api/cart', {
    method: 'POST',
    body: data
  })
}

/**
 * 更新购物车商品
 * PUT /api/cart/{dishId}
 */
export function updateCartItem(data: UpdateCartItemRequest & { dishId: number }) {
  const { dishId, ...body } = data
  return request<void>(`/api/cart/${dishId}`, {
    method: 'PUT',
    body: body
  })
}

/**
 * 删除购物车商品
 * DELETE /api/cart/{dishId}
 */
export function deleteCartItem(dishId: number) {
  return request<void>(`/api/cart/${dishId}`, {
    method: 'DELETE'
  })
}

/**
 * 清空购物车
 * DELETE /api/cart
 */
export function clearCart() {
  return request<void>('/api/cart', {
    method: 'DELETE'
  })
}
