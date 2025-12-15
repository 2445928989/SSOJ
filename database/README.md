# 用于SSOJ项目的数据库初始化说明。

目前数据库角色（开发环境手动创建）：
ssoj_dev@%
ssoj_dev@localhost
ssoj_demo@%
ssoj_app@localhost

已经完成了schema.sql中的表结构创建。
后续可以使用docker-compose文件快速启动MySQL服务进行开发测试，包括一键创建数据库角色。（待实现）