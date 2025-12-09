// ==================== 通用类型 ====================
export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  total: number
  records: T[]  // 后端返回的是 records 字段
  list?: T[]    // 兼容旧代码
  page: number
  size: number
}

// ==================== 用户相关 ====================
export interface UserVO {
  id: number
  username: string
  nickname: string
  phone: string
  avatar: string
  role: number
  status: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  phone: string  // 后端要求必填
  nickname?: string
}

export interface LoginResponse {
  token: string
  user: UserVO
}

// ==================== 菜品相关 ====================
export interface Dish {
  id: number
  categoryId: number
  name: string
  price: number
  image: string
  description: string
  status: number
  stock: number
  sales: number
  deleted: number
  createdAt: string
  updatedAt: string
}

export interface DishQueryRequest {
  name?: string
  categoryId?: number
  status?: number
  page?: number
  size?: number
}

export interface DishSearchRequest {
  keyword?: string
  categoryId?: number
  status?: number
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
}

// ==================== 分类相关 ====================
export interface Category {
  id: number
  name: string
  sort: number
  status: number
  createdAt: string
  updatedAt: string
}

// ==================== 购物车相关 ====================
export interface CartItemVO {
  cartItemId: number
  dishId: number
  dishName: string
  dishImage: string
  price: number
  quantity: number
  checked: number
  subTotal: number
}

export interface AddCartItemRequest {
  dishId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity?: number
  checked?: number
}

// ==================== 订单相关 ====================
export interface OrderSummaryVO {
  id: number
  orderNo: string
  status: number
  totalAmount: number
  payAmount: number
  freightAmount: number
  createdAt: string
  payTime?: string
  cancelTime?: string
}

export interface OrderItemVO {
  id: number
  dishId: number
  dishName: string
  dishImage: string
  unitPrice: number
  quantity: number
  subTotal: number
}

export interface OrderDetailVO {
  id: number
  orderNo: string
  status: number
  totalAmount: number
  payAmount: number
  freightAmount: number
  createdAt: string
  payTime?: string
  cancelTime?: string
  cancelReason?: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
  items: OrderItemVO[]
}

export interface CreateOrderRequest {
  addressId: number
  remark?: string
}

export interface CancelOrderRequest {
  cancelReason?: string
}

// ==================== 支付相关 ====================
export interface PaymentCreateResponse {
  paymentId: string
  formHtml: string  // 支付宝表单HTML，需要渲染后自动提交
}

export interface PaymentStatusResponse {
  orderNo: string
  status: 'PENDING' | 'PAID' | 'FAILED'
  paidAt?: string
  tradeNo?: string
}

// ==================== 地址相关 ====================
export interface AddressVO {
  id: number
  receiverName: string
  receiverPhone: string
  detailAddress: string
  isDefault: number
}

export interface AddressCreateRequest {
  receiverName: string
  receiverPhone: string
  detailAddress: string
  isDefault?: number
}

export interface AddressUpdateRequest {
  receiverName?: string
  receiverPhone?: string
  detailAddress?: string
  isDefault?: number
}

// ==================== 评价相关 ====================
export interface ReviewVO {
  id: number
  userId: number
  username: string
  nickname: string
  dishId: number
  dishName: string
  rating: number
  content: string
  createdAt: string
}

export interface CreateReviewRequest {
  orderId: number
  dishId: number
  rating: number
  content: string
}

// ==================== 管理后台相关 ====================
export interface ConsoleDetailVO {
  totalUserCount: number
  todayOrderCount: number
  totalSales: number
  toDoCount: number
}

export interface AdminOrderQueryRequest {
  orderNo?: string
  userId?: number
  status?: number
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface AdminOrderSummaryVO {
  id: number
  orderNo: string
  userId: number
  status: number
  totalAmount: number
  payAmount: number
  createdAt: string
  payTime?: string
}

export interface AdminUpdateOrderStatusRequest {
  status: number
  cancelReason?: string
}

// ==================== 管理员用户管理 ====================
export interface AdminUserVO {
  id: number
  username: string
  nickname: string
  phone: string
  avatar: string
  role: number       // 0=普通用户, 1=管理员
  status: number     // 0=禁用, 1=正常
  lastLoginAt?: string
  createdAt: string
}

export interface AdminUserQueryRequest {
  username?: string
  role?: number
  status?: number
  page?: number
  size?: number
}

export interface AdminUpdateUserStatusRequest {
  status: number
}

export interface AdminUpdateUserRoleRequest {
  role: number
}
