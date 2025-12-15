// constant
export const gridSpacing = 3
export const drawerWidth = 260
export const appDrawerWidth = 320
export const maxScroll = 100000

// 环境配置
const isProd = process.env.NODE_ENV === 'production'

// API 基础地址配置
export const baseURL = isProd 
    ? window.location.origin 
    : (process.env.FLOWISE_URL || window.location.origin.replace(':8080', ':3000'))

export const uiBaseURL = window.location.origin

// Socket.io 配置
export const socketURL = process.env.SOCKET_URL || 
    (isProd ? `${window.location.origin}/im/user` : 'http://localhost:30916/im/user')

// Flowise 相关常量
export const FLOWISE_CREDENTIAL_ID = 'FLOWISE_CREDENTIAL_ID'
export const REDACTED_CREDENTIAL_VALUE = '_FLOWISE_BLANK_07167752-1a71-43b1-bf8f-4f32252165db'

// 请求超时配置
export const REQUEST_TIMEOUT = 30000

