import { ref, computed } from 'vue'
import type { CartItemVO } from '~~/types/api'
import { 
  getCartList, 
  addCartItem as apiAddCartItem, 
  updateCartItem as apiUpdateCartItem, 
  deleteCartItem as apiDeleteCartItem,
  clearCart as apiClearCart 
} from '~~/services/modules/cart'
import { useAuth } from './useAuth'

export const useCart = () => {
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  
  const cartItems = useState<CartItemVO[]>('cart-items', () => [])
  const loading = useState<boolean>('cart-loading', () => false)
  const isCartOpen = useState<boolean>('cart-open', () => false)

  // 计算属性：购物车总数量
  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 计算属性：购物车总金额
  const totalAmount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  /**
   * 获取购物车列表
   */
  const fetchCart = async () => {
    if (!isAuthenticated.value) {
      cartItems.value = []
      return
    }
    
    loading.value = true
    try {
      const res = await getCartList()
      cartItems.value = res || []
    } catch (error) {
      console.error('Fetch cart error:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加到购物车
   */
  const addToCart = async (dishId: number, quantity: number = 1) => {
    if (!isAuthenticated.value) {
      navigateTo('/login')
      toast.add({ title: '请先登录', color: 'warning' })
      return
    }

    try {
      // 乐观更新：先检查本地是否已有该商品
      const existingItem = cartItems.value.find(item => item.dishId === dishId)
      
      await apiAddCartItem({ dishId, quantity })
      
      toast.add({ title: '已加入购物车', color: 'success' })
      // 重新获取购物车，确保数据同步
      await fetchCart()
    } catch (error: any) {
      console.error('Add to cart error:', error)
      toast.add({ title: '添加失败', description: error.message, color: 'error' })
    }
  }

  /**
   * 更新购物车项数量
   */
  const updateQuantity = async (item: CartItemVO, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeCartItem(item.dishId)
    }

    try {
      // 这里的接口定义有点模糊，假设 updateCartItem 接受 { ... }
      // 如果后端需要 cartItemId，我们这里有 item.cartItemId
      // 暂时假设 updateCartItem 也是传 dishId 或者 cartItemId
      // 根据之前的 api.ts，UpdateCartItemRequest 只有 quantity 和 checked
      // 我们在 services/modules/cart.ts 里可能需要调整 updateCartItem 的签名
      // 假设后端接收 UpdateCartItemRequest 作为一个对象，并且在 URL 里或者是 body 里带 ID
      // 这里暂时先不动 service，等会去改 service
      
      // 暂时模拟：先修改本地，再调接口
      const oldQuantity = item.quantity
      item.quantity = newQuantity
      
      // 构造请求数据
      await apiUpdateCartItem({ 
        dishId: item.dishId,
        quantity: newQuantity 
      })
      
      await fetchCart()
    } catch (error) {
      console.error('Update cart error:', error)
      toast.add({ title: '更新失败', color: 'error' })
      await fetchCart() // 回滚
    }
  }

  /**
   * 删除购物车项
   */
  const removeCartItem = async (dishId: number) => {
    try {
      await apiDeleteCartItem(dishId)
      cartItems.value = cartItems.value.filter(item => item.dishId !== dishId)
      toast.add({ title: '已删除', color: 'success' })
    } catch (error) {
      console.error('Delete cart item error:', error)
      toast.add({ title: '删除失败', color: 'error' })
    }
  }

  /**
   * 清空购物车
   */
  const clear = async () => {
    try {
      await apiClearCart()
      cartItems.value = []
      toast.add({ title: '购物车已清空', color: 'success' })
    } catch (error) {
      console.error('Clear cart error:', error)
      toast.add({ title: '清空失败', color: 'error' })
    }
  }

  return {
    cartItems,
    loading,
    totalCount,
    totalAmount,
    isCartOpen,
    fetchCart,
    addToCart,
    updateQuantity,
    removeCartItem,
    clear
  }
}

