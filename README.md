<p align="center">
  <img src="wloc.jpg" width="144" />
</p>

# Apple WLOC 定位修改

修改 Apple 网络定位服务 (WiFi/基站) 返回的坐标，实现 iOS 网络定位虚拟定位。打开在线选点页面选位置即可生效，无需手动填经纬度。

> ⚠️ **iOS 27 beta 6 起，系统已禁止对 `gs-loc.apple.com` 进行 MITM 拦截。** 目前该版本及之后的 beta 版本暂时无法使用本项目，等待后续适配方案。

---

## 订阅地址

**Surge:**
https://raw.githubusercontent.com/lingmacker/wloc/refs/heads/main/modules/wloc.sgmodule

**Quantumult X:**
https://raw.githubusercontent.com/lingmacker/wloc/refs/heads/main/modules/wloc.conf

**Loon:**
https://raw.githubusercontent.com/lingmacker/wloc/refs/heads/main/modules/wloc.lpx

**Stash:**
https://raw.githubusercontent.com/lingmacker/wloc/refs/heads/main/modules/wloc.stoverride

**Shadowrocket(小火箭):**
https://raw.githubusercontent.com/lingmacker/wloc/refs/heads/main/modules/wloc.module

> Egern 可直接使用 Surge 模块
> Stash 请直接订阅上面的 `.stoverride`，无需用 Script Hub 转换

### 默认扩展域名支持

默认模块已覆盖目前已知的完整 WLOC 域名集合：

- `gsp-ssl.ls.apple.com`
- `bluedot.is.autonavi.com`
- `bluedot.is.autonavi.com.gds.alibabadns.com`


---

## 快捷指令（推荐，最方便）

直接用快捷指令切换 / 清除定位，无需打开选点页面：

- **wloc 设置地理位置**：https://www.icloud.com/shortcuts/a82717d8fdad4e6280866fcf911173f7
- **wloc 清理恢复位置**：https://www.icloud.com/shortcuts/f42632d406504f24a2cd163af4fe012f

**用法**

- **设置位置：** 在地图 App 里选好位置（长按地图选点）→ 共享 → 选「wloc 设置地理位置」即可切换。
  - 苹果地图：选点 → 共享 → 「wloc 设置地理位置」
  - 高德地图：选点 → 分享 → **更多** → 「wloc 设置地理位置」
- **清理位置：** 点「wloc 清理恢复位置」即可恢复真实定位。

支持苹果地图、高德（含短链，自动跟跳转 + GCJ-02→WGS84 坐标换算）。

> 前提：代理已开 + 模块已启用 + 信任 `gs-loc.apple.com`。选点页面（Worker / Pages）方案仍保留，见下方。

---

### 关于地图链接解析（worker）

为了让苹果地图和高德走同一条流程，链接统一发给 `wloc-spoofer.wloc.workers.dev/api/parse` 解析：

- **高德**：分享出来是短链，真实坐标只藏在 302 跳转的 `Location` 头里，且是 GCJ-02 偏移坐标。快捷指令既读不到跳转头、也难做坐标换算，所以由 worker 跟跳转 → 抠坐标 → GCJ-02→WGS84 → 返回经纬度。
- **苹果地图**：链接里直接带 `coordinate=纬度,经度`，但在**中国大陆同样是 GCJ-02 偏移坐标**，所以和高德一样由 worker 做 GCJ-02→WGS84 换算后返回；境外坐标会自动跳过换算（`out_of_china` 判断）原样返回。除了统一坐标系，走同一接口也方便统一处理短链、文本夹链接、名称解码等。

**隐私：** `/api/parse` 是纯转发解析——收到链接 → 跟跳转 → 解析坐标 → 返回 JSON，全程不写任何存储、不记日志、不缓存，处理完即丢（`wrangler.jsonc` 里已显式关闭 observability）。跟跳转时只接受 http/https，单次请求 8 秒超时、只读响应正文前 512 KB。

