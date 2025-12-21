<template>
  <button class="btn btn-outline-secondary d-md-none mb-2" @click="emit('show-side')">
    Danh sách đơn
  </button>

  <aside class="side" :class="{ 'd-none d-md-block': !showSide }">
    <div class="brand"><i class="fa-solid fa-truck-ramp-box me-2"></i>Đơn xuất (Phiếu xuất)</div>

    <!-- search -->
    <div class="d-flex gap-2 mb-2">
      <div class="search-box">
        <input class="form-control search-input" v-model.trim="q" placeholder="Nhập mã phiếu muốn tìm"
          @keyup.enter="search(q)" />


        <button v-if="q" class="btn-clear" @click="clear" type="button">
          ✕
        </button>
      </div>
      <button class="btn btn-search btn-primary" @click="search(q)">
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>

    <!-- filter -->
    <div class="mb-2 d-flex gap-2 flex-wrap">
      <button class="btn btn-sm" :class="chipCls(null)" @click="changeStatus('')">Tất cả</button>
      <button class="btn btn-sm" :class="chipCls('CONFIRMED')" @click=" changeStatus('CONFIRMED')">Chờ xử lý</button>
      <button class="btn btn-sm" :class="chipCls('EXPORT')" @click="changeStatus('EXPORT')">Hoàn tất</button>
      <button class="btn btn-sm" :class="chipCls('PENDING_CANCEL')" @click="changeStatus('PENDING_CANCEL')">Chờ
        hủy</button>
      <button class="btn btn-sm" :class="chipCls('CANCELLED')" @click="changeStatus('CANCELLED')">Hủy</button>
    </div>

    <!-- List orders -->
    <div class="list-group small">
      <button v-for="o in orders.content || []" :key="o.id" @click="selectOder(o)"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold">{{ clip(o.code, 20) }}</div>
          <div class="fw-semibold">{{ clip(o.customer, 20) }}</div>
          <div class="badge bg-light text-dark mt-1">{{ toViStatus(o.status) }}</div>
        </div>
        <small class="text-muted">{{ fmtDate(o.createAt) }}</small>
      </button>

      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border"></div>
      </div>

      <div v-else-if="orders?.content?.length === 0" class="text-center py-3 text-muted">
        Không có đơn xuất nào
      </div>
    </div>

    <!-- pagination -->
    <Pagination v-if="orders?.totalPages > 1" :payload="payload" :visiblePages="visiblePages" :total-pages="totalPages"
      @change-page="changePage" />

  </aside>
</template>

<script setup>
import { ref } from 'vue';
import Pagination from '../Pagination.vue';

const props = defineProps({
  orders: Object,
  loading: Boolean,
  status: String,
  payload: Object,
  visiblePages: Array,
  totalPages: Number,
  showSide: Boolean
});

const emit = defineEmits([
  'search',
  'clear-input',
  'change-status',
  'select-order',
  'change-page',
  'show-side'
]);

const q = ref('');

const clear = () => {
  q.value = ''
  emit('clear-input')
}

const search = (keyword) => {
  emit('search', keyword)
};

const selectOder = (o) =>{
  emit('select-order',o)
}

const changePage = (p) => {
  emit('change-page', p)
};

const changeStatus = (s) => {
  emit('change-status', s)
};

const chipCls = s => ({ 'btn-outline-secondary': props.status !== s, 'btn-primary text-white': props.status === s });
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


</script>

<style scoped>
.side {
  width: 320px;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  position: sticky;
  top: 96px;
  overflow: auto;
}

.search-input {
  width: 240px;
}

.brand {
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.search-box {
  position: relative;
}

.btn-clear {
  position: absolute;
  top: 50%;
  right: 0px;
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
  .side {
    width: 100%;
    position: relative;
    top: 0;
    border-radius: 0;
    padding: 12px;
    max-height: none;
  }

  .btn{
    width: 30%;
  }

  .btn-search{
    width: 10%;
  }

  .search-box{
    width: 90%;
  }

  .search-input {
    width: 100%;
  }

  .side .btn-sm {
    font-size: 12px;
    padding: 4px 8px;
  }

  .list-group-item {
    padding: 10px;
  }

  .list-group-item small {
    display: block;
    margin-top: 4px;
  }
}
</style>
