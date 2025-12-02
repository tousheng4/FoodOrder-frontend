import { request } from '~~/utils/request'
import type { ApiResult } from '~~/types/api'

export interface AddressVO {
  id: number
  receiverName: string
  receiverPhone: string
  detailAddress: string
  isDefault: number // 0=否，1=是
}

export interface AddressCreateRequest {
  receiverName: string
  receiverPhone: string
  detailAddress: string
}

export interface AddressUpdateRequest {
  receiverName: string
  receiverPhone: string
  detailAddress: string
}

/**
 * 获取地址列表
 */
export function getAddressList() {
  return request<AddressVO[]>('/api/address', {
    method: 'GET',
  })
}

/**
 * 获取单个地址详情
 */
export function getAddressDetail(id: number) {
  return request<AddressVO>(`/api/address/${id}`, {
    method: 'GET',
  })
}

/**
 * 新增地址
 */
export function addAddress(data: AddressCreateRequest) {
  return request<number>('/api/address', {
    method: 'POST',
    body: data,
  })
}

/**
 * 修改地址
 */
export function updateAddress(id: number, data: AddressUpdateRequest) {
  return request<void>(`/api/address/${id}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * 删除地址
 */
export function deleteAddress(id: number) {
  return request<void>(`/api/address/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(id: number) {
  return request<void>(`/api/address/${id}/default`, {
    method: 'PUT',
  })
}

/**
 * 获取默认地址
 */
export function getDefaultAddress() {
  return request<AddressVO>('/api/address/default', {
    method: 'GET',
  })
}
