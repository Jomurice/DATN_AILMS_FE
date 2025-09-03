<!-- src/components/Product/ProductDetail.vue -->
<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <h5 class="fw-bold m-0">Thông tin chi tiết sản phẩm</h5>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="$router.back()">← Quay lại</button>
        <button class="btn btn-warning" @click="editProduct">Sửa</button>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info">Đang tải dữ liệu...</div>
    <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

    <div v-else class="row g-4">
      <div class="col-12 col-md-4">
        <div class="border rounded p-2 text-center bg-light">
          <img v-if="mainImage" :src="mainImage" alt="product" class="img-fluid" />
          <div v-else class="py-5 text-muted">Ảnh sản phẩm</div>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold mb-2">{{ product.name || 'Chưa cập nhật' }}</h4>

            <div class="mb-2"><small class="text-muted">SKU</small><div>{{ product.sku || 'Chưa cập nhật' }}</div></div>
            <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ product.id }}</div></div>

            <div class="row">
              <div class="col-sm-6 mb-2">
                <div class="text-muted small">Thương hiệu</div>
                <div>{{ product.brand || 'Chưa cập nhật' }}</div>
              </div>
              <div class="col-sm-6 mb-2">
                <div class="text-muted small">Loại</div>
                <div>{{ product.category?.name || '—' }}</div>
              </div>
              <div class="col-sm-6 mb-2">
                <div class="text-muted small">Màu sắc</div>
                <div>{{ product.color || 'Chưa cập nhật' }}</div>
              </div>
              <div class="col-sm-6 mb-2">
                <div class="text-muted small">Lưu trữ</div>
                <div>{{ product.storage || 'Chưa cập nhật' }}</div>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-muted small mb-1">Thông số kỹ thuật</div>
              <pre class="mb-0" style="white-space: pre-wrap;">{{ product.specifications || 'Chưa cập nhật' }}</pre>
            </div>

            <hr class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-bold m-0">Danh sách serial ({{ product.productDetails?.length || 0 }})</h6>
              <!-- NEW: nút thêm serial -->
              <button class="btn btn-sm btn-primary" @click="openAddDetail">+ Thêm serial</button>
            </div>

            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr><th>Serial</th><th>Trạng thái</th><th>Vị trí (Bin)</th><th class="text-end">Hành động</th></tr>
                </thead>
                <tbody>
                  <tr v-for="d in (product.productDetails || [])" :key="d.id">
                    <td>{{ d.serialNumber }}</td>
                    <td>{{ d.status }}</td>
                    <td>{{ d.bin?.name || '—' }}</td>
                    <td class="text-end">
                      <button class="btn btn-xs btn-outline-warning me-1" @click="openEditDetail(d)">Sửa</button>
                      <button class="btn btn-xs btn-outline-danger" @click="removeDetail(d)">Xoá</button>
                    </td>
                  </tr>
                  <tr v-if="!product.productDetails || product.productDetails.length === 0">
                    <td colspan="4" class="text-muted text-center">Chưa có serial</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-secondary" @click="$router.back()">Quay lại</button>
              <button class="btn btn-outline-primary" @click="goList">Xem danh sách</button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- NEW: Modal thêm/sửa serial -->
    <div v-if="showDetailModal" class="modal fade show" style="display:block; background: rgba(0,0,0,.35);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <strong class="modal-title">{{ editingDetail ? 'Cập nhật Serial' : 'Thêm Serial' }}</strong>
            <button type="button" class="btn-close" @click="closeDetailModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Serial Number <span class="text-danger">*</span></label>
              <input v-model.trim="detailForm.serialNumber" class="form-control" :class="{'is-invalid': detailTouched && !detailForm.serialNumber}" />
              <div class="invalid-feedback">Vui lòng nhập serial.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Trạng thái</label>
              <select v-model="detailForm.status" class="form-select">
                <option v-for="st in statuses" :key="st" :value="st">{{ st }}</option>
              </select>
            </div>

            <!-- Nhập Bin (tuỳ chọn). Nếu muốn dropdown thật, lấy list từ binService.list(shelfId) -->
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label">Bin ID (tuỳ chọn)</label>
                <input v-model.trim="detailForm.binId" class="form-control" placeholder="VD: bin-01" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Bin Name (tuỳ chọn)</label>
                <input v-model.trim="detailForm.binName" class="form-control" placeholder="VD: A1-01" />
              </div>
            </div>

            <div class="form-text mt-2">Để trống Bin nếu chưa muốn gán vị trí.</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="closeDetailModal">Huỷ</button>
            <button class="btn btn-primary" :disabled="savingDetail" @click="submitDetail">
              <span v-if="savingDetail" class="spinner-border spinner-border-sm me-1"></span>
              {{ editingDetail ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Modal -->
  </div>
</template>

<script>
import { productService } from '../../services/productService'
import { productDetailService, PRODUCT_DETAIL_STATUSES } from '../../services/productDetailService'

export default {
  name: "ProductDetail",
  data() {
    return {
      loading: true,
      errorMsg: "",
      product: {},
      mainImage: "",

      // NEW: modal + form serial
      showDetailModal: false,
      savingDetail: false,
      detailTouched: false,
      editingDetail: null, // object detail đang sửa (hoặc null nếu thêm mới)
      detailForm: { serialNumber: "", status: "AVAILABLE", binId: "", binName: "" },
      statuses: PRODUCT_DETAIL_STATUSES,
    }
  },
  methods: {
    async fetchProduct() {
      this.errorMsg = ""; this.loading = true;
      const id = String(this.$route.params.id || "");
      try {
        // lấy product
        const apiData = await productService.getProductById(id);
        if (!apiData || !apiData.id) {
          this.errorMsg = "Không tìm thấy sản phẩm.";
          this.product = {}; this.mainImage = "";
          return;
        }
        this.product = apiData;
        this.mainImage = apiData.images?.[0] || "";

        // đảm bảo có latest productDetails từ service riêng (đề phòng BE không expand)
        const details = await productDetailService.listByProduct(this.product.id);
        this.product = { ...this.product, productDetails: details };

      } catch (e) {
        this.errorMsg = e?.response?.data?.message || "Tải dữ liệu thất bại.";
      } finally {
        this.loading = false;
      }
    },
    goList() { this.$router.push("/products"); },
    editProduct() { this.$router.push({ name: "product-form", params: { id: this.product.id } }) },

    // ===== NEW: CRUD Detail =====
    openAddDetail() {
      this.editingDetail = null
      this.detailTouched = false
      this.detailForm = { serialNumber: "", status: "AVAILABLE", binId: "", binName: "" }
      this.showDetailModal = true
    },
    openEditDetail(d) {
      this.editingDetail = d
      this.detailTouched = false
      this.detailForm = {
        serialNumber: d.serialNumber || "",
        status: d.status || "AVAILABLE",
        binId: d.bin?.id || "",
        binName: d.bin?.name || "",
      }
      this.showDetailModal = true
    },
    closeDetailModal() {
      this.showDetailModal = false
    },
    async submitDetail() {
      this.detailTouched = true
      if (!this.detailForm.serialNumber?.trim()) return

      this.savingDetail = true
      try {
        if (this.editingDetail) {
          // update
          const updated = await productDetailService.update(this.editingDetail.id, {
            serialNumber: this.detailForm.serialNumber.trim(),
            status: this.detailForm.status,
            binId: this.detailForm.binId?.trim() || null,
            binName: this.detailForm.binName?.trim() || null,
          })
          // refresh local list
          this.product.productDetails = (this.product.productDetails || []).map(x => x.id === updated.id ? updated : x)
        } else {
          // create
          const created = await productDetailService.create({
            productId: this.product.id,
            serialNumber: this.detailForm.serialNumber.trim(),
            status: this.detailForm.status,
            binId: this.detailForm.binId?.trim() || null,
            binName: this.detailForm.binName?.trim() || null,
          })
          this.product.productDetails = [created, ...(this.product.productDetails || [])]
        }
        this.closeDetailModal()
      } catch (e) {
        alert(e?.response?.data?.message || e.message || "Lưu serial thất bại")
      } finally {
        this.savingDetail = false
      }
    },
    async removeDetail(d) {
      if (!confirm(`Xoá serial "${d.serialNumber}" ?`)) return
      try {
        await productDetailService.remove(d.id)
        this.product.productDetails = (this.product.productDetails || []).filter(x => x.id !== d.id)
      } catch (e) {
        alert(e?.response?.data?.message || e.message || "Xoá serial thất bại")
      }
    },
  },
  created() { this.fetchProduct(); },
  watch: { "$route.params.id"() { this.fetchProduct(); } }
}
</script>

<style scoped>
.card { border-radius: 12px; }
img.img-fluid { max-height: 320px; object-fit: cover; }

/* modal mini */
.modal .modal-content { border-radius: 12px; }
.btn-xs { padding: .15rem .4rem; font-size: .75rem; }
</style>
