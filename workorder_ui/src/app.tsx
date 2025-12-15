import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
// third party
import { store } from '@/store'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'
import { ThemeProvider } from '@mui/material/styles'
import { StyledEngineProvider } from '@mui/material'
// defaultTheme
import themes from '@/pages/gptchat/themes'

import { getUserInfo, getRoutersInfo } from '@/services/session';
import AIcon from '@/components/AIcon';
import React from "react";
import { AUTH_CONFIG, ENV } from '@/config/env.config';

const { LOGIN_PATH, PUBLIC_PATHS } = AUTH_CONFIG;
const chatPath = '/AiChat/user';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    // 检查是否是公开路径
    const isPublicPath = PUBLIC_PATHS.some(path => location.pathname.startsWith(path));
    if (isPublicPath) {
      return undefined;
    }
    
    try {
      const resp = await getUserInfo();
      if (resp === undefined || resp.code !== 200) {
        history.push(LOGIN_PATH);
        return undefined;
      }
      return { ...resp.user, permissions: resp.permissions } as API.CurrentUser;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      history.push(LOGIN_PATH);
      return undefined;
    }
  };
  
  // 如果不是登录页面，执行
  if (history.location.pathname !== LOGIN_PATH) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

const MenuItemIcon = (
  menuItemProps: any,
  defaultDom: React.ReactNode,
  props: any,
): React.ReactNode => {
  if (defaultDom) {
    // @ts-ignore
    const menuItem = React.cloneElement(defaultDom, {
      // @ts-ignore
      children: [<AIcon type={menuItemProps.icon as string} />, defaultDom.props.children[1]],
      ...props,
    });
    return menuItem;
  }
  return defaultDom;
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    navTheme: 'light',
    headerTheme: 'light',
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: () => <Footer />,

    onPageChange: () => {
      const { location } = history;
      // 检查是否是公开路径
      const isPublicPath = PUBLIC_PATHS.some(path => location.pathname.startsWith(path));
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && !isPublicPath) {
        history.push(LOGIN_PATH);
      }
    },

    links: ENV.isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    actionsRender: undefined,
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?.userId,
      },
      request: async () => {
        if (!initialState?.currentUser?.userId) {
          return [];
        }
        try {
          const menus = await getRoutersInfo();
          setInitialState((preInitialState) => ({
            ...preInitialState,
            menus,
          }));
          return menus;
        } catch (error) {
          console.error('获取菜单失败:', error);
          return [];
        }
      },
    },
    /**menuDataRender: () =>{
      return fixMenuItemIcon(initialState?.menuData)
    },**/
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>

          <Provider store={store}>
              <SnackbarProvider>
                <ConfirmContextProvider>
                  <ReactFlowContext>

                    <StyledEngineProvider injectFirst>
                      <ThemeProvider theme={themes}>
                        {children}
                      </ThemeProvider>
                    </StyledEngineProvider>
                  </ReactFlowContext>
                </ConfirmContextProvider>
              </SnackbarProvider>
          </Provider>
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
          <div id="portal"></div>
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
