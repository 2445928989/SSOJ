#!/bin/bash

# 读取 .env 文件中的参数
if [ -f ".env" ]; then
    # 使用 tr -d '\r' 去除 Windows 换行符
    export $(grep -v '^#' .env | tr -d '\r' | xargs)
fi

# 默认值（如果 .env 中没有设置）
COUNT=${COUNT:-5}
# 再次确保 COUNT 是纯数字，去除可能残余的 \r
COUNT=$(echo $COUNT | tr -d '\r')
IN_DIR=${IN_DIR:-"./in"}
OUT_DIR=${OUT_DIR:-"./out"}

# 创建目录
mkdir -p "$IN_DIR"
mkdir -p "$OUT_DIR"

echo "Compiling gen.cpp ..."
g++ -O2 -std=c++17 gen.cpp -o gen
if [ $? -ne 0 ]; then
    echo "Failed to compile gen.cpp"
    exit 1
fi

echo "Compiling sol.cpp ..."
g++ -O2 -std=c++17 sol.cpp -o sol
if [ $? -ne 0 ]; then
    echo "Failed to compile sol.cpp"
    exit 1
fi

echo "Running generator ..."
for ((i=1; i<=COUNT; i++)); do
    echo "Generating test $i ..."
    ./gen > "$IN_DIR/$i.in"
done

echo "Compiling and running solution on all test cases ..."
for infile in "$IN_DIR"/*.in; do
    [ -e "$infile" ] || continue
    filename=$(basename "$infile")
    basename="${filename%.*}"
    outfile="$OUT_DIR/$basename.out"
    echo "Processing $filename -> $basename.out"
    ./sol < "$infile" > "$outfile"
done

echo "Done."
exit 0
