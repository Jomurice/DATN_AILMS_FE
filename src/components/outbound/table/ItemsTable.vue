<template>
    <div class="table-responsive">
        <table class="table table-hover mb-0 table-balanced">
            <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                    <th>SKU</th>
                    <th>Tên hàng hóa</th>
                    <th>Loại</th>
                    <th>Hãng</th>
                    <th>Màu</th>
                    <th class="text-end">Số lượng</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="it in items" :key="it.id || it.sku">
                    <td class="mono nowrap">{{ it.sku }}</td>
                    <td class="nowrap" :title="it.name">{{ clip(it.name, 24) }}</td>
                    <td class="nowrap">{{ clip(it.categoryName, 18) }}</td>
                    <td class="nowrap">{{ clip(it.brandName, 18) }}</td>
                    <td class="nowrap">{{ clip(it.color || '—', 16) }}</td>
                    <td class="text-end nowrap mono">
                        <span>{{ it.scannedQuantity }}/{{ it.orderQuantity }}</span>
                        <button class="btn btn-link btn-sm ms-1" title="Xem serial đã quét"
                            @click="$emit('open-serial-modal', it.sku)">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </td>
                </tr>
                <tr v-if="loading" class="text-center">
                    <td colspan="6"><span class="spinner-border"></span></td>
                </tr>
                <tr v-else-if="!items?.length">
                    <td colspan="6" class="text-center text-muted py-3">Phiếu này chưa có dòng hàng</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
const clip = (s, n = 20) => s && s.length > n ? (s.slice(0, n) + '...') : (s || '');

defineProps({
    items: Array,
    loading: Boolean,
});

defineEmits(['open-serial-modal'])

</script>

<style scoped>
.table-balanced th,
.table-balanced td {
    vertical-align: middle;
    white-space: nowrap;
    height: 56px;
    padding-top: 12px;
    padding-bottom: 12px;
}

.thead-soft th {
    background: #cfe3ff;
    color: #0b1324;
    font-weight: 600;
    letter-spacing: .2px;
    border-top: 1px solid #9ec5fe;
    border-bottom: 1px solid #9ec5fe;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>