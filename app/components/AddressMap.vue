<script setup lang="ts">
// --- 高德地图配置 (请替换为你申请的 Key 和 安全密钥) ---
const AMAP_KEY = 'a3b2f2d3c04fce5ae2b5e227c1ed5baf' 
const AMAP_SECURITY_CODE = '3c369ac1686f117b96fd746ef69571d9'
// ----------------------------------------------------

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '300px'
  }
})

const emit = defineEmits(['update:modelValue'])

// Map State
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: any = null
let markerInstance: any = null
let geocoderInstance: any = null

// 动态加载高德地图脚本
const loadAMap = () => {
  return new Promise((resolve, reject) => {
    // 务必在加载脚本前设置安全密钥
    (window as any)._AMapSecurityConfig = {
      securityJsCode: AMAP_SECURITY_CODE,
    }

    if ((window as any).AMap) {
      resolve((window as any).AMap)
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder,AMap.AutoComplete,AMap.PlaceSearch`
    script.onerror = reject
    script.onload = () => {
      resolve((window as any).AMap)
    }
    document.head.appendChild(script)
  })
}

// 初始化地图
const initMap = async () => {
  try {
    const AMap = await loadAMap() as any
    
    if (!mapContainer.value) return

    // 销毁旧实例（如果有）
    if (mapInstance) {
      mapInstance.destroy()
      mapInstance = null
    }

    // 创建地图实例
    mapInstance = new AMap.Map(mapContainer.value, {
      zoom: 13,
      center: [116.397428, 39.90923], // 默认北京
      viewMode: '2D',
      resizeEnable: true // 允许监控地图容器尺寸变化
    })

    // 点击地图事件
    mapInstance.on('click', (e: any) => {
      updateMarkerPosition(e.lnglat)
      getAddressFromCoords(e.lnglat)
    })

    // 初始化地理编码插件
    if (!geocoderInstance) {
      geocoderInstance = new AMap.Geocoder({
        city: '全国'
      })
    }

    // 如果有初始地址，尝试回显
    if (props.modelValue) {
      searchAddressLocation(props.modelValue)
    }

  } catch (e) {
    console.error('地图加载失败', e)
  }
}

// 更新标记位置
const updateMarkerPosition = (lnglat: any) => {
  const AMap = (window as any).AMap
  if (!markerInstance) {
    markerInstance = new AMap.Marker({
      position: lnglat,
      map: mapInstance
    })
  } else {
    markerInstance.setPosition(lnglat)
  }
  mapInstance.setCenter(lnglat)
}

// 根据坐标获取地址 (逆地理编码)
const getAddressFromCoords = (lnglat: any) => {
  if (!geocoderInstance) return
  
  geocoderInstance.getAddress(lnglat, (status: string, result: any) => {
    if (status === 'complete' && result.regeocode) {
      const address = result.regeocode.formattedAddress
      emit('update:modelValue', address)
    }
  })
}

// 根据地址搜索坐标 (地理编码)
const searchAddressLocation = (address: string) => {
  if (!geocoderInstance || !address) return

  geocoderInstance.getLocation(address, (status: string, result: any) => {
    if (status === 'complete' && result.geocodes.length) {
      const lnglat = result.geocodes[0].location
      updateMarkerPosition(lnglat)
      mapInstance.setFitView(markerInstance)
    }
  })
}

// 暴露给父组件的方法，用于手动触发搜索（例如父组件输入框防抖后调用）
defineExpose({
  searchAddressLocation,
  initMap
})

onMounted(() => {
  // 延迟初始化，确保模态框动画完成且 DOM 尺寸正确
  setTimeout(() => {
    initMap()
  }, 500)
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>


<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div ref="mapContainer" :style="{ height: height }" class="w-full bg-gray-100 dark:bg-gray-800 relative">
        <div class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          <UIcon name="i-lucide-map" class="mr-2" /> 地图初始化中...
        </div>
    </div>
    <div class="p-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
