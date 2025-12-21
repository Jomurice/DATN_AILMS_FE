<template>
  <div class="main p-3">
    <!-- toolbar -->
    <OutboundToolbar @scan="emit('scan', $event)" @scan-qr="emit('scan-qr')" @stop-camera="emit('stop-camera')"
      :selectedOrder="order" :customer="customer" :serial="serial" :qr-scanner-visible="qrScannerVisible" />

    <div v-if="order">
      <!-- Item table -->
      <OutboundItemsTable :items="order.items" :modal-sku="modalSku" :modal-serials="modalSerials" :payload="payload" :loading="loading"
        :visible-pages="visiblePages" :loading-order="loadingOrder" @open-serials-modal="emit('open-serials-modal', $event)"
         @close="emit('close')" @change-page="emit('change-page', $event)" />

      <!-- Actions -->
      <div class="px-3 py-3 d-flex justify-content-end">
        <!-- <button v-if="isConfirmCancel" class="btn btn-warning mx-2" @click="$emit('reject')">Không hủy</button> -->
        <button v-if="isConfirmCancel && role === 'ADMIN'" class="btn btn-warning mx-2 " @click="$emit('confirm')">
          Lý do hủy
        </button>
        <nav v-if="isConfirmCancel === false">
          <button class="btn btn-success" :disabled="!isAllScanned || submitting" @click="$emit('export')">
            {{ submitting ? 'Đang xuất hàng...' : 'Xuất hàng' }}
          </button>
          <button class="btn btn-danger ms-2" :disabled="!isCancel" @click="$emit('cancel')">
            Hủy đơn
          </button>
        </nav>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import OutboundToolbar from './OutboundToolbar.vue'
import OutboundItemsTable from './OutboundItemsTable.vue'


const props = defineProps({
  role:String,
  order: Object,
  customer: Object,
  qrScannerVisible: Boolean,
  submitting: Boolean,
  modalSku: String,
  modalSerials: Array,
  serial: String,
  payload: Object,
  visiblePages: Array,
  loading:Boolean,
  loadingOrder: Boolean
})


const emit = defineEmits(['scan', 'scan-qr', 'stop-camera', 'export', 'cancel', 'confirm', 'reject', 'open-serials-modal', 'close', 'change-page'])


const toastMsg = ref('')

const isAllScanned = computed(() => {
  const statusUp = String(props.order?.status || '').toUpperCase()
  if (statusUp === 'EXPORT' || statusUp === 'PENDING_CANCEL') return false

  if (!props.order?.items?.length) return false
  return props.order.items.every(
    it => Number(it.scannedQuantity || 0) >= Number(it.orderQuantity || 0)
  )
})

const isCancel = computed(() => {
  const statusUp = String(props.order?.status || '').toUpperCase()
  return !['EXPORT', 'PENDING_CANCEL', 'CANCELLED',''].includes(statusUp)
})

const isConfirmCancel = computed(() => {
  return String(props.order?.status || '').toUpperCase() === 'PENDING_CANCEL'
})

</script>

<style scoped>
.main {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.badge-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 8px 14px;
  text-align: center;
  display: inline-flex;
  flex-direction: column;
  min-width: 140px;
}

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
  font-size: 18px;
}
</style>