**不放心可自行部署：** worker 源码完全开源，可自己部署一份替换上面的地址：

- 路由：[`worker/src/index.js`](worker/src/index.js)
- 链接解析与坐标换算：[`worker/src/parse.js`](worker/src/parse.js)
- 选点页面：[`worker/src/page.js`](worker/src/page.js)、[`worker/src/gcj-browser.js`](worker/src/gcj-browser.js)
- 部署后把快捷指令里的 `wloc-spoofer.wloc.workers.dev` 换成你自己的 worker 域名即可。

解析逻辑带一套不联网的回归测试，改动后跑一下：

```bash
cd worker && npm install && npm test
```

**坐标系说明：** 页面内部一律以 WGS84 为准。底图切到「高德」时，瓦片画的是 GCJ-02
地物，与 Leaflet 的 WGS84 像素映射差着一个偏移量（深圳一带约 600 米），页面会在
选点/落点时自动双向换算，所以在任意底图上点选得到的都是同一个 WGS84 坐标。

各家地图的坐标系不同，换算按「来源 × 地区」分派：

| 来源 | 中国大陆 | 港澳台 |
|------|----------|--------|
| 苹果地图 / Google | GCJ-02，需换算 | **WGS84，不换算** |
| 高德 / 百度 | GCJ-02 / BD-09，需换算 | 同左，仍需换算 |

**港澳台建议优先用苹果或高德的链接。** 百度在港澳台的分享短链，坐标要靠网页脚本
带反爬令牌去查，服务端取不到；变通办法是在浏览器打开该链接，等地址栏变成
`map.baidu.com/poi/名称/@数字,数字,19z` 之后复制整条地址再粘贴——但百度的针脚位置
与苹果/高德常有几十到两百米的出入（大陆约 5 米，港澳台可达 240 米），精确定位时
不建议用它。

---

<details>
<summary><b>使用方法</b></summary>

1. 订阅模块并启用 MITM
2. 打开在线选点页面（公共 Worker，建议添加到主屏幕）
3. 地图选位置 / 搜索地名 / 粘贴地图链接
4. 点击「储存到设备」
5. 下次 Apple 定位触发时自动生效

支持 Apple Maps / Google Maps / 高德 / 百度 / 坐标文本 链接解析。

> **iOS 26/27 及更高版本注意：** Apple 从 iOS 26 开始大幅强化了 `locationd` 的定位缓存机制，系统会将之前获取的真实定位结果缓存在内存中并长时间复用。这意味着安装模块或切换目标坐标后，即使脚本已成功修改了 WLOC 响应（日志显示"已修改"），系统仍可能继续使用缓存中的旧坐标，导致定位看起来没有变化。
>
> **解决方法：重启设备。** 重启会清空 `locationd` 的内存缓存，系统重新发起 WLOC 请求时会拿到修改后的坐标。飞行模式开关、关闭定位服务等方式在 iOS 26+ 上**无法**清除此缓存，必须重启。iOS 15~18 通常不需要重启即可生效。

**高版本系统推荐操作流程（成功率最高）：**

方法一：
1. 先在选点页面选好需要修改的定位并储存到设备
2. 开飞行模式 → 关闭定位服务 → 重启设备
3. 关闭飞行模式（WiFi 也要关）→ 连接代理工具（确认 VPN 图标出现）→ 打开定位服务
4. 打开地图验证

方法二：
1. 关闭定位服务
2. 在选点页面选好位置并储存到设备
3. 打开定位服务 → 弹出「允许访问位置信息」时选择**「下次询问或在我共享时」**
4. 打开地图验证

</details>

<details>
<summary><b>工作原理</b></summary>

```
选点页面 → fetch gs-loc.apple.com/wloc-settings/save?lon=x&lat=y
         → 代理模块拦截 → wloc-settings.js 写入 $persistentStore
         → 下次 WLOC 触发 → wloc.js 读取坐标 → patch protobuf 响应
```

