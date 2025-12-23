<template>
  <div>
    <div v-if="selectedOrder">
      <div class="d-flex align-items-center justify-content-between px-3 pb-2">
        <div class="fw-bold">
          <div>
            {{ selectedOrder.code }} — <span class="text-muted">KH: {{ clip(customer.lastName + " " +
              customer.firstName, 28) }}</span>
          </div>
          <small class="text-muted">
            Ngày tạo: {{ fmtDate(selectedOrder.createAt) }} — Trạng thái: {{ toViStatus(selectedOrder.status) }}
          </small>
        </div>

        <div class="d-flex gap-2">
          <RouterLink v-if="role === 'ADMIN'" class="btn btn-outline-primary btn-sm" to="/outbound/new">+ Tạo phiếu xuất</RouterLink>
        </div>
      </div>

      <div class="px-3 pb-3 d-flex align-items-center flex-wrap gap-3">
        <div class="badge-card">
          <div class="text-muted small">Tổng dòng hàng hóa</div>
          <div class="num">{{ selectedOrder.items?.length || 0 }}</div>
        </div>

        <!-- QUÉT NHANH -->
        <div class="flex-grow-1 d-flex align-items-center gap-2">
          <div class="search-box">
            <input ref="quickInputRef" v-model.trim="serialInput" @keyup.enter="clearSerial"
              class="form-control mono serial-input" placeholder="Nhập số serial để quét" />


            <button v-if="serialInput" class="btn-clear" @click="clearSerial" type="button">
              ✕
            </button>
          </div>
          <nav class="d-flex gap-2 scan">
            <button class="btn btn-primary" :disabled="!isCancel" @click="clearSerial">Quét</button>
            <button class="btn btn-success" :disabled="!isCancel" @click="$emit('scan-qr')">Quét QR</button>
          </nav>
        </div>
      </div>
      <div v-if="qrScannerVisible" class="my-3">
        <div id="qr-reader" style="width: 100%;"></div>
        <button class="btn btn-secondary mt-2" @click="emit('stop-camera')">Dừng QR</button>
      </div>

    </div>

    <div v-else class="section-card">
      <div class="px-3 pt-3 pb-2 d-flex align-items-center justify-content-between">
        <h5 class="fw-bold mb-0">Chọn 1 phiếu xuất để thực hiện</h5>
        <RouterLink v-if="role === 'ADMIN'" class="btn btn-outline-primary btn-sm" to="/outbound/new">+ Tạo phiếu xuất</RouterLink>
      </div>
      <div class="p-3 text-muted">Hãy chọn phiếu từ danh sách bên trái.</div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
const serialInput = ref('')

const emit = defineEmits(['scan', 'scan-qr', 'stop-camera'])

const props = defineProps({
  selectedOrder: Object,
  customer: Object,
  qrScannerVisible: Boolean,
  role: String,
})

const clip = (s, n = 20) => s && s.length > n ? (s.slice(0, n) + '...') : (s || '');
const fmtDate = d => { if (!d) return '—'; try { if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d; const t = new Date(d); return isNaN(+t) ? d : t.toISOString().slice(0, 10) } catch { return d } };
const toViStatus = s => {
  const k = String(s || '').toUpperCase();
  if (k === 'CONFIRMED') return 'Chờ xử lý';
  if (k === 'EXPORT') return 'Hoàn tất';
  if (k === 'PENDING_CANCEL') return 'Chờ hủy';
  if (k === 'CANCELLED') return 'Đã hủy';
  return s || '—';
};

const isCancel = computed(() => {
  const statusUp = String(props.selectedOrder?.status || '').toUpperCase()
  return !['EXPORT', 'PENDING_CANCEL', 'CANCELLED',''].includes(statusUp)
})


const clearSerial = () => {
  emit('scan', serialInput.value);
  serialInput.value = '';
  serialInput.value?.focus();
}


</script>

<style scoped>
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

.search-box {
  position: relative;
}

.serial-input {
  width: 740px;
}

.btn-clear {
  position: absolute;
  top: 50%;
  right: 3px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  font-size: 16px;
  color: #888;
  cursor: pointer;
}

.btn-clear:hover {
  color: #dc3545;
}

/* mobile */

@media (max-width: 768px) {
  .serial-input {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .px-3.pb-2.d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 8px;
  }

  .px-3.pb-2 .d-flex.gap-2 {
    width: 100%;
  }

  .px-3.pb-2 .btn {
    flex: 1;
  }

  .flex-grow-1.d-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .scan {
    width: 100%;
  }

  .scan .btn {
    width: 100%;
  }

  .badge-card {
    min-width: 100%;
  }

  #qr-reader {
    max-width: 100%;
    overflow: hidden;
  }

}
</style>
