# 嘟嘟的 3D 直播间（原型）

一个用浏览器实时渲染的 3D 虚拟直播间原型：暖色调的客厅场景、一只漂浮在客厅中央的卡通鲸鱼主播，以及叠加在画面上的点歌台、礼物榜、收支账单和实时字幕条。

全部跑在 Web 端，不依赖引擎导出包。首屏加载 3 个 glTF 模型（约 8.8 MB），主播和其余家具、场景都是代码拼出来的几何体。

![预览](preview.png)

![技术栈：React Three Fiber](https://img.shields.io/badge/three.js-r180-blue) ![React](https://img.shields.io/badge/React-19-61dafb)

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 构建 | Vite 7 + TypeScript | 开发态 HMR，生产构建产物 gzip 后约 600 KB |
| 渲染 | Three.js + React Three Fiber + drei | 场景树用 JSX 描述，灯光/材质可直接改 props |
| 状态 | Zustand | 单 store 承载直播房间状态 |
| UI | 原生 HTML/CSS 浮层 | 卡片不进 3D 场景，用绝对定位盖在 canvas 上 |
| 模型 | glTF/GLB | 三个 Khronos 官方示例模型 |

没有用 Unity WebGL 或 Unreal 像素流：这个场景是静态室内 + 单角色，Web 原生渲染的包体和迭代速度都更划算。

## 快速开始

要求 Node ≥ 20。

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
npm run preview
```

## 目录结构

```
public/models/          沙发 / 绿植 / 狐狸
src/App.tsx             画布配置、相机、色调映射、事件循环
src/scene/Scene.tsx     房间、家具、灯光、相机漂移
src/scene/WhaleMascot.tsx 卡通鲸鱼主播（漂浮 / 摆尾 / 眨眼 / 口型）
src/scene/Asset.tsx     glTF 加载与包围盒归一化工具
src/scene/Fox.tsx       带骨骼动画的小狐狸
src/ui/Overlay.tsx      四块 HTML 浮层
src/data/live.ts        直播状态的模拟事件源
src/styles.css          全部界面样式
```

## 场景是怎么搭的

**房间与家具**：墙面、地板、门、厨房、相框、茶几、地毯、抱枕全部用 `RoundedBox` 和基础几何体拼成。地板接缝用细长条叠加，避免额外贴图。

**角色**：`WhaleMascot.tsx` 用球体、椭球和基础几何体拼出一只卡通鲸鱼：蓝色身体 + 白色脸膛、大眼白配深色瞳孔和高光、腮红、胸鳍、尾鳍，头顶还有喷气孔。动作全部在 `useFrame` 里实时计算，没有骨骼也不需要任何动画文件：

- 漂浮：整体上下正弦浮动，同时带一点侧倾和左右摆头
- 摆尾：尾鳍组绕 Y 轴摆动
- 眨眼：每 2–5 秒把眼睛组的 `scale.y` 压到 0.08，保持 0.1 秒
- 口型：`speaking` 为真时嘴的 `scale.y` 在 0.028–0.055 之间脉动，整只鲸同时做轻微挤压
- 吐泡泡：7 个半透明球体循环上浮、变大、淡出

拼装时最容易踩的坑是「脸被肚皮挡住」：白色脸膛是个独立的椭球，如果比头部椭球靠前，就会盖住眼睛和嘴。这里把它压到 `z = 0.03`、半径 0.52，五官再放到 0.4–0.53 之间，保证浮在脸膛表面外面。

**开源模型**：`Asset.tsx` 会读模型的包围盒，按目标尺寸等比缩放、水平居中、底面贴地，所以不用关心每个模型的单位和原点。沙发加载后按网格名把 `fabric` 材质重染成暖米色，并关掉模型自带的 `Key Light`，统一由场景灯光负责照明。

**光照**：一盏带阴影的暖色主光 + 一盏冷调补光 + 半球光，再用 drei 的 `Lightformer` 造一个低成本环境反射。这样能接近参考图里那种柔和的室内光，同时不用开实时全局光照。

**浮层**：canvas 铺满视口，四张卡片用 `position: absolute` 定位，毛玻璃、圆角、进度条全部走 CSS。这是这套方案最重要的取舍——UI 不进 3D，排版和交互成本直接降到普通前端水平。

## 接入真实数据

`src/data/live.ts` 里目前是一个 `setInterval` 驱动的模拟器，每 1.2 秒跑一次 `tick`：随机产生礼物、推进播放进度、换歌曲、换字幕。

换成真实后端时保留 store 结构，把 `tick` 替换成 WebSocket 消息处理即可：

```ts
socket.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.type === 'gift') useLive.getState().onGift(msg.payload)
  if (msg.type === 'subtitle') useLive.getState().setSpeech(msg.text)
}
```

口型驱动也留了接口：`speaking` 布尔值接 TTS 的播放状态，如果要更精细，可以把音素的振幅或 viseme 直接映射到嘴的 `scale.y`。

## 模型与授权

| 文件 | 来源 | 授权 |
|---|---|---|
| `Sofa.glb` | Khronos glTF Sample Assets, *GlamVelvetSofa* | CC BY 4.0 |
| `Plant.glb` | Khronos glTF Sample Assets | CC BY 4.0 |
| `Fox.glb` | Khronos glTF Sample Assets | CC BY 4.0 |

署名信息同时显示在页面右下角。用于商业项目时请保留该署名，或替换为自有模型。

## 已知限制

- 没有做资源预加载和按需加载，场景在弱网下会先出现空白再整体出现
- 主播是程序化几何体，没有骨骼，动作靠正弦曲线驱动；要接动作库或动捕需要换成 VRM/带骨骼的模型
- 移动端尚未专门优化，中低端设备的像素比和阴影配置需要下调
- 狐狸模型的 `Survey` 动画只做了淡入播放，没有和玩家交互联动
- 光照未烘焙，如果要接近参考图的质感，建议在 Blender 里烘 lightmap 后替换实时阴影

## 下一步

- [ ] 把模拟数据换成真实 WebSocket 房间服务
- [ ] 接入 TTS，用 viseme 驱动口型
- [ ] 沙发/背景做 lightmap 烘焙，降低移动端开销
- [ ] 增加礼物特效（粒子、飘屏）
- [ ] 角色换装与表情状态机
