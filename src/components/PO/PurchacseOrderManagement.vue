<template>
  <div class="container-fluid py-4 bg-light min-vh-100">
    <div class="row g-4">

      <!-- LEFT: Danh sách PO -->
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

      <!-- RIGHT: Chi tiết sản phẩm -->
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

          <!-- Thông tin PO -->
          <div class="card-body" v-if="selectedPo">
            <div class="mb-3 border-bottom pb-2">
              <h6 class="fw-bold mb-1">Mã PO: {{ selectedPo.code }}</h6>
              <div class="text-muted small">Nhà cung cấp: {{ selectedPo.supplier }}</div>
              <div class="text-muted small">Ngày tạo: {{ selectedPo.createdAt }}</div>
              <div class="text-muted small">Người tạo: {{ creatorName }}</div>
              <div class="text-muted small">Kho: {{ warehouseName }}</div>
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

            <!-- Table sản phẩm -->
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
                      <div class="btn-group">
                        <button 
                          class="btn btn-sm btn-outline-primary"
                          @click="openProductDetail(item)"
                        >
                          <i class="fa-solid fa-list"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click="askRemove(item.id)"
                        >
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
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

          <!-- Khi chưa chọn PO -->
          <div class="card-body text-center text-muted py-5" v-else>
            <h6 class="mb-0">Chọn một PO từ danh sách bên trái </h6>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xóa -->
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

    <!-- Modal chi tiết sản phẩm -->
    <div class="modal fade" id="productDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-3 shadow">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết sản phẩm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>
          <div class="modal-body">
            <table class="table table-bordered text-center align-middle">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Serial Number</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th> 
                  <th>Người quét</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pd, i) in selectedItemDetails" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ pd.serialNumber }}</td>
                  <td>{{ formatDateTime(pd.createdAt) }}</td>
                  <td>{{ formatDateTime(pd.updatedAt) }}</td>
                  <td>{{ scannedUserNames[pd.scannedByUserId] || "-" }}</td>
                  <td>
                    <span class="badge bg-success" v-if="pd.status === 'ACTIVE'">ACTIVE</span>
                    <span class="badge bg-secondary" v-else>{{ pd.status || '-' }}</span>
                  </td>
                </tr>
                <tr v-if="!selectedItemDetails?.length">
                  <td colspan="6" class="text-muted py-3">Không có dữ liệu sản phẩm chi tiết</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { purchaseOrderService } from "@/services/purchaseOrder/purchaseOrderService";
import { purchaseOrderItemService } from "@/services/purchaseOrder/purchaseOrderItem";
import { userService } from "../../services/UserService";
import { warehouseService } from "../../services/WarehouseService";

const pos = ref([]);
const selectedPo = ref(null);
const creatorName = ref("");
const warehouseName = ref("");
const itemToDelete = ref(null);
const selectedItemDetails = ref([]);
const scannedUserNames = ref({});
let modalInstance = null;
let detailModal = null;

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

async function openProductDetail(item) {
  selectedItemDetails.value = item.productDetails || [];

 
  for (const pd of selectedItemDetails.value) {
    if (pd.scannedByUserId && !scannedUserNames.value[pd.scannedByUserId]) {
      try {
        const res = await userService.getUserById(pd.scannedByUserId);
        scannedUserNames.value[pd.scannedByUserId] = res.username || "-";
      } catch {
        scannedUserNames.value[pd.scannedByUserId] = "-";
      }
    }
  }

  const modalEl = document.getElementById("productDetailModal");
  detailModal = new bootstrap.Modal(modalEl);
  detailModal.show();
}

async function loadExtraInfo(po) {
  try {
    const userResponse = await userService.getUserById(po.createdBy);
    creatorName.value = userResponse.username || "Không rõ người tạo";
    const warehouseResponse = await warehouseService.getWarehouseById(po.warehouseId);
    warehouseName.value = warehouseResponse?.name || "Không rõ kho";
  } catch (error) { 
    console.error("Error Load info", error);
  }
}

watch(selectedPo, async (newPo) => {
  if (newPo) {
    await loadExtraInfo(newPo);
  } else {
    creatorName.value = "";
    warehouseName.value = "";
  }
});

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  getAllPO();
});
</script>
