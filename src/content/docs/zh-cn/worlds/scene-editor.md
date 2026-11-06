---
title: 构建场景
description: 用鼠标添加机器人、赛道、坡道和障碍物，将它们连接到你的电机和传感器，并了解场景格式。
sidebar:
  order: 2
---

用 Velxio 场景套件创建的世界（每个通过 **Create a world for
this circuit** 生成的世界，以及 [Devastator 竞技场](/docs/zh-cn/worlds/example-devastator-tank/)）
都可以用鼠标编辑。更改会保存到 `world.html` 中，因此会随项目一起移动。

![Devastator 竞技场上的场景编辑器](../../../../assets/docs/worlds/editor.png)

## 编辑模式

按世界工具栏中的 **Edit**（铅笔图标）。

- **Add** 在垫子上放置一个新对象：

  | 分组     | 对象                                                                       |
  | --------- | ----------------------------------------------------------------------------- |
  | 机器人    | Robot 2WD、Robot 4WD、Robot tank (Devastator)、Robot arm                      |
  | 赛道      | 环形、椭圆形、8 字形、直线（垫子上的黑色胶带）                        |
  | 障碍物    | 箱子、墙壁、圆柱                                                           |
  | 地形      | 坡道、桥梁、小山                                                            |

- **点击**对象以选中它并打开其属性。
- **拖动**以在垫子上移动它。**Q** 和 **E** 旋转它，**Shift** 以 15 度步进旋转，
  **Delete** 删除它。
- **Ctrl+Z** 和 **Ctrl+Y** 撤销和重做。
- **Mat settings** 设置垫子的尺寸、颜色和网格。

它在 3D 和 2D 视图中工作方式相同。再次按 Edit 返回播放模式。

## 将机器人连接到电路

机器人只使用你给它的电机来移动，只使用你给它的传感器来感知。选中机器人，然后从画布上的部件中选择：

| 字段                     | 选择什么                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Motors: Left / Right**  | 每侧一个或两个电机。一侧的速度跟随其电机的平均驱动值。                                |
| **Reverse left / right**  | 勾选某一侧，如果其"前进"对应负驱动值（其电机接线或安装方向相反）。               |
| **Line**                  | 循线传感器，从前部从左到右排列（最多五个，间距 18 mm）。                                           |
| **Sonar**                 | 前保险杠上的距离传感器（URM09、URM37 或 HC-SR04）。                                                   |
| **Sonar servo**           | 转动声纳的舵机：0 度朝右，90 度朝前，180 度朝左。                                           |
| **IMU**                   | 底盘上的 MPU6050。                                                                                         |

机械臂需要四个舵机：底座、肩部、肘部和夹爪。

## 机器人

| 预设 | 车身           | 全速驱动速度 | 爬升高度 | 类似                                   |
| ------ | -------------- | ---------------- | ------ | -------------------------------------- |
| 2WD    | 15 x 10.5 cm   | 0.55 m/s         | 1 cm   | 经典两轮套件车          |
| 4WD    | 20 x 11.5 cm   | 0.61 m/s         | 1.5 cm | 四轮滑移转向车            |
| Tank   | 22.5 x 22 cm   | 0.36 m/s         | 3 cm   | DFRobot Devastator，履带式        |

机器人会停在箱子、墙壁、圆柱和垫子边缘前，并能驶过任何不高于其爬升高度的物体。在坡道上，它们会沿斜坡行驶并随之俯仰，上坡时稍慢一些。

## 场景格式

在编辑器背后，场景是 `world.html` 中的一个 JSON 块：

```html
<!doctype html>
<html><body>
<script type="application/json" id="velxio-scene">
{ "version": 1, "view": "3d", "floor": { "w": 2.4, "h": 1.6, "grid": true },
  "objects": [
    { "id": "track1", "type": "track", "shape": "loop", "x": 0, "y": 0, "w": 2.1, "h": 0.9, "tape": 0.022 },
    { "id": "robot1", "type": "robot", "preset": "diff2", "x": -0.3, "y": -0.45, "rot": 0,
      "bind": { "left": ["motorL"], "right": ["motorR"], "line": ["lineL", "lineC", "lineR"] } },
    { "id": "box1", "type": "box", "x": 0.7, "y": 0.05, "w": 0.15, "d": 0.15, "h": 0.15, "color": "#c0392b" }
  ] }
</script>
<script>velxio.kit.start();</script>
</body></html>
```

- 单位是米和度。垫子（`floor`，`w` 乘 `h`）以原点为中心：x 向右，y 远离你，`rot` 从 +x 逆时针方向。
- 每个对象都有一个唯一的 `id`、位置 `x`、`y`，以及可选的 `rot`、`color` 和 `label`。
- `robot`：`preset` 为 `diff2`、`diff4` 或 `tank`。`bind` 包含 `left`、
  `right`（电机 id 列表）、`invertLeft`、`invertRight`、`line`（传感器
  id，从左到右）、`sonar`、`sonarServo` 和 `imu`。
- `track`：`shape` 为 `loop`、`oval`、`figure8` 或 `line`，带有 `w`、`h` 和
  `tape`（胶带宽度，0.019 到 0.025 m）。要在以原点为中心的环形赛道的胶带上启动循线机器人，将其放在底部直道上朝向 +x：`x: -0.3, y: -h/2, rot: 0`。
- `box` 和 `wall`：`w`、`d`、`h`。`cylinder`：`r`、`h`。
- `ramp`：`profile` 为 `wedge`（朝 +x 上升，然后是一个垂直面）、
  `bridge`（上、平、下）或 `hill`（一个平滑的凸起，可从任意方向通过），
  带有 `w`、`d`、`h`。声纳能检测到 3 cm 或更高的垂直面，但检测不到斜坡。
- `arm`：`bind` 包含 `base`、`shoulder`、`elbow` 和 `gripper` 舵机 id。

`bind` 中电路没有的 id 会被忽略，因此场景永远不会破坏项目。[Devastator 页面](/docs/zh-cn/worlds/example-devastator-tank/)
展示了一个完整的竞技场。
