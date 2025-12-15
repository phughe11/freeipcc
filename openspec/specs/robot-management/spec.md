# Robot Management (机器人管理)

## Purpose

AI 机器人的配置和知识库管理模块，支持智能客服机器人的全生命周期管理。包括知识库创建和维护、机器人实例配置、知识库关联分配等功能，为自动化客户服务提供智能问答能力支撑。

## Requirements

### Requirement: Knowledge Base Management (知识库管理)

系统 SHALL 支持 AI 机器人知识库的管理。

#### Scenario: Create Knowledge Base
- **WHEN** 管理员创建知识库
- **THEN** 系统创建知识库容器

#### Scenario: Add Knowledge Entry
- **WHEN** 管理员添加知识条目
- **THEN** 条目被索引并可被机器人使用

#### Scenario: Update Knowledge
- **WHEN** 管理员更新知识内容
- **THEN** 系统重新索引更新的内容

#### Scenario: Delete Knowledge
- **WHEN** 管理员删除知识条目
- **THEN** 条目从知识库移除

---

### Requirement: Robot Instance Management (机器人实例管理)

系统 SHALL 支持机器人实例的配置和管理。

#### Scenario: Create Robot
- **WHEN** 管理员创建机器人
- **THEN** 系统创建机器人实例

#### Scenario: Configure Robot
- **WHEN** 管理员配置机器人参数
- **THEN** 系统保存配置

#### Scenario: Assign Knowledge Base
- **WHEN** 管理员为机器人分配知识库
- **THEN** 机器人可访问知识库内容

#### Scenario: Enable/Disable Robot
- **WHEN** 管理员启用/禁用机器人
- **THEN** 机器人开始/停止接收请求

---

## Technical Notes

- 前端位于 `/workorder_ui/src/pages/robot/`
- 子模块:
  - `knowledge/` - 知识库管理
  - `rbtsmanager/` - 机器人实例管理
- 组件结构遵循 Ant Design Pro 规范
