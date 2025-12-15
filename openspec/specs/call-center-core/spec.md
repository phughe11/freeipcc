# Call Center Core (呼叫中心核心)

## Purpose

呼叫中心系统的核心功能模块，提供话务系统的基础能力支撑。包括多租户公司管理、坐席分组配置、路由规则设定、VDN 虚拟号码管理以及通话录音回放等功能，构成整个呼叫中心的运营基础设施。

## Requirements

### Requirement: Company Management (公司/租户管理)

系统 SHALL 支持多租户公司管理，包括公司信息的增删改查、展示配置和电话配置。

#### Scenario: List Companies
- **WHEN** 管理员访问公司列表页面
- **THEN** 系统显示所有公司的列表，包含公司名称、状态等基本信息

#### Scenario: Create Company
- **WHEN** 管理员提交新公司信息
- **THEN** 系统创建公司记录并分配唯一标识

#### Scenario: Update Company Phone Config
- **WHEN** 管理员修改公司电话配置
- **THEN** 系统保存配置并应用到该公司的呼叫路由

---

### Requirement: Agent Group Management (坐席分组管理)

系统 SHALL 支持坐席分组管理，用于组织和管理客服人员。

#### Scenario: Create Agent Group
- **WHEN** 管理员创建新的坐席分组
- **THEN** 系统创建分组并可分配坐席

#### Scenario: Assign Agents to Group
- **WHEN** 管理员将坐席分配到分组
- **THEN** 该坐席接收该分组的呼叫

---

### Requirement: Route Configuration (路由配置)

系统 SHALL 支持呼叫路由配置，包括网关配置和呼叫路由规则。

#### Scenario: Configure Gateway
- **WHEN** 管理员添加或修改网关配置
- **THEN** 系统保存网关信息用于呼叫连接

#### Scenario: Create Call Route
- **WHEN** 管理员创建呼叫路由规则
- **THEN** 系统按规则分配入站呼叫

---

### Requirement: VDN Configuration (虚拟目录号码配置)

系统 SHALL 支持 VDN (Virtual Directory Number) 配置，用于智能呼叫分配。

#### Scenario: Create VDN
- **WHEN** 管理员创建 VDN
- **THEN** 系统创建虚拟号码并可关联技能组

#### Scenario: VDN Schedule
- **WHEN** 管理员配置 VDN 排班
- **THEN** 系统按时间段切换呼叫处理策略

---

### Requirement: Recording Playback (录音回放)

系统 SHALL 支持通话录音的查询和回放功能。

#### Scenario: Search Recordings
- **WHEN** 用户按条件搜索录音
- **THEN** 系统返回匹配的录音列表

#### Scenario: Play Recording
- **WHEN** 用户选择播放录音
- **THEN** 系统在浏览器中播放录音文件

---

## Technical Notes

- 前端实现位于 `/workorder_ui/src/pages/cc/`
- API 遵循 RESTful 规范，路径前缀 `/api/cc/`
- 支持分页查询和条件过滤
