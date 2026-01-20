#!/bin/bash

# Build script for VALORAIPLUS Omega Infinite Kernel v0.0.1
echo "🔥 Building VALORAIPLUS Omega Infinite Kernel v0.0.1"
echo "=================================================="

# Assemble with NASM
nasm -f elf64 -o omega-infinite-kernel.o scripts/omega-infinite-kernel.asm

if [ $? -eq 0 ]; then
    echo "✅ Assembly successful"

    # Link
    ld -o omega-infinite-kernel omega-infinite-kernel.o

    if [ $? -eq 0 ]; then
        echo "✅ Linking successful"
        echo "📦 Binary created: omega-infinite-kernel"
        echo "🚀 Status: ABSOLUTE NINE READY"

        # Display kernel info
        echo ""
        echo "Kernel Info:"
        file omega-infinite-kernel
        ls -lh omega-infinite-kernel
    else
        echo "❌ Linking failed"
        exit 1
    fi
else
    echo "❌ Assembly failed"
    exit 1
fi