模块包含两条规则：
- `wloc.js` — 拦截 `/clls/wloc` 响应，解析 protobuf 并替换坐标
- `wloc-settings.js` — 拦截 `/wloc-settings/save` 请求，写入持久化存储

</details>

<details>
<summary><b>参数配置</b></summary>

| 参数 | 说明 | 默认值 |
|------|------|--------|
| longitude | 目标经度(在线选点优先) | null (透传) |
| latitude | 目标纬度(在线选点优先) | null (透传) |
| accuracy | 水平精度（非负整数米） | 25 |
| altitude | 海拔（米），支持 0 和负数；留空保留 Apple 原值 | null（透传） |
| randomMode | `fixed` 固定点、`radius` 半径随机、`bounds` 经纬度范围随机；留空按 `randomRadius` 自动判断 | 自动判断 |
| randomRadius | 半径随机的最大距离（米），0=关闭 | 0 |
| minLatitude / maxLatitude | 范围随机的纬度下限 / 上限，WGS84，必须在 -90～90 之间 | null |
| minLongitude / maxLongitude | 范围随机的经度下限 / 上限，WGS84，必须在 -180～180 之间 | null |
| logLevel | 日志级别 | info |

**以页面保存的配置为准：页面写入的设备配置 > 模块参数 > 默认值。** 页面明确选择固定位置会覆盖模块中的随机设置；清空海拔再储存，会覆盖模块海拔并恢复 Apple 原值透传，而不是退回模块海拔。仅在没有相应已存配置时才使用模块参数。页面修改后需要点击「储存到设备」才会生效。

**在页面设置：** 选择目标点，填写可选海拔，再选择「固定位置」「半径随机」或「范围随机」，最后储存到设备。范围模式填写四个上下限即可，无需先点地图。查询会显示设备保存的配置；这不是 iOS 当前实际采用的位置，也不是下一次随机点的预览。

