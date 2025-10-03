<template>
  <div class="container-fluid py-4 bg-light min-vh-100">
    <div class="row g-4">

   
      <div class="col-md-3">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">Danh sách PO</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="po in pos"
              :key="po.id"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
              :class="{ active: po.id === selectedPo?.id }"
              style="cursor: pointer;"
              @click="selectedPo = po"
            >
              <div>
                <div class="fw-bold">{{ po.code }}</div>
                <div class="small text-muted">{{ po.supplier }}</div>
                <div class="small text-muted">{{ po.createdAt }}</div>
              </div>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-success': po.status === 'COMPLETED',
                  'bg-warning text-dark': po.status === 'PENDING',
                  'bg-info text-dark': po.status === 'IN_BOUND'
                }"
              >
                {{ po.status }}
              </span>
            </li>
          </ul>
        </div>
      </div>

   
      <div class="col-md-9">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Chi tiết sản phẩm</h5>


            <div class="position-relative search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>
          </div>

          <div class="card-body" v-if="selectedPo">
            <div class="mb-3 border-bottom pb-2">
              <h6 class="fw-bold mb-1">Mã PO: {{ selectedPo.code }}</h6>
              <div class="text-muted small">Nhà cung cấp: {{ selectedPo.supplier }}</div>
              <div class="text-muted small">Ngày tạo: {{ selectedPo.createdAt }}</div>
              <div class="text-muted small">
                Trạng thái:
                <span
                  class="badge rounded-pill ms-1"
                  :class="{
                    'bg-success': selectedPo.status === 'COMPLETED',
                    'bg-warning text-dark': selectedPo.status === 'PENDING',
                    'bg-info text-dark': selectedPo.status === 'IN_BOUND'
                  }"
                >
                  {{ selectedPo.status }}
                </span>
              </div>
            </div>

            <div class="table-responsive rounded-3">
              <table class="table table-hover align-middle text-center">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Mã SKU</th>
                    <th>Màu</th>
                    <th>Bộ nhớ</th>
                    <th>Số lượng đặt</th>
                    <th>Đã quét</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedPo.items" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.product.name }}</td>
                    <td>{{ item.product.sku }}</td>
                    <td>{{ item.product.color }}</td>
                    <td>{{ item.product.storage }}</td>
                    <td>{{ item.orderQuantity }}</td>
                    <td>{{ item.scannedQuantity }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="askRemove(item.id)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <nav class="mt-3">
              <ul class="pagination justify-content-end mb-0">
                <li class="page-item disabled"><a class="page-link" href="#"><</a></li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">></a></li>
              </ul>
            </nav>
          </div>

          <div class="card-body text-center text-muted py-5" v-else>
            <h6 class="mb-0">Chọn một PO từ danh sách bên trái </h6>
          </div>
        </div>
      </div>
    </div>

 
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-3 shadow">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>
          <div class="modal-body">
            Bạn có chắc chắn muốn xóa sản phẩm này không?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmRemove">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { purchaseOrderService } from "../../services/puchaseOrder/puschaseOrderService";
import { purchaseOrderItemService } from "../../services/puchaseOrder/PuchaseOrderItem";

const pos = ref([]);
const selectedPo = ref(null);


const itemToDelete = ref(null);
let modalInstance = null;

async function getAllPO() {
  try {
    const data = await purchaseOrderService.getAllPurchaseOrders();
    pos.value = data;
  } catch (error) {
    console.error("Error load list PO:", error);
  }
}


function askRemove(itemId) {
  itemToDelete.value = itemId;
  const modalEl = document.getElementById("confirmDeleteModal");
  modalInstance = new bootstrap.Modal(modalEl);
  modalInstance.show();
}


async function confirmRemove() {
  try {
    await purchaseOrderItemService.removeItem(itemToDelete.value);
    getAllPO(); 
    modalInstance.hide();
  } catch (error) {
    console.log("Error delete item", error);
  }
}

onMounted(() => {
  getAllPO();
});
</script>

<style scoped>
.container-fluid {
  background: #f8f9fa;
}

.card {
  transition: all 0.2s ease-in-out;
  border-radius: 0.75rem;
}

.list-group-item.active {
  background: #e9ecef !important;
  color: #000 !important;
  border: none !important;
}

.list-group-item:hover {
  background: #f1f3f5;
}

.table th {
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4em 0.6em;
}


.search-wrapper {
  width: 280px;
}

.search-input {
  padding-left: 2.2rem;
  border-radius: 50px;
  background-color: #fff;
  border: 1px solid #ced4da;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 6px rgba(13, 110, 253, 0.4);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #6c757d;
}
</style>
