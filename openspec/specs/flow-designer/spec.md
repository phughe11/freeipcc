# Flow Designer (流程设计器)

## Purpose

可视化流程设计工具，为 IVR 交互式语音应答流程和业务流程提供图形化配置能力。支持拖拽式流程编排、节点属性配置、流程版本管理和部署发布，让业务人员无需编码即可完成复杂流程设计。

## Requirements

### Requirement: IVR Flow Design (IVR 流程设计)

系统 SHALL 提供基于拖拽的 IVR 流程设计器。

#### Scenario: Create New Flow
- **WHEN** 用户创建新的 IVR 流程
- **THEN** 系统显示空白画布和节点面板

#### Scenario: Drag and Drop Node
- **WHEN** 用户从节点面板拖拽节点到画布
- **THEN** 节点添加到画布并可配置

#### Scenario: Connect Nodes
- **WHEN** 用户连接两个节点的端口
- **THEN** 系统创建流程连线表示执行顺序

#### Scenario: Configure Node Properties
- **WHEN** 用户选中节点
- **THEN** 系统在侧边栏显示节点配置表单

#### Scenario: Save Flow
- **WHEN** 用户保存流程
- **THEN** 系统持久化流程定义到后端

---

### Requirement: Flow Canvas Operations (画布操作)

系统 SHALL 支持画布的缩放、平移和快捷操作。

#### Scenario: Zoom Canvas
- **WHEN** 用户使用缩放工具
- **THEN** 画布按比例缩放显示

#### Scenario: Canvas Snapline
- **WHEN** 用户移动节点
- **THEN** 系统显示对齐辅助线

#### Scenario: Context Menu
- **WHEN** 用户右键点击画布或节点
- **THEN** 系统显示上下文操作菜单

---

### Requirement: Flow Management (流程管理)

系统 SHALL 支持流程的版本管理和部署。

#### Scenario: List Flows
- **WHEN** 用户访问流程管理页面
- **THEN** 系统显示所有流程及其状态

#### Scenario: Deploy Flow
- **WHEN** 用户部署流程
- **THEN** 流程生效并可被呼叫触发

---

## Technical Notes

- 基于 @antv/xflow 实现可视化流程设计
- 前端位于 `/workorder_ui/src/pages/flow/ivr/`
- 配置模块:
  - `config-graph.tsx` - 画布配置
  - `config-cmd.ts` - 命令配置
  - `config-dnd-panel.tsx` - 拖拽面板
  - `config-form.tsx` - 表单配置
  - `config-toolbar.tsx` - 工具栏配置
  - `config-menu.ts` - 菜单配置
  - `config-keybinding.ts` - 快捷键配置