**海拔：** 默认不改写。设置后只替换已有 Location 子消息的海拔字段（field 5、int64，单位米），不新增缺失字段，垂直精度、运动状态和其它字段仍原样保留。负海拔用有符号 int64 编码，API/模块传入小数时向零截断。协议字段参考[上游定义](https://github.com/acheong08/ios-location-spoofer/blob/main/GoSpoofer/pb/BSSIDApple.pb.go)。参考项目的当前实现因兼容性选择完全透传海拔，本项目将改写做成可选项；若出现「定位不可用」，先清空海拔并重新储存。没有海拔字段的响应不会凭空产生海拔，也不保证系统最终采用所设高度。页面不自动请求第三方海拔服务。

**随机方式：**
- `fixed`：固定使用目标经纬度，即使保留了非零 `randomRadius` 也不扰动。
- `radius`：沿用原有算法，每次响应在中心点周围指定米数内随机偏移。旧配置没有 `randomMode` 时，半径大于 0 自动启用此模式。
- `bounds`：每次响应在指定 WGS84 经纬度区间内独立均匀抽样，按协议的 0.00000001° 精度取点，不叠加半径扰动。同一次响应中的 Wi-Fi 和基站共用一个随机点；下一次响应重新抽样。四边必须填写完整，最小值不能大于最大值，允许相等；不支持跨越 ±180° 经线的区间。过窄且不含可编码坐标的范围会被拒绝。范围内没有中心点时以区间中点作为配置展示坐标；抽样并非地表面积均匀，也不是连续行走轨迹。

Surge/Loon 可在模块参数中编辑；Stash/Shadowrocket 可编辑脚本 `argument`；QX 使用选点页面。所有平台都可通过下面的设置接口保存。旧配置和快捷指令无需增加新参数。

**设置接口示例**（需要已启用代理模块，不是 Worker 存储接口）：

```text
# 固定点 + 530 米海拔
https://gs-loc.apple.com/wloc-settings/save?lon=121.4737&lat=31.2304&altitude=530&randomMode=fixed

# 只给出范围；无需 lon/lat，海拔留空恢复透传
https://gs-loc.apple.com/wloc-settings/save?randomMode=bounds&minLatitude=31.22&maxLatitude=31.24&minLongitude=121.46&maxLongitude=121.49&altitude=

# 恢复固定点、停止随机，并清除海拔覆盖
https://gs-loc.apple.com/wloc-settings/save?lon=121.4737&lat=31.2304&randomMode=fixed&altitude=

# 查询完整配置 / 清除所有已保存配置
https://gs-loc.apple.com/wloc-settings/save?action=query
https://gs-loc.apple.com/wloc-settings/save?action=clear
```

保存时省略可选参数会保留已存值，`altitude=` 明确清空海拔覆盖；切换回固定点请传 `randomMode=fixed`。只更新旧参数 `randomRadius` 且不传模式时，会按新半径重新判断固定/半径模式。非法数字、越界或不完整范围返回 `success:false`，不会覆盖原配置。经纬度为 0 是有效坐标。

</details>

<details>
<summary><b>取消虚拟定位 / 恢复真实定位</b></summary>

**方法一：关闭或删除模块**（推荐）

关闭模块后脚本不再拦截 WLOC 请求，系统自动恢复真实定位。iOS 26+ 需要重启设备清除定位缓存。

**方法二：清除持久化数据（透传模式）**

清除已保存的坐标后，脚本进入**透传模式**——不修改 WLOC 响应，直接放行原始数据，系统自动恢复真实 GPS 定位。

**透传模式触发条件：** 持久化数据为空（null）且模块参数为默认值（113.94114, 22.544577）、没有启用 `bounds` 范围随机时，脚本判定用户未自定义坐标，自动跳过修改。

在代理工具中删除持久化数据，字段名为 `wloc_settings`：

- **Surge** — 脚本编辑器运行: `$persistentStore.write(null, "wloc_settings")`
- **Quantumult X** — 运行: `$prefs.removeValueForKey("wloc_settings")`
- **Loon** — 运行: `$persistentStore.write(null, "wloc_settings")`

清除后重启设备即可恢复真实定位。无需关闭模块，脚本会自动检测到无自定义坐标并跳过修改。

> **注意：** 如果在模块参数中手动修改了经纬度，或配置了 `randomMode=bounds` 和有效范围，即使清除持久化数据，脚本仍会使用模块配置。要完全恢复真实定位，应关闭模块，或同时恢复默认经纬度并关闭范围随机。

</details>

<details>
<summary><b>收藏位置功能</b></summary>

在线选点页面支持收藏多个位置，方便来回切换：

- **添加收藏**：选好位置后点击「收藏位置」→ 输入备注名称（支持中文/英文/数字，最多 30 字）→ 保存
- **快速切换**：点击收藏列表中的位置 → 地图自动跳转 → 点「储存到设备」即可切换
- **当前生效标记**：与设备已保存坐标一致的收藏会显示「✓ 当前生效」
- **删除管理**：单个删除（×按钮）或清空全部
- **当前生效坐标**：页面显示设备端持久化数据（wloc_settings），支持刷新查询和清除

**数据存储说明：**
- **收藏列表** → 保存在浏览器 `localStorage`（仅用于选点页面的 UI 便捷操作）
- **生效坐标** → 保存在代理工具持久化存储 `$persistentStore`（脚本运行时实际读取的数据）

两者独立存储。收藏列表是浏览器端的辅助数据，清除浏览器缓存或换浏览器后需重新收藏，但不影响已储存到设备的生效坐标。

海拔和随机范围属于设备配置，不随收藏位置一起保存。点击收藏只切换选点，不会自动清空这些配置；储存前请检查随机方式及海拔。

</details>

<details>
<summary><b>自部署 Worker（推荐）</b></summary>

公共选点页面有请求上限，建议部署自己的实例：

- **Workers**: `https://wloc-spoofer.wloc.workers.dev/`
- **Pages**: `https://wloc-pages.pages.dev/`

**一键部署（Workers）：**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lingmacker/wloc/tree/main/worker)

