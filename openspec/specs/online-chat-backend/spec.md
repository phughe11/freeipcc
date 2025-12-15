# Online Chat Backend (在线客服后端)

## Purpose

基于 Java 技术栈的在线客服后端服务，作为 IM 在线客服系统的核心引擎。提供坐席状态管理、会话队列分配、实时消息路由、快捷回复模板等功能，通过 Netty 实现高性能的实时通信能力。

## Requirements

### Requirement: Agent Status Management (坐席状态管理)

系统 SHALL 支持坐席工作状态的实时管理。

#### Scenario: Agent Login
- **WHEN** 坐席登录系统
- **THEN** 系统记录坐席在线状态

#### Scenario: Change Agent Status
- **WHEN** 坐席切换状态（空闲/忙碌/离开）
- **THEN** 系统更新状态并影响呼叫分配

#### Scenario: Agent Logout
- **WHEN** 坐席登出
- **THEN** 系统标记坐席离线并重新分配会话

---

### Requirement: Session Queue Management (会话队列管理)

系统 SHALL 实现智能的会话排队和分配机制。

#### Scenario: Customer Queuing
- **WHEN** 客户发起会话且无空闲坐席
- **THEN** 系统将客户加入等待队列

#### Scenario: Session Assignment
- **WHEN** 有空闲坐席时
- **THEN** 系统按规则分配队列中的会话

#### Scenario: Queue Priority
- **WHEN** 配置了优先级规则
- **THEN** 高优先级客户优先获得服务

---

### Requirement: Chat Message Handling (聊天消息处理)

系统 SHALL 支持聊天消息的发送、接收和持久化。

#### Scenario: Send Message
- **WHEN** 用户或坐席发送消息
- **THEN** 消息通过 Netty 实时传递给对方

#### Scenario: Message Persistence
- **WHEN** 消息发送成功
- **THEN** 系统将消息存储到数据库

#### Scenario: Load Message History
- **WHEN** 用户或坐席查看历史消息
- **THEN** 系统返回分页的消息记录

---

### Requirement: Quick Reply Templates (快捷回复模板)

系统 SHALL 支持预定义的快捷回复模板管理。

#### Scenario: Create Quick Reply
- **WHEN** 管理员创建快捷回复
- **THEN** 模板保存并可被坐席使用

#### Scenario: Categorize Quick Replies
- **WHEN** 管理员创建回复分类
- **THEN** 快捷回复按类别组织

#### Scenario: Use Quick Reply
- **WHEN** 坐席选择快捷回复
- **THEN** 模板内容插入到消息输入

---

### Requirement: Message Routing (消息路由)

系统 SHALL 支持灵活的消息路由机制。

#### Scenario: Route Inbound Message
- **WHEN** 收到入站消息
- **THEN** 路由器将消息转发给目标坐席

#### Scenario: Route Outbound Message
- **WHEN** 坐席发送消息
- **THEN** 路由器将消息转发给目标用户

---

### Requirement: Online User Tracking (在线用户追踪)

系统 SHALL 追踪在线用户状态和信息。

#### Scenario: Track User Online
- **WHEN** 用户连接到系统
- **THEN** 系统记录用户在线状态和信息

#### Scenario: Track User Offline
- **WHEN** 用户断开连接
- **THEN** 系统更新用户离线状态

---

## Technical Notes

### 技术架构
- **框架**: Struts 2 + Spring + Hibernate
- **通信**: Netty (NettyIMClient, NettyAgentClient)
- **缓存**: Memcached (SystemCache)

### 包结构
```
com.sxx.jcc.webim/
├── action/          # Struts Actions
├── pojo/            # 业务实体
├── service/         # 业务服务层
├── queue/           # 排队机制
├── rpc/             # RPC 调用
└── util/            # 工具类
    └── router/      # 消息路由器
```

### 核心类
- `AgentController` - 坐席操作控制器 (693 行)
- `AgentStatus` - 坐席状态实体
- `ChatMessage` - 聊天消息实体
- `ServiceQuene` - 服务队列
- `MessageRouter` - 消息路由器
- `NettyIMClient` - Netty IM 客户端
