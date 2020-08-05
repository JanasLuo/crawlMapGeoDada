# crawlMapGeoDada

利用百度 api 通过小区名字获取校区 wkt 数据

# 使用

1. server 端运行

1) 安装依赖：
   server 文件夹下运行 npm install

2) 启动服务
   node app_file.js (存 excel 文件)
   或者
   node app_mysql.js (存 mysql 数据库，效率比较慢)

2. 打开前端页面
   index_file.html(对应服务端 app_file.js 服务)
   或者
   index_mysql.html(对应服务端 app_mysql.js 服务)

3. 使用
   names.xlsx 第一列存放需要查询的小区名字
   在前端页面点击开始，查询服务端 names.xlsx 数据查询，分别请求百度 api 获取并转换 wkt 数据，存储到 polygon.xlsx 文件中
