# GPT Chat Flow (GPT 聊天流)

## Purpose

基于 Flowise 和 LangChain 的 AI 聊天流程配置和执行引擎，实现大模型能力的灵活集成。支持聊天流管理、流式响应、向量存储、凭证管理等功能，为智能客服提供可配置的 AI 对话能力。

## Requirements

### Requirement: Chatflow Management (聊天流管理)

系统 SHALL 支持 AI 聊天流程的创建和管理。

#### Scenario: List Chatflows
- **WHEN** 用户访问聊天流列表
- **THEN** 系统显示所有配置的聊天流

#### Scenario: Create Chatflow
- **WHEN** 用户创建新的聊天流
- **THEN** 系统保存聊天流配置

#### Scenario: Update Chatflow
- **WHEN** 用户修改聊天流配置
- **THEN** 系统更新并重新加载

#### Scenario: Delete Chatflow
- **WHEN** 用户删除聊天流
- **THEN** 系统移除该聊天流

---

### Requirement: Chatflow Streaming (流式响应)

系统 SHALL 支持 AI 响应的流式输出。

#### Scenario: Check Streaming Support
- **WHEN** 系统检查聊天流是否支持流式
- **THEN** 返回流式支持状态

#### Scenario: Stream Response
- **WHEN** 配置为流式响应
- **THEN** AI 响应逐字显示给用户

---

### Requirement: AI Prediction (AI 预测)

系统 SHALL 支持基于聊天流的 AI 预测。

#### Scenario: Send Prediction Request
- **WHEN** 用户发送消息
- **THEN** 系统调用 AI 进行预测

#### Scenario: Get Prediction Result
- **WHEN** AI 完成预测
- **THEN** 系统返回预测结果

---

### Requirement: Vector Store Integration (向量存储集成)

系统 SHALL 支持向量数据库用于语义搜索。

#### Scenario: Store Vectors
- **WHEN** 知识库文档被索引
- **THEN** 系统将文档向量化并存储

#### Scenario: Semantic Search
- **WHEN** 用户查询
- **THEN** 系统执行向量相似度搜索

---

### Requirement: Credentials Management (凭证管理)

系统 SHALL 安全管理 AI 服务凭证。

#### Scenario: Add Credentials
- **WHEN** 管理员添加 API 凭证
- **THEN** 系统加密存储凭证

#### Scenario: Use Credentials
- **WHEN** 聊天流调用 AI 服务
- **THEN** 系统安全使用存储的凭证

---

### Requirement: Custom Nodes (自定义节点)

系统 SHALL 支持 LangChain 自定义节点扩展。

#### Scenario: Redis Cache Node
- **WHEN** 配置 Redis 缓存节点
- **THEN** AI 响应可被缓存以提高性能

---

## Technical Notes

### API 端点
- `GET /api/v1/chatflows` - 获取所有聊天流
- `GET /api/v1/chatflows/:id` - 获取特定聊天流
- `POST /api/v1/chatflows` - 创建聊天流
- `PUT /api/v1/chatflows/:id` - 更新聊天流
- `DELETE /api/v1/chatflows/:id` - 删除聊天流
- `GET /api/v1/chatflows-streaming/:id` - 检查流式支持
- `GET /api/v1/public-chatflows/:id` - 公开端点

### 前端位置
- API 客户端: `/workorder_ui/src/api/`
- 节点配置: `/workorder_ui/src/pages/gptchat/nodes/`

### 集成
- Flowise 嵌入: `flowise-embed`, `flowise-embed-react`
- LangChain: `langchain@^0.0.212`
- Redis 缓存: `langchain/cache/ioredis`

### 配置
- Base URL: 开发环境使用 3000 端口，生产环境同源
- 认证: 基于 localStorage 的 Basic Auth
