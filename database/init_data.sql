-- SSOJ 初始化数据
-- 创建默认管理员账号
SET NAMES utf8;
SET CHARACTER SET utf8;

-- 默认管理员: admin / admin123
-- 密码使用 BCrypt 哈希: $2b$10$.HqYXqEgvPFDhtKV4qFV0eT/cM2D7Ok/SZE6dMfn8rXeJ/jRLwDlq
-- 可通过以下 Java 代码生成新的 BCrypt 哈希:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hash = encoder.encode("your_password");

INSERT INTO user (username, password, email, role, nickname) VALUES
('admin', '$2b$10$.HqYXqEgvPFDhtKV4qFV0eT/cM2D7Ok/SZE6dMfn8rXeJ/jRLwDlq', 'admin@ssoj.local', 'ADMIN', 'Administrator');

-- 创建几个示例题目
INSERT INTO problem (title, description, input_format, output_format, sample_input, sample_output, difficulty, time_limit, memory_limit, author_id) VALUES
('A+B Problem', 
 '# A + B Problem\n\n读取两个整数 A 和 B，输出它们的和。\n\n这是一个经典的入门题目，用于学习基本的输入输出操作。',
 '## 输入格式\n\n一行包含两个整数 A 和 B（$-10^9 \\leq A, B \\leq 10^9$）',
 '## 输出格式\n\n输出一个整数，表示 A + B 的结果。',
 '1 2',
 '3',
 'EASY',
 1.0,
 262144,
 1),

('Fibonacci Sequence',
 '# 斐波那契数列\n\n给定 n，输出第 n 个斐波那契数列的值。\n\n## 定义\n\n斐波那契数列定义如下：\n- $F(1) = 1$\n- $F(2) = 1$\n- $F(n) = F(n-1) + F(n-2)$ （$n > 2$）',
 '## 输入格式\n\n一行包含一个整数 n（$1 \\leq n \\leq 30$）',
 '## 输出格式\n\n输出一个整数，表示 $F(n)$ 的值。',
 '5',
 '5',
 'EASY',
 1.0,
 262144,
 1),

('Palindrome Number',
 '# 回文数\n\n判断给定的整数是否为回文数。回文数是指从左到右和从右到左读取结果相同的整数。\n\n例如：121 是回文数，而 -121 不是。',
 '## 输入格式\n\n一行包含一个整数 x（$-2^{31} \\leq x \\leq 2^{31} - 1$）',
 '## 输出格式\n\n如果 x 是回文数，输出 1；否则输出 0。',
 '121',
 '1',
 'EASY',
 1.0,
 262144,
 1),

('Maximum Subarray',
 '# 最大子数组和\n\n给定一个整数数组 nums，找到具有最大和的连续子数组（至少包含一个数字），并返回其最大和。\n\n## 例子\n\n输入: `[-2,1,-3,4,-1,2,1,-5,4]`\n\n输出: `6`\n\n解释: 连续子数组 `[4,-1,2,1]` 的和最大，为 6。\n\n## 提示\n\n- 可以使用动态规划或分治法解决\n- 时间复杂度应为 $O(n)$\n- 空间复杂度应为 $O(1)$',
 '## 输入格式\n\n第一行包含整数 n（$1 \\leq n \\leq 10^5$）\n\n第二行包含 n 个整数，表示数组元素（$-10^9 \\leq nums[i] \\leq 10^9$）',
 '## 输出格式\n\n输出一个整数，表示最大子数组和。',
 '9\n-2 1 -3 4 -1 2 1 -5 4',
 '6',
 'MEDIUM',
 1.0,
 262144,
 1),

('Longest Palindromic Substring',
 '# 最长回文子串\n\n给定字符串 s，找到 s 中最长的回文子串。\n\n回文子串是指从前往后读和从后往前读都相同的子串。',
 '## 输入格式\n\n一行包含字符串 s（$1 \\leq s.length \\leq 1000$，s 由数字和英文字母组成）',
 '## 输出格式\n\n输出最长回文子串。如果存在多个最长回文子串，输出任意一个即可。',
 'babad',
 'bab',
 'MEDIUM',
 2.0,
 262144,
 1);

-- 创建最大子数组问题的10组测试数据
INSERT INTO test_case (problem_id, input_path, output_path) VALUES
-- 测试用例1: 包含正负数的基本情况
(4, 'problem_4/1.in', 'problem_4/1.out'),
-- 测试用例2: 全是负数
(4, 'problem_4/2.in', 'problem_4/2.out'),
-- 测试用例3: 全是正数
(4, 'problem_4/3.in', 'problem_4/3.out'),
-- 测试用例4: 单个元素
(4, 'problem_4/4.in', 'problem_4/4.out'),
-- 测试用例5: 大数据量（接近1e5）
(4, 'problem_4/5.in', 'problem_4/5.out'),
-- 测试用例6: 全是零
(4, 'problem_4/6.in', 'problem_4/6.out'),
-- 测试用例7: 极端正值
(4, 'problem_4/7.in', 'problem_4/7.out'),
-- 测试用例8: 极端负值
(4, 'problem_4/8.in', 'problem_4/8.out'),
-- 测试用例9: 交替正负
(4, 'problem_4/9.in', 'problem_4/9.out'),
-- 测试用例10: 大数据多分段
(4, 'problem_4/10.in', 'problem_4/10.out');

-- 创建几个标签
INSERT INTO tag (name, color) VALUES
('简单', '#28a745'),
('中等', '#ffc107'),
('困难', '#dc3545'),
('字符串', '#17a2b8'),
('数组', '#6f42c1'),
('动态规划', '#fd7e14'),
('递归', '#6c757d');
