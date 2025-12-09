import { request } from '~~/utils/request'
import type { 
  PageResult, 
  OrderDetailVO,
  AdminOrderQueryRequest,
  AdminOrderSummaryVO,
  AdminUpdateOrderStatusRequest 
} from '~~/types/api'

/**
 * 分页查询订单（管理员）
 * GET /api/admin/orders
 */
export function getAdminOrderPage(params: AdminOrderQueryRequest) {
  return request<PageResult<AdminOrderSummaryVO>>('/api/admin/orders', {
    method: 'GET',
    params
  })
}

/**
 * 获取订单详情（管理员）
 * GET /api/admin/orders/{id}
 */
export function getAdminOrderDetail(id: number) {
  return request<OrderDetailVO>(`/api/admin/orders/${id}`, {
    method: 'GET'
  })
}

/**
 * 更新订单状态
 * PUT /api/admin/orders/{id}/status
 */
export function updateOrderStatus(id: number, data: AdminUpdateOrderStatusRequest) {
  return request<void>(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    body: data
  })
}
