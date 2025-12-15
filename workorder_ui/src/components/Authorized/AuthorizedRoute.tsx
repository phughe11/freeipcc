import { Navigate } from '@umijs/max';
import React from 'react';
import Authorized from './Authorized';
import { IAuthorityType } from './CheckPermissions';

interface AuthorizedRouteProps {
  currentAuthority?: string;
  component?: React.ComponentType<any>;
  render?: (props: any) => React.ReactNode;
  redirectPath: string;
  authority: IAuthorityType;
  children?: React.ReactNode;
}

/**
 * 授权路由组件
 * 在 UmiJS Max v4 中，路由由配置驱动，此组件用于包装需要权限控制的内容
 */
const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({
  component: Component,
  render,
  authority,
  redirectPath,
  children,
  ...rest
}) => {
  const renderContent = () => {
    if (children) {
      return children;
    }
    if (Component) {
      return <Component {...rest} />;
    }
    if (render) {
      return render(rest);
    }
    return null;
  };

  return (
    <Authorized
      authority={authority}
      noMatch={<Navigate to={redirectPath} replace />}
    >
      {renderContent()}
    </Authorized>
  );
};

export default AuthorizedRoute;
