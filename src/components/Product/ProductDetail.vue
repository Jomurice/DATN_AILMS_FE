<template>
    <div class="card w-50 p-2">
          <div class="d-flex align-items-center justify-content-between">
            <h3>Chi tiết hàng hóa</h3>
            <p class="fs-4 exit" @click="$emit('close')">X</p>
          </div>

          <nav class="product-info gap-4 mt-3">
            <p><span class="fw-bold">Mã SKU:</span> {{ node.sku }}</p>
            <p><span class="fw-bold">Tên:</span> {{ node.name }}</p>
            <p><span class="fw-bold">Loại:</span> {{ node.categoryName }}</p>
            <p><span class="fw-bold">Màu: </span>{{ node.color }}</p>
            <p><span class="fw-bold">Hãng: </span> {{ node.brandName }}</p>
            <p><span class="fw-bold">Thuộc tính khác: </span>sadas</p>
            <p><span class="fw-bold">Thông số kỹ thuật: </span> {{ node.specifications }}</p>
          </nav>
        </div>
</template>

<script setup>
defineProps({
    node: Object,
})

defineEmits(["close"])
</script>

<style scoped>
.card {
    height: calc(100vh - 200px);
    overflow: auto;
}

.product-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
}

.exit {
    cursor: pointer !important;
}
</style>