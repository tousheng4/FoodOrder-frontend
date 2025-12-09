import { request } from '~~/utils/request'
import type { 
  CreateOrderRequest, 
  OrderSummaryVO, 
  OrderDetailVO, 
  PageResult,
  CancelOrderRequest,
  PaymentCreateResponse,
  PaymentStatusResponse
} from '~~/types/api'

/**
 * 创建订单
 * POST /api/orders
 */
export function createOrder(data: CreateOrderRequest) {
  return request<number>('/api/orders', {
    method: 'POST',
    body: data
  })
}

/**
 * 支付订单 (模拟)
 * POST /api/orders/{id}/pay
 */
export function payOrder(id: number) {
  return request<void>(`/api/orders/${id}/pay`, {
    method: 'POST'
  })
}

/**
 * 取消订单
 * POST /api/orders/{id}/cancel
 */
export function cancelOrder(id: number, data?: CancelOrderRequest) {
  return request<void>(`/api/orders/${id}/cancel`, {
    method: 'POST',
    body: data
  })
}

/**
 * 获取订单列表
 * GET /api/orders
 */
export function getOrderList(params: { page?: number, size?: number, status?: number }) {
  return request<PageResult<OrderSummaryVO>>('/api/orders', {
    method: 'GET',
    params
  })
}

/**
 * 获取订单详情
 * GET /api/orders/{id}
 */
export function getOrderDetail(id: number) {
  return request<OrderDetailVO>(`/api/orders/${id}`, {
    method: 'GET'
  })
}

/**
 * 发起支付宝支付
 * POST /api/orders/{id}/alipay
 * 返回支付表单HTML，前端渲染后自动跳转支付宝
 */
export function createAlipayPayment(id: number) {
  return request<PaymentCreateResponse>(`/api/orders/${id}/alipay`, {
    method: 'POST'
  })
}

/**
 * 查询支付状态
 * GET /api/orders/{id}/payment-status
 * 前端轮询此接口确认支付结果
 */
export function getPaymentStatus(id: number) {
  return request<PaymentStatusResponse>(`/api/orders/${id}/payment-status`, {
    method: 'GET'
  })
}
