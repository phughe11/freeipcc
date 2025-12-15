# AI Chat (AI 聊天)

## Purpose

基于大语言模型的智能聊天功能模块，为客户服务场景提供实时对话能力。支持用户端与 AI 或人工坐席的交互，以及坐席端的会话工作台管理，实现多渠道统一的在线客服体验。

## Requirements

### Requirement: User Chat Interface (用户聊天界面)

系统 SHALL 提供面向最终用户的聊天界面，支持与 AI 或人工坐席对话。

#### Scenario: Start Chat Session
- **WHEN** 用户访问聊天页面
- **THEN** 系统显示欢迎消息并准备接收用户输入

#### Scenario: Send Message
- **WHEN** 用户发送消息
- **THEN** 系统显示用户消息并等待响应

#### Scenario: Receive AI Response
- **WHEN** AI 处理完用户消息
- **THEN** 系统显示 AI 回复内容

---

### Requirement: Agent Chat Interface (坐席聊天界面)

系统 SHALL 提供面向客服坐席的聊天工作台。

#### Scenario: View Active Sessions
- **WHEN** 坐席登录系统
- **THEN** 系统显示分配给该坐席的活跃会话列表

#### Scenario: Agent Reply
- **WHEN** 坐席回复用户消息
- **THEN** 消息实时发送给用户

#### Scenario: Use Quick Reply
- **WHEN** 坐席选择快捷回复模板
- **THEN** 系统填充模板内容到输入框

---

### Requirement: Message Components (消息组件)

系统 SHALL 提供可复用的消息展示组件。

#### Scenario: Sender Message Display
- **WHEN** 渲染发送方消息
- **THEN** 显示用户头像、消息内容和时间戳

#### Scenario: Receiver Message Display
- **WHEN** 渲染接收方消息
- **THEN** 显示客服/AI 头像、消息内容和时间戳

---

## Technical Notes

- 前端位于 `/workorder_ui/src/pages/AiChat/`
- 组件结构: `components/SenderItem`, `components/ReceiverItem`
- 使用 Ant Design 的 AutoComplete 实现智能提示
- 样式使用 CSS Modules (`.less` 文件)
