# System Management (系统管理)

## Purpose

系统管理模块，提供企业级的系统运维和权限控制能力。包括用户账户管理、角色权限配置(RBAC)、动态菜单管理、组织架构维护、数据字典配置和系统参数设置等功能，是整个系统的基础管理平台。

## Requirements

### Requirement: User Management (用户管理)

系统 SHALL 支持用户账户的全生命周期管理。

#### Scenario: Create User
- **WHEN** 管理员创建新用户
- **THEN** 系统创建账户并发送初始密码

#### Scenario: Update User
- **WHEN** 管理员修改用户信息
- **THEN** 系统保存更新

#### Scenario: Disable User
- **WHEN** 管理员禁用用户
- **THEN** 用户无法登录系统

---

### Requirement: Role Management (角色管理)

系统 SHALL 支持基于角色的权限控制 (RBAC)。

#### Scenario: Create Role
- **WHEN** 管理员创建角色
- **THEN** 系统创建角色并可分配权限

#### Scenario: Assign Permissions
- **WHEN** 管理员为角色分配权限
- **THEN** 拥有该角色的用户获得相应权限

#### Scenario: Assign Role to User
- **WHEN** 管理员为用户分配角色
- **THEN** 用户获得角色对应的所有权限

---

### Requirement: Menu Management (菜单管理)

系统 SHALL 支持动态菜单配置。

#### Scenario: Create Menu Item
- **WHEN** 管理员创建菜单项
- **THEN** 菜单项出现在导航中

#### Scenario: Configure Menu Permission
- **WHEN** 管理员配置菜单权限
- **THEN** 只有授权用户可见该菜单

---

### Requirement: Department Management (部门管理)

系统 SHALL 支持组织架构管理。

#### Scenario: Create Department
- **WHEN** 管理员创建部门
- **THEN** 系统创建部门节点

#### Scenario: Build Department Tree
- **WHEN** 访问部门管理
- **THEN** 系统展示树形组织结构

---

### Requirement: Dictionary Management (数据字典)

系统 SHALL 支持数据字典管理，用于维护系统枚举值。

#### Scenario: Create Dictionary Type
- **WHEN** 管理员创建字典类型
- **THEN** 系统创建字典分类

#### Scenario: Add Dictionary Data
- **WHEN** 管理员添加字典数据
- **THEN** 数据可在业务中引用

---

### Requirement: System Config (系统配置)

系统 SHALL 支持运行时配置管理。

#### Scenario: Update Config
- **WHEN** 管理员修改配置项
- **THEN** 系统保存并应用新配置

---

## Technical Notes

- 前端位于 `/workorder_ui/src/pages/system/`
- 子模块: user/, role/, menu/, dept/, dict/, config/
- 使用 Ant Design Pro Table 组件
- 权限通过 `initialState.currentUser.permissions` 控制
