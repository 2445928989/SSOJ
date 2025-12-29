-- SSOJ 初始化数据
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
-- 1. 创建默认管理员账号 (admin / admin123)
INSERT INTO user (username, password, email, role, nickname)
VALUES (
        'admin',
        '$2b$10$.HqYXqEgvPFDhtKV4qFV0eT/cM2D7Ok/SZE6dMfn8rXeJ/jRLwDlq',
        'admin@ssoj.local',
        'ADMIN',
        'Administrator'
    );
-- 2. 创建示例题目 (中文名)
INSERT INTO problem (
        id,
        title,
        description,
        input_format,
        output_format,
        sample_input,
        sample_output,
        difficulty,
        time_limit,
        memory_limit,
        author_id
    )
VALUES (
        1,
        'A+B 问题',
        '读取两个整数 A 和 B，输出它们的和。\n\n这是一个经典的入门题目，用于学习基本的输入输出操作。',
        '一行包含两个整数 A 和 B（$-10^9 \\leq A, B \\leq 10^9$）',
        '输出一个整数，表示 A + B 的结果。',
        '1 2',
        '3',
        'EASY',
        1.0,
        262144,
        1
    ),
    (
        2,
        '斐波那契数列',
        '给定 n，输出第 n 个斐波那契数列的值。\n\n### 定义\n\n斐波那契数列定义如下：\n- $F(1) = 1$\n- $F(2) = 1$\n- $F(n) = F(n-1) + F(n-2)$ （$n > 2$）',
        '一行包含一个整数 n（$1 \\leq n \\leq 30$）',
        '输出一个整数，表示 $F(n)$ 的值。',
        '5',
        '5',
        'EASY',
        1.0,
        262144,
        1
    ),
    (
        3,
        '回文数判断',
        '判断给定的整数是否为回文数。回文数是指从左到右和从右到左读取结果相同的整数。\n\n例如：121 是回文数，而 -121 不是。',
        '一行包含一个整数 x（$-2^{31} \\leq x \\leq 2^{31} - 1$）',
        '如果 x 是回文数，输出 1；否则输出 0。',
        '121',
        '1',
        'EASY',
        1.0,
        262144,
        1
    ),
    (
        4,
        '最大子数组和',
        '给定一个整数数组 nums，找到具有最大和的连续子数组（至少包含一个数字），并返回其最大和。\n\n### 例子\n\n输入: `[-2,1,-3,4,-1,2,1,-5,4]`\n\n输出: `6`\n\n解释: 连续子数组 `[4,-1,2,1]` 的和最大，为 6。\n\n### 提示\n\n- 可以使用动态规划或分治法解决\n- 时间复杂度应为 $O(n)$\n- 空间复杂度应为 $O(1)$',
        '第一行包含整数 n（$1 \\leq n \\leq 10^5$）\n\n第二行包含 n 个整数，表示数组元素（$-10^9 \\leq nums[i] \\leq 10^9$）',
        '输出一个整数，表示最大子数组和。',
        '9\n-2 1 -3 4 -1 2 1 -5 4',
        '6',
        'MEDIUM',
        1.0,
        262144,
        1
    ),
    (
        5,
        '最长回文子串',
        '给定字符串 s，找到 s 中最长的回文子串。\n\n回文子串是指从前往后读和从后往前读都相同的子串。',
        '一行包含字符串 s（$1 \\leq s.length \\leq 1000$，s 由数字和英文字母组成）',
        '输出最长回文子串。如果存在多个最长回文子串，输出任意一个即可。',
        'babad',
        'bab',
        'MEDIUM',
        2.0,
        262144,
        1
    );
-- 3. 创建标签
INSERT INTO tag (id, name)
VALUES (1, '入门'),
    (2, '基础'),
    (3, '数学'),
    (4, '动态规划'),
    (5, '字符串'),
    (6, '数组'),
    (7, '递归');
-- 4. 关联题目与标签
INSERT INTO problem_tag (problem_id, tag_id)
VALUES (1, 1),
    (1, 3),
    (2, 2),
    (2, 7),
    (3, 2),
    (3, 3),
    (4, 4),
    (4, 6),
    (5, 4),
    (5, 5);
-- 5. 为每个题目设置 10 组测试用例路径
INSERT INTO test_case (problem_id, input_path, output_path) WITH RECURSIVE seq AS (
        SELECT 1 AS i
        UNION ALL
        SELECT i + 1
        FROM seq
        WHERE i < 10
    ),
    probs AS (
        SELECT 1 AS p_id
        UNION ALL
        SELECT 2
        UNION ALL
        SELECT 3
        UNION ALL
        SELECT 4
        UNION ALL
        SELECT 5
    )
SELECT p_id,
    CONCAT('test_cases/problem_', p_id, '/', i, '.in'),
    CONCAT('test_cases/problem_', p_id, '/', i, '.out')
FROM probs,
    seq;
-- 6. 插入初始公告
INSERT INTO announcement (title, content, author_id)
VALUES (
        '欢迎来到 SSOJ',
        '欢迎使用 SSOJ 在线判题系统！本系统支持多种编程语言，提供丰富的题目练习。',
        1
    ),
    (
        '系统更新公告',
        '系统已更新，现在支持查看测试用例预览和更详细的错误信息。',
        1
    );