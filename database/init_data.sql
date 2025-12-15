-- 开发角色
CREATE USER 'ssoj_dev'@'localhost' IDENTIFIED BY '********';
GRANT ALL PRIVILEGES ON ssoj.* TO 'ssoj_dev'@'localhost';

CREATE USER 'ssoj_dev'@'%' IDENTIFIED BY '*******';
GRANT SELECT, INSERT, UPDATE, DELETE ON ssoj.* TO 'ssoj_dev'@'%';

-- 测试角色
CREATE USER 'ssoj_demo'@'%' IDENTIFIED BY 'demo_pass';
GRANT SELECT ON ssoj.* TO 'ssoj_demo'@'%';

-- 应用角色
CREATE USER 'ssoj_app'@'localhost' IDENTIFIED BY 'app_pass';
GRANT SELECT, INSERT, UPDATE, DELETE ON ssoj.* TO 'ssoj_app'@'localhost';

FLUSH PRIVILEGES;