// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  // 运行时配置
  runtimeConfig: {
    public: {
      // API 基础地址，可通过环境变量 NUXT_PUBLIC_API_BASE_URL 覆盖
      // 使用 /proxy 前缀来避免与 Nuxt 内部 API (如 /api/_nuxt_icon) 冲突
      apiBaseUrl: '/proxy'
    }
  },

  // 路由规则（代理配置）
  routeRules: {
    // 将 /proxy/** 转发到后端 http://localhost:8080/**
    '/proxy/**': {
      proxy: 'http://localhost:8080/**'
    }
  },

  // Icon 配置
  icon: {
    serverBundle: {
      collections: ['lucide', 'heroicons']
    }
  }
})