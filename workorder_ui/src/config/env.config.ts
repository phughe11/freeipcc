/**
 * 环境配置文件
 * 集中管理所有环境相关的配置项
 */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// API 基础配置
export const API_CONFIG = {
  // 主 API 服务地址
  BASE_URL: process.env.API_BASE_URL || (isProd ? '' : ''),
  
  // Socket.io 服务地址
  SOCKET_URL: process.env.SOCKET_URL || 
    (isProd ? `${window.location.origin}/im/user` : 'http://localhost:30916/im/user'),
  
  // Flowise API 地址
  FLOWISE_URL: process.env.FLOWISE_URL || 
    (isProd ? window.location.origin : window.location.origin.replace(':8080', ':3000')),
  
  // 请求超时时间 (毫秒)
  TIMEOUT: 30000,
  
  // 重试次数
  RETRY_COUNT: 3,
};

// 认证配置
export const AUTH_CONFIG = {
  // Token 存储的 key
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  EXPIRE_TIME_KEY: 'expireTime',
  
  // Token 刷新时间窗口 (毫秒) - 过期前5分钟刷新
  TOKEN_REFRESH_WINDOW: 5 * 60 * 1000,
  
  // 登录页路径
  LOGIN_PATH: '/user/login',
  
  // 无需认证的路径
  PUBLIC_PATHS: ['/user/login', '/AiChat/user', '/user/register'],
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};

// 日志配置
export const LOG_CONFIG = {
  // 是否启用控制台日志 (生产环境禁用)
  ENABLE_CONSOLE_LOG: isDev,
  
  // 日志级别
  LOG_LEVEL: isDev ? 'debug' : 'error',
};

// 缓存配置
export const CACHE_CONFIG = {
  // 菜单按钮缓存 key
  MENUS_BUTTONS_KEY: 'MENUS_BUTTONS_CACHE',
  
  // 缓存过期时间 (毫秒)
  DEFAULT_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
};

// 导出环境判断
export const ENV = {
  isDev,
  isProd,
  isTest: process.env.NODE_ENV === 'test',
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  PAGINATION_CONFIG,
  LOG_CONFIG,
  CACHE_CONFIG,
  ENV,
};
