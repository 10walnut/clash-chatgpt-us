# Clash ChatGPT US 分流

让 ChatGPT / OpenAI 相关流量固定使用美国节点，同时保留机场订阅原有的节点、策略组和规则。

仓库包含两种客户端适配：

- `clash-for-windows/chatgpt-us-parser.yaml`：Clash for Windows 配置文件预处理。
- `clashmi/chatgpt-us-override.js`：ClashMi JavaScript 覆写。

## 功能

- 从订阅的 `proxies:` 中动态识别美国节点。
- 自动创建 `🇺🇸 美国自动选择` 和 `🤖 ChatGPT-US`。
- 将 ChatGPT / OpenAI 规则插入原规则最前面。
- 不给 ChatGPT-US 添加 `DIRECT` 或非美国回退，避免美国线路失效时发生地区泄漏。
- 将 `🤖 ChatGPT-US` 加到名称含“节点选择、选择线路、代理选择、线路选择、手动选择/切换”的主选择组中。
- 更新在线订阅后自动重新处理，不需要手动维护节点列表。

## 美国节点识别规则

节点名称包含以下任一标识时会被识别：

- `🇺🇸`
- `美国` 或 `美國`
- `US`
- `USA`
- `United States`

脚本判断的是节点名称，不会查询节点真实 IP。如果美国节点使用“高速线路 A”之类不含国家标识的名称，脚本不会识别。

## Clash for Windows

1. 打开 `Settings → Profiles → Parsers → Edit`。
2. 复制 `clash-for-windows/chatgpt-us-parser.yaml` 的全部内容并保存。
3. 回到 `Profiles`，更新一次订阅。
4. 保持 `Rule / 规则` 模式。
5. 在 `🤖 ChatGPT-US` 中选择 `🇺🇸 美国自动选择`。

文件默认使用：

```yaml
reg: ^.*$
```

这会处理所有订阅。如果只想处理一个订阅，把 `reg` 换成对应订阅 URL，例如：

```yaml
url: https://example.com/subscription
```

### 其他网站是否也走美国

- 只让 ChatGPT 走美国：保持原来的“节点选择/选择线路”不变。
- 让其他原本走主代理组的网站也走美国：在原来的“节点选择/选择线路”中选择 `🤖 ChatGPT-US`。

## ClashMi

建议使用支持 JavaScript 覆写的较新版本。

1. 打开 `核心设置 → 覆写`。
2. 点击右上角 `+`。
3. 导入 `clashmi/chatgpt-us-override.js`，类型选择 `JS`；也可以复制文件全文，新建 JS 覆写后粘贴。
4. 名称可设为 `ChatGPT-US`。
5. 如果界面显示“追加-覆写 / 内置-覆写”，选择 `内置-覆写`。
6. 回到“配置”，点击机场订阅右侧三个点，选择“编辑配置”。
7. 在“核心覆写”中选择刚添加的 `ChatGPT-US` 并保存。
8. 更新订阅，断开后重新连接。
9. 保持“规则”模式，在 `🤖 ChatGPT-US` 中选择 `🇺🇸 美国自动选择`。

Clash for Windows 的 `parsers:` 文件不能直接用于 ClashMi；ClashMi 必须使用本仓库中的 JS 覆写文件。

## 更新订阅

只要预处理/覆写仍然启用，每次更新订阅都会：

1. 读取最新节点；
2. 重新筛选美国节点；
3. 重建两个策略组；
4. 把 ChatGPT 规则放到原规则前面。

如果没有识别到美国节点，脚本会保留原配置，不创建错误的 ChatGPT-US 组。

## 注意事项

- 必须使用“规则”模式；全局或直连模式不会按这些域名规则分流。
- 当前实现处理直接位于 `proxies:` 的节点。仅使用 `proxy-providers:` 且没有展开到 `proxies:` 的配置可能无法识别。
- ChatGPT 语音可能使用直接 IP/UDP 流量，本仓库主要覆盖网页、登录、API、文件上传和相关静态资源。
- 自动测速成功只代表测试 URL 可达，不保证某节点一定可以访问 ChatGPT；如遇问题可在 `🤖 ChatGPT-US` 中手动选择另一条美国节点。
- 请勿把含有订阅地址、节点密码或私人服务器信息的完整配置提交到公开仓库。

## 验证

连接 ChatGPT 后，可在客户端“连接”页面查看 `chatgpt.com`、`openai.com` 或 `oaiusercontent.com` 是否命中：

```text
🤖 ChatGPT-US → 🇺🇸 美国自动选择 → 某个美国节点
```

## 免责声明

本项目仅修改本地代理客户端的分流策略，不提供代理节点或订阅服务。请遵守所在地法律法规及所使用服务的条款。
