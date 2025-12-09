import { request } from '~~/utils/request'
import type { ConsoleDetailVO } from '~~/types/api'

/**
 * 获取管理后台控制台统计数据
 * GET /api/admin/basic/console-detail
 */
export function getConsoleDetail() {
  return request<ConsoleDetailVO>('/api/admin/basic/console-detail', {
    method: 'GET'
  })
}
