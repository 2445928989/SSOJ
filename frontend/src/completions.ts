// 代码补全数据

export const cppCompletions = [
    // I/O
    { label: 'cout', kind: 1, insertText: 'cout << ${1:}' },
    { label: 'cin', kind: 1, insertText: 'cin >> ${1:}' },
    { label: 'cerr', kind: 1, insertText: 'cerr << ${1:}' },
    { label: 'getline', kind: 3, insertText: 'getline(${1:stream}, ${2:string})' },
    { label: 'printf', kind: 3, insertText: 'printf("${1:%d}", ${2:})' },
    { label: 'scanf', kind: 3, insertText: 'scanf("${1:%d}", &${2:})' },

    // 容器
    { label: 'vector', kind: 5, insertText: 'vector<${1:int}>' },
    { label: 'string', kind: 5, insertText: 'string' },
    { label: 'map', kind: 5, insertText: 'map<${1:int}, ${2:int}>' },
    { label: 'unordered_map', kind: 5, insertText: 'unordered_map<${1:int}, ${2:int}>' },
    { label: 'set', kind: 5, insertText: 'set<${1:int}>' },
    { label: 'unordered_set', kind: 5, insertText: 'unordered_set<${1:int}>' },
    { label: 'queue', kind: 5, insertText: 'queue<${1:int}>' },
    { label: 'stack', kind: 5, insertText: 'stack<${1:int}>' },
    { label: 'deque', kind: 5, insertText: 'deque<${1:int}>' },
    { label: 'pair', kind: 5, insertText: 'pair<${1:int}, ${2:int}>' },

    // 算法
    { label: 'sort', kind: 3, insertText: 'sort(${1:begin}, ${2:end})' },
    { label: 'reverse', kind: 3, insertText: 'reverse(${1:begin}, ${2:end})' },
    { label: 'find', kind: 3, insertText: 'find(${1:begin}, ${2:end}, ${3:value})' },
    { label: 'count', kind: 3, insertText: 'count(${1:begin}, ${2:end}, ${3:value})' },
    { label: 'min_element', kind: 3, insertText: 'min_element(${1:begin}, ${2:end})' },
    { label: 'max_element', kind: 3, insertText: 'max_element(${1:begin}, ${2:end})' },
    { label: 'unique', kind: 3, insertText: 'unique(${1:begin}, ${2:end})' },

    // 常用函数
    { label: 'abs', kind: 3, insertText: 'abs(${1:})' },
    { label: 'sqrt', kind: 3, insertText: 'sqrt(${1:})' },
    { label: 'pow', kind: 3, insertText: 'pow(${1:base}, ${2:exp})' },
    { label: 'floor', kind: 3, insertText: 'floor(${1:})' },
    { label: 'ceil', kind: 3, insertText: 'ceil(${1:})' },
    { label: 'memset', kind: 3, insertText: 'memset(${1:ptr}, ${2:value}, ${3:size})' },

    // 循环
    { label: 'for', kind: 1, insertText: 'for(int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}' },
    { label: 'while', kind: 1, insertText: 'while(${1:condition}) {\n\t${0}\n}' },
    { label: 'do-while', kind: 1, insertText: 'do {\n\t${0}\n} while(${1:condition})' },

    // 控制流
    { label: 'if', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n}' },
    { label: 'if-else', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n} else {\n\t\n}' },
    { label: 'switch', kind: 1, insertText: 'switch(${1:value}) {\n\tcase ${2:}:\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}' },

    // 函数
    { label: 'void', kind: 1, insertText: 'void ${1:func}(${2:}) {\n\t${0}\n}' },
    { label: 'int', kind: 1, insertText: 'int ${1:func}(${2:}) {\n\t${0}\n}' },
    { label: 'main', kind: 1, insertText: 'int main() {\n\t${0}\n\treturn 0;\n}' },
]

