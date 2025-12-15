/**
 * @name 默认配置
 * 系统默认布局和主题配置
 */

import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'FreeIPCC',
  pwa: false,
  logo: '/logo.svg',
  iconfontUrl: '',
};

export default Settings;
