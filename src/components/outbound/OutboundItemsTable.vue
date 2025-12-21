<template>

  <ItemsTable class="d-none d-md-block" :items="items" :loading="loadingOrder" @open-serial-modal="openSerialsModal" />
  <ItemsCard class="d-md-none" :items="items" :loading="loadingOrder" @open-serials-modal="openSerialsModal" />


  <!-- Modal: Serial đã quét -->
  <div v-if="modalSku" class="modal-overlay">
    <div class="card w-25 p-2 notranslate" translate="no">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="mb-0">Đã quét Serial — SKU: {{ modalSku }}</h5>
        <button class="btn btn-sm btn-outline-secondary" @click="emit('close')">Đóng</button>
      </div>
      <div class="table-responsive mt-2 ">
        <table class="table table-sm" translate="no">
          <thead>
            <tr>
              <th class="notranslate">Serial</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in modalSerials.content" :key="s.serialNumber">
              <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
              <td class="nowrap">{{ s.status }}</td>
            </tr>
            <tr v-if="loading" class="text-center">
              <td colspan="3"><span class="spinner-border"></span></td>
            </tr>
            <tr v-else-if="!modalSerials?.content?.length">
              <td colspan="3" class="text-center text-muted">Chưa có serial</td>
            </tr>
          </tbody>
        </table>
        <OutboundPagination v-if="modalSerials?.totalPages > 1" :payload="payload"
          :visiblePages="modalSerials.totalPages > 0 ? Array.from({ length: modalSerials.totalPages }, (_, i) => i + 1) : []"
          @change-page="changePage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import OutboundPagination from '../Pagination.vue';
import ItemsTable from './table/ItemsTable.vue';
import ItemsCard from './table/ItemsCard.vue';


defineProps({
  items: Array,
  modalSku: String,
  modalSerials: Array,
  payload: Object,
  visiblePages: Array,
  loading: Boolean,
  loadingOrder: Boolean

})

const emit = defineEmits(['open-serials-modal', 'close', 'change-page']);

const openSerialsModal = (sku) => {
  emit('open-serials-modal', sku)
}

const changePage = (p) => {
  emit('change-page', p)
};

</script>

<style scoped>
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

/* mobile */

@media (max-width: 768px) {
  .modal-overlay .card {
    width: 95% !important;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-overlay td.mono {
    white-space: normal;
    word-break: break-all;
  }
}
</style>