export const pythonCompletions = [
    // I/O
    { label: 'print', kind: 3, insertText: 'print(${1:})' },
    { label: 'input', kind: 3, insertText: 'input(${1:"Enter: "})' },
    { label: 'open', kind: 3, insertText: 'open(${1:"file.txt"}, ${2:"r"})' },

    // 内置函数
    { label: 'len', kind: 3, insertText: 'len(${1:})' },
    { label: 'range', kind: 3, insertText: 'range(${1:})' },
    { label: 'enumerate', kind: 3, insertText: 'enumerate(${1:})' },
    { label: 'zip', kind: 3, insertText: 'zip(${1:}, ${2:})' },
    { label: 'map', kind: 3, insertText: 'map(${1:func}, ${2:iterable})' },
    { label: 'filter', kind: 3, insertText: 'filter(${1:func}, ${2:iterable})' },
    { label: 'sorted', kind: 3, insertText: 'sorted(${1:iterable})' },
    { label: 'sum', kind: 3, insertText: 'sum(${1:})' },
    { label: 'max', kind: 3, insertText: 'max(${1:})' },
    { label: 'min', kind: 3, insertText: 'min(${1:})' },
    { label: 'abs', kind: 3, insertText: 'abs(${1:})' },
    { label: 'round', kind: 3, insertText: 'round(${1:})' },
    { label: 'int', kind: 3, insertText: 'int(${1:})' },
    { label: 'str', kind: 3, insertText: 'str(${1:})' },
    { label: 'list', kind: 3, insertText: 'list(${1:})' },
    { label: 'dict', kind: 3, insertText: 'dict()' },
    { label: 'set', kind: 3, insertText: 'set()' },
    { label: 'tuple', kind: 3, insertText: 'tuple(${1:})' },

    // 容器
    { label: 'list', kind: 5, insertText: 'list()' },
    { label: 'dict', kind: 5, insertText: 'dict()' },
    { label: 'set', kind: 5, insertText: 'set()' },
    { label: 'tuple', kind: 5, insertText: 'tuple()' },

    // 循环
    { label: 'for', kind: 1, insertText: 'for ${1:item} in ${2:iterable}:\n\t${0}' },
    { label: 'while', kind: 1, insertText: 'while ${1:condition}:\n\t${0}' },

    // 控制流
    { label: 'if', kind: 1, insertText: 'if ${1:condition}:\n\t${0}' },
    { label: 'if-else', kind: 1, insertText: 'if ${1:condition}:\n\t${0}\nelse:\n\t' },
    { label: 'if-elif-else', kind: 1, insertText: 'if ${1:condition}:\n\t${0}\nelif ${2:}:\n\t\nelif :\n\telse:\n\t' },
    { label: 'try-except', kind: 1, insertText: 'try:\n\t${0}\nexcept ${1:Exception}:\n\t' },

    // 函数
    { label: 'def', kind: 1, insertText: 'def ${1:func}(${2:}):\n\t${0}' },
    { label: 'lambda', kind: 1, insertText: 'lambda ${1:x}: ${2:}' },
    { label: 'return', kind: 1, insertText: 'return ${1:}' },

    // 常用
    { label: 'import', kind: 1, insertText: 'import ${1:}' },
    { label: 'from', kind: 1, insertText: 'from ${1:module} import ${2:}' },
    { label: 'class', kind: 1, insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:}):\n\t\t${0}' },
]

export const javaCompletions = [
    // I/O
    { label: 'System.out.println', kind: 3, insertText: 'System.out.println(${1:})' },
    { label: 'System.out.print', kind: 3, insertText: 'System.out.print(${1:})' },
    { label: 'Scanner', kind: 5, insertText: 'Scanner(${1:System.in})' },

    // 容器
    { label: 'ArrayList', kind: 5, insertText: 'ArrayList<${1:Integer}>()' },
    { label: 'HashMap', kind: 5, insertText: 'HashMap<${1:String}, ${2:Integer}>()' },
    { label: 'HashSet', kind: 5, insertText: 'HashSet<${1:Integer}>()' },
    { label: 'LinkedList', kind: 5, insertText: 'LinkedList<${1:Integer}>()' },
    { label: 'TreeMap', kind: 5, insertText: 'TreeMap<${1:String}, ${2:Integer}>()' },
    { label: 'TreeSet', kind: 5, insertText: 'TreeSet<${1:Integer}>()' },

    // 循环
    { label: 'for', kind: 1, insertText: 'for(int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}' },
    { label: 'for-each', kind: 1, insertText: 'for(${1:Type} ${2:item} : ${3:collection}) {\n\t${0}\n}' },
    { label: 'while', kind: 1, insertText: 'while(${1:condition}) {\n\t${0}\n}' },
    { label: 'do-while', kind: 1, insertText: 'do {\n\t${0}\n} while(${1:condition})' },

    // 控制流
    { label: 'if', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n}' },
    { label: 'if-else', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n} else {\n\t\n}' },
    { label: 'switch', kind: 1, insertText: 'switch(${1:value}) {\n\tcase ${2:}:\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}' },

    // 修饰符和关键字
    { label: 'public', kind: 1, insertText: 'public ' },
    { label: 'private', kind: 1, insertText: 'private ' },
    { label: 'protected', kind: 1, insertText: 'protected ' },
    { label: 'static', kind: 1, insertText: 'static ' },
    { label: 'final', kind: 1, insertText: 'final ' },

    // 类和方法
    { label: 'class', kind: 5, insertText: 'class ${1:ClassName} {\n\t${0}\n}' },
    { label: 'interface', kind: 5, insertText: 'interface ${1:InterfaceName} {\n\t${0}\n}' },
    { label: 'main', kind: 1, insertText: 'public static void main(String[] args) {\n\t${0}\n}' },
    { label: 'toString', kind: 3, insertText: '@Override\n\tpublic String toString() {\n\t\treturn ${1:};\n\t}' },
    { label: 'equals', kind: 3, insertText: '@Override\n\tpublic boolean equals(Object o) {\n\t\t${0}\n\t}' },
]

