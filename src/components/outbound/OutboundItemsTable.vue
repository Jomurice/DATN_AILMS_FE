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
            <button class="btn btn-link btn-sm ms-1" title="Xem serial đã quét" @click="openSerialsModal(it.sku)">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
        </tr>
        <tr v-if="!items?.length">
          <td colspan="6" class="text-center text-muted py-3">Phiếu này chưa có dòng hàng</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal: Serial đã quét -->
    <div v-if="modalSku" class="modal-overlay">
      <div class="card w-50 p-2 notranslate" translate="no">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0">Đã quét Serial — SKU: {{ modalSku }}</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="emit('close')">Đóng</button>
        </div>
        <div class="table-responsive mt-2">
          <table class="table table-sm" translate="no">
            <thead>
              <tr>
                <th class="notranslate">Serial</th>
                <th>Trạng thái</th>
                <th>Vị trí</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in modalSerials.content" :key="s.serialNumber">
                <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
                <td class="nowrap">{{ s.status }}</td>
                <td class="nowrap notranslate">{{ s.warehouseId || s.binId || '—' }}</td>
              </tr>
              <tr v-if="!modalSerials?.content?.length">
                <td colspan="3" class="text-center text-muted">Chưa có serial</td>
              </tr>
            </tbody>
          </table>
          <OutboundPagination v-if="modalSerials?.totalPages > 1" :payload="payload" :visiblePages="modalSerials.totalPages > 0 ? Array.from({ length: modalSerials.totalPages }, (_, i) => i + 1) : []"
            @change-page="changePage" />
        </div>
      </div>
    </div>
</template>

<script setup>
import OutboundPagination from '../Pagination.vue';

const clip = (s, n = 20) => s && s.length > n ? (s.slice(0, n) + '...') : (s || '');
defineProps({
  items: Array,
  modalSku: String,
  modalSerials: Array,
  payload: Object,
  visiblePages: Array

})

const emit = defineEmits(['open-serials-modal','close','change-page']);

const openSerialsModal = (sku) => {
  emit('open-serials-modal', sku)
}

const changePage = (p) => {
  emit('change-page', p)
};

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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>

