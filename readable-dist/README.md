# 可读编译产物

这里保存 `dist/` 中两个发布脚本的格式化副本，用于审计和理解行为。

- `wloc.js`：预处理 WLOC 请求、读取目标设置、解压 WLOC 响应、扫描 protobuf、改写 Wi-Fi/基站位置并返回响应。
- `wloc-settings.js`：处理 `save`、`query`、`clear` 三种设置请求，并读写 `wloc_settings`。
- `dist/` 仍是实际发布文件，不应直接手工维护。

## 可确认的压缩符号

两个文件开头的主要符号来自同一套跨平台代理脚本运行时：

- `e`：当前运行环境名称。
- `t`：日志工具。
- `a`：对象路径与合并工具。
- `r`（`wloc.js`）/`s`（设置脚本）：查询参数解析工具。
- `o`（`wloc.js`）/`c`（设置脚本）：跨平台持久化存储适配器。
- `i`（`wloc.js`）/`o`（设置脚本）：跨平台完成响应的适配函数。

## wloc.js 核心函数映射

- `Ae`：读取 protobuf varint。
- `$e`：编码 protobuf varint。
- `Se`：拼接字节数组。
- `Re`：解析一层 protobuf 字段。
- `Te`：编码单个 protobuf 字段。
- `Oe`：改写位置消息的纬度、经度和精度。
- `Ne`：识别并改写 Wi-Fi 记录。
- `je`：改写基站记录。
- `Le`：遍历 WLOC protobuf 顶层消息。
- `Ue`：处理带长度前缀的 WLOC 数据帧。
- `tryParseArpcEnvelope` / `tryPatchArpcEnvelope`：优先识别并重建结构化 ARPC 封包。
- `Ie`：依次尝试 ARPC、多个帧偏移，并在必要时回退为原始 protobuf 扫描。
- `Me`：检测 gzip。
- `prepareWlocRequest`：保留原请求头并将 `Accept-Encoding` 设为 `identity`。
- `De`：执行完整响应改写流程。
- `Pe`：合并模块参数和持久化设置，决定改写或透传。
- `resolveLocationState`：根据路线、速度和请求时间计算一次一致的位置状态。
- `rewriteWlocResponse`：完整响应的公共改写边界，静态定位和路线模拟共用。

模块覆盖 Apple 的 `gs-loc(-cn).apple.com` 与高德承载的 `bluedot.is.autonavi.com`（含 Alibaba DNS 别名）。Quantumult X 分支使用 `$prefs` 和 `bodyBytes` 完成请求预处理与二进制响应输出。

## 路线状态

- `pending`：路线开始时间尚未到达。
- `running`：根据经过时间持续前进。
- `paused`：冻结在暂停时刻，继续时平移开始时间保持进度连续。
- `stopped`：冻结在停止时刻。
- `completed`：非循环路线停在终点。

步行、骑行和驾车档案仅设置默认速度与水平精度，不自动写入语义尚未确认的 protobuf 运动枚举。

## 安全诊断

- `diagnosticMode=rewrite`：正常改写并输出封包类型、前后长度和计数摘要。
- `diagnosticMode=inspect`：只解析不改写，返回压缩状态、长度、根字段直方图和位置计数。
- `diagnosticOutput=both|headers|logs`：选择摘要输出到响应头、日志或两者。旧参数 `diagnostics`、`inspectMode` 仍兼容。
- 不输出原始字节、Base64、BSSID 或基站标识。

## 注意

格式化只能恢复代码结构，无法恢复构建前的原始变量名、模块边界、注释或源码文件划分。这里没有声称这些文件是原始源码；它们与当前编译产物保持语法行为等价。

发布文件使用 Terser 从可读版本生成：

```sh
npx --yes terser readable-dist/wloc.js --compress --mangle --comments '/^!|Build/' --ecma 2022 --output dist/wloc.js
npx --yes terser readable-dist/wloc-settings.js --compress --mangle --comments '/^!|Build/' --ecma 2022 --output dist/wloc-settings.js
```
