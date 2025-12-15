/**
 * @name UmiJS 项目配置
 * @doc https://umijs.org/docs/api/config
 */
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';

export default defineConfig({
  hash: true,
  // 开启 antd 插件
  antd: {},
  // 开启 request 插件
  request: {},
  // 开启 initial-state 和 model 插件
  initialState: {},
  model: {},
  // 开启 layout 插件
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // 开启 locale 国际化插件
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  // 开启 access 权限插件
  access: {},
  // 代理配置
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  // 路由配置
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './UserRy/login',
        },
        {
          name: 'register',
          path: '/user/register',
          component: './UserRy/register',
        },
      ],
    },
    {
      path: '/welcome',
      name: 'welcome',
      icon: 'smile',
      component: './Welcome',
    },
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      path: '/AiChat',
      name: 'AiChat',
      icon: 'smile',
      routes: [
        {
          path: '/AiChat/user',
          name: 'user',
          component: './AiChat/user',
        },
        {
          path: '/AiChat/agent',
          name: 'agent',
          component: './AiChat/agent',
        },
      ],
    },
    {
      path: '/flow',
      name: 'flow',
      icon: 'apartment',
      routes: [
        {
          path: '/flow/flowmanager',
          name: 'flowmanager',
          component: './flow/flowmanager',
        },
        {
          path: '/flow/flowmap',
          name: 'flowmap',
          component: './flow/flowmap',
        },
      ],
    },
    {
      path: '*',
      component: './404',
    },
  ],
  // 主题配置
  theme: {
    'primary-color': defaultSettings.colorPrimary,
  },
  // 打包配置
  title: 'FreeIPCC',
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: true,
  // 依赖预编译
  mfsu: {
    strategy: 'normal',
  },
});