> 一键部署仅支持 Workers 模式，点击按钮后按提示授权即可完成部署。

**手动部署（Workers）：**

```bash
# 1. 克隆仓库
git clone https://github.com/lingmacker/wloc.git
cd wloc/worker

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare（首次需要）
npx wrangler login

# 4. 部署
npm run deploy
```

部署成功后会得到你自己的 Worker 地址（如 `https://wloc-spoofer.<你的子域名>.workers.dev`），用这个地址选点即可。

> 免费账户每天 10 万次请求，个人使用完全够用。

<details>
<summary>高级：Pages 部署</summary>

Pages 部署不支持一键按钮，需要手动执行：

```bash
git clone https://github.com/lingmacker/wloc.git
cd wloc/worker
npm install
npm run pages:deploy
```

> 必须走 `npm run pages:deploy`（它带 `-c wrangler.pages.jsonc`）。直接跑
> `wrangler pages deploy dist` 会丢掉配置里的 compatibility 设定。

部署时会提示设置 production branch，输入 `main` 即可。部署成功后得到 `https://<项目名>.pages.dev` 地址。

Pages 和 Workers 功能完全一致，按需选择即可。

</details>

</details>

<details>
<summary><b>注意事项</b></summary>

- 需要 MITM 证书信任 `gs-loc.apple.com` 和 `gs-loc-cn.apple.com`
- 仅修改网络定位(WiFi/基站)，不影响 GPS 硬件定位
- iOS 在 GPS 信号强时可能忽略网络定位结果
- 适用于 WiFi 定位为主的室内场景效果最佳
- 选点页面需在代理模式下使用（Safari 走代理才能拦截储存请求）

</details>

---

## 源码与构建

- `src/location-settings.js`：共享配置校验、海拔规范化和随机坐标选择。
- `src/wloc.js` / `src/wloc-settings.js`：响应改写与设备设置 API。
- `worker/src/page.js`：页面中的海拔、随机方式与经纬度范围配置。
- `dist/`：模块实际加载的独立脚本；修改 `src/` 后必须重新构建，不能直接把含 `import` 的源文件填入代理模块。

在仓库根目录运行：

```bash
npm ci
npm run build
npm test
```

构建会把共享逻辑打包进两个 `dist` 脚本，运行时不需要 npm 依赖。测试覆盖协议字段保留、负/零海拔、范围抽样边界、页面配置优先级、设置读写和原有地图解析。更新页面后还需重新部署自己的 Worker / Pages；本地修改不会自动更新公共选点站点。

---

## 致谢

- [proxypin-wloc-spoofer](https://github.com/FFF686868/proxypin-wloc-spoofer) - 原始 WLOC 定位修改思路 by FFF686868
- [NSNanoCat/Util](https://github.com/NSNanoCat/util) - 跨平台脚本工具框架

### 贡献者

- [@YmlyZA](https://github.com/YmlyZA) - 百度地图支持、港澳台边界处理、GCJ 换算优化、回归测试覆盖 ([#83](https://github.com/lingmacker/wloc/pull/83))
- [@YeTianXingShi](https://github.com/YeTianXingShi) - randomRadius 随机坐标扰动功能原始实现 ([#70](https://github.com/lingmacker/wloc/pull/70))
- [@SajoLuo](https://github.com/SajoLuo) - Stash 响应格式修复 ([#66](https://github.com/lingmacker/wloc/pull/66))
- [@SkywardLab](https://github.com/SkywardLab) - 扩展 WLOC 备用域名拦截 ([#90](https://github.com/lingmacker/wloc/pull/90))
- [@beiming0000](https://github.com/beiming0000) - 逗号小数格式坐标丢失问题报告 ([#96](https://github.com/lingmacker/wloc/issues/96))

---

## 许可证

本项目采用 [AGPL-3.0](LICENSE) 许可证。未经授权，禁止将本项目代码用于商业产品或上架应用商店。