export const cCompletions = [
    // I/O
    { label: 'printf', kind: 3, insertText: 'printf("${1:%d}\\n", ${2:})' },
    { label: 'scanf', kind: 3, insertText: 'scanf("${1:%d}", &${2:})' },
    { label: 'getchar', kind: 3, insertText: 'getchar()' },
    { label: 'putchar', kind: 3, insertText: 'putchar(${1:})' },
    { label: 'gets', kind: 3, insertText: 'gets(${1:buffer})' },
    { label: 'puts', kind: 3, insertText: 'puts(${1:})' },

    // 字符串
    { label: 'strlen', kind: 3, insertText: 'strlen(${1:})' },
    { label: 'strcpy', kind: 3, insertText: 'strcpy(${1:dest}, ${2:src})' },
    { label: 'strcat', kind: 3, insertText: 'strcat(${1:dest}, ${2:src})' },
    { label: 'strcmp', kind: 3, insertText: 'strcmp(${1:str1}, ${2:str2})' },
    { label: 'strchr', kind: 3, insertText: 'strchr(${1:str}, ${2:char})' },
    { label: 'strstr', kind: 3, insertText: 'strstr(${1:haystack}, ${2:needle})' },

    // 内存
    { label: 'malloc', kind: 3, insertText: 'malloc(${1:size})' },
    { label: 'calloc', kind: 3, insertText: 'calloc(${1:count}, ${2:size})' },
    { label: 'realloc', kind: 3, insertText: 'realloc(${1:ptr}, ${2:size})' },
    { label: 'free', kind: 3, insertText: 'free(${1:ptr})' },
    { label: 'memset', kind: 3, insertText: 'memset(${1:ptr}, ${2:value}, ${3:size})' },
    { label: 'memcpy', kind: 3, insertText: 'memcpy(${1:dest}, ${2:src}, ${3:size})' },

    // 数学
    { label: 'abs', kind: 3, insertText: 'abs(${1:})' },
    { label: 'sqrt', kind: 3, insertText: 'sqrt(${1:})' },
    { label: 'pow', kind: 3, insertText: 'pow(${1:base}, ${2:exp})' },
    { label: 'floor', kind: 3, insertText: 'floor(${1:})' },
    { label: 'ceil', kind: 3, insertText: 'ceil(${1:})' },
    { label: 'round', kind: 3, insertText: 'round(${1:})' },
    { label: 'sin', kind: 3, insertText: 'sin(${1:})' },
    { label: 'cos', kind: 3, insertText: 'cos(${1:})' },
    { label: 'tan', kind: 3, insertText: 'tan(${1:})' },

    // 循环
    { label: 'for', kind: 1, insertText: 'for(int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}' },
    { label: 'while', kind: 1, insertText: 'while(${1:condition}) {\n\t${0}\n}' },
    { label: 'do-while', kind: 1, insertText: 'do {\n\t${0}\n} while(${1:condition})' },

    // 控制流
    { label: 'if', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n}' },
    { label: 'if-else', kind: 1, insertText: 'if(${1:condition}) {\n\t${0}\n} else {\n\t\n}' },
    { label: 'switch', kind: 1, insertText: 'switch(${1:value}) {\n\tcase ${2:}:\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}' },

    // 函数
    { label: 'void', kind: 1, insertText: 'void ${1:func}(${2:}) {\n\t${0}\n}' },
    { label: 'int', kind: 1, insertText: 'int ${1:func}(${2:}) {\n\t${0}\n\treturn 0;\n}' },
    { label: 'main', kind: 1, insertText: 'int main() {\n\t${0}\n\treturn 0;\n}' },

    // 标准库
    { label: 'include', kind: 1, insertText: '#include <${1:stdio.h}>' },
    { label: 'define', kind: 1, insertText: '#define ${1:MACRO} ${2:}' },
]
