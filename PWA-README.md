# 俄罗斯方块游戏 PWA 配置指南

本指南将帮助你将俄罗斯方块游戏配置为渐进式Web应用(PWA)，使其可以在iPad和其他设备上像原生应用一样安装和使用，支持离线访问。

## 已完成的配置

目前已经完成了以下PWA基础配置：

1. 创建了`manifest.json`文件，定义了应用的名称、图标和显示方式
2. 创建了`sw.js` Service Worker文件，用于资源缓存和离线访问
3. 在`index.html`中添加了必要的PWA相关元标签
4. 创建了基础SVG图标文件

## 生成图标

要完成PWA配置，你需要生成多种尺寸的图标。以下是两种方法：

### 方法1：使用在线工具

1. 访问 [Real Favicon Generator](https://realfavicongenerator.net/)
2. 上传`icons/tetris-icon.svg`文件
3. 按照网站指引配置各种平台的图标
4. 下载生成的图标包
5. 将图标文件放入`icons`文件夹

### 方法2：使用PWA Asset Generator工具

如果你有Node.js环境，可以使用命令行工具：

```bash
# 安装工具
npm install -g pwa-asset-generator

# 生成图标
pwa-asset-generator icons/tetris-icon.svg icons --background "#121212" --manifest manifest.json --index index.html
```

## 在iPad上安装

完成上述配置后，按照以下步骤在iPad上安装：

1. 使用Safari浏览器访问你的游戏网站
2. 点击底部的"分享"按钮（方框加箭头图标）
3. 在弹出的菜单中选择"添加到主屏幕"
4. 输入应用名称（默认为"俄罗斯方块"）
5. 点击"添加"按钮

现在，游戏图标将出现在iPad的主屏幕上，点击图标即可以全屏模式启动游戏，无需浏览器界面，并且支持离线玩耍。

## 托管方式

要让其他设备访问你的PWA应用，你需要将其托管在网络服务器上。以下是几种简单的方法：

### 方法1：使用GitHub Pages（免费）

1. 在GitHub上创建一个仓库
2. 上传所有游戏文件
3. 在仓库设置中启用GitHub Pages

### 方法2：使用本地网络服务器

如果只需要在本地网络中访问（如家庭网络内的iPad），可以使用简单的HTTP服务器：

```bash
# 使用Python（大多数系统已安装）
python -m http.server 8000

# 或使用Node.js的http-server
npm install -g http-server
http-server -p 8000
```

然后在iPad上访问`http://你的电脑IP:8000`

## 注意事项

1. PWA需要通过HTTPS或localhost提供服务才能正常工作
2. 首次访问时需要联网，之后可离线使用
3. 如果更新了游戏，需要更改`sw.js`中的`CACHE_NAME`版本号

## 故障排除

如果PWA安装按钮没有出现：

1. 确保使用HTTPS或localhost
2. 检查浏览器控制台是否有错误
3. 验证manifest.json和图标文件是否正确加载
4. 确保Service Worker已成功注册

祝你游戏愉快！