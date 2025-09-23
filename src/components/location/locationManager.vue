```vue
<template>
  <div class="container py-5" style="max-width: 1000px;">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center gap-2">
        <!-- Thanh tìm kiếm -->
        <div class="position-relative">
          <input
            v-model.trim="searchQuery"
            type="text"
            class="form-control"
            placeholder="Nhập tên tỉnh hoặc địa chỉ..."
            maxlength="100"
            :class="{ 'is-invalid': searchQuery && filteredTinhs.length === 0 }"
          />
          <div class="invalid-feedback" v-if="searchQuery && filteredTinhs.length === 0">
            Không tìm thấy tỉnh nào.
          </div>
        </div>
      </div>
      <button class="btn btn-success" @click="showAddTinhModal = true">
        + Thêm địa chỉ
      </button>
    </div>

    <!-- Bảng danh sách tỉnh -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-3">Danh sách tỉnh</h5>

        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Tên tỉnh</th>
              <th>Địa chỉ</th>
              <th class="text-center" style="width: 100px;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tinh, index) in filteredTinhs" :key="tinh.id">
              <td>{{ tinh.tenTinh }}</td>
              <td>{{ tinh.diaChi }}</td>
              <td class="text-center">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-link text-dark"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span class="fw-bold fs-5">⋮</span>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openEditTinhModal(index)">
                        Chỉnh sửa
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openPhuongModal(index)">
                        Phường trực thuộc
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTinhs.length === 0">
              <td colspan="3" class="text-center text-muted py-3">
                {{ searchQuery ? 'Không tìm thấy tỉnh nào' : 'Chưa có tỉnh nào' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal thêm tỉnh -->
    <div class="modal fade" :class="{ 'show d-block': showAddTinhModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Thêm địa chỉ</h5>
            <button type="button" class="btn-close" @click="closeAddTinhModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="themTinh">
              <div class="mb-3">
                <label class="form-label">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newTinh.tenTinh"
                  placeholder="Nhập tỉnh/thành phố"
                  maxlength="100"
                  :class="{ 'is-invalid': errors.tenTinh }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.tenTinh">{{ errors.tenTinh }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newTinh.diaChi"
                  placeholder="Nhập địa chỉ"
                  maxlength="200"
                  :class="{ 'is-invalid': errors.diaChi }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.diaChi">{{ errors.diaChi }}</div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeAddTinhModal">Hủy</button>
            <button
              type="button"
              class="btn btn-success"
              @click="themTinh"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': showAddTinhModal }" v-if="showAddTinhModal" @click="closeAddTinhModal"></div>

    <!-- Modal chỉnh sửa tỉnh -->
    <div class="modal fade" :class="{ 'show d-block': showEditTinhModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Chỉnh sửa tỉnh</h5>
            <button type="button" class="btn-close" @click="closeEditTinhModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="capNhatTinh">
              <div class="mb-3">
                <label class="form-label">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="editTinh.tenTinh"
                  placeholder="Nhập tỉnh/thành phố"
                  maxlength="100"
                  :class="{ 'is-invalid': errors.tenTinh }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.tenTinh">{{ errors.tenTinh }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="editTinh.diaChi"
                  placeholder="Nhập địa chỉ"
                  maxlength="200"
                  :class="{ 'is-invalid': errors.diaChi }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.diaChi">{{ errors.diaChi }}</div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditTinhModal">Hủy</button>
            <button
              type="button"
              class="btn btn-success"
              @click="capNhatTinh"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': showEditTinhModal }" v-if="showEditTinhModal" @click="closeEditTinhModal"></div>

    <!-- Modal phường trực thuộc -->
    <div class="modal fade" :class="{ 'show d-block': showPhuongModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Phường trực thuộc</h5>
            <button type="button" class="btn-close" @click="closePhuongModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="themPhuong" class="mb-4">
              <div class="mb-3">
                <label class="form-label">Xã/Phường <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newPhuong.tenPhuong"
                  placeholder="Nhập xã/phường"
                  maxlength="100"
                  :class="{ 'is-invalid': errors.tenPhuong }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.tenPhuong">{{ errors.tenPhuong }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa số nhà <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newPhuong.diaSoNha"
                  placeholder="Nhập địa số nhà"
                  maxlength="200"
                  :class="{ 'is-invalid': errors.diaSoNha }"
                  required
                />
                <div class="invalid-feedback" v-if="errors.diaSoNha">{{ errors.diaSoNha }}</div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="closePhuongModal">Hủy</button>
                <button
                  type="button"
                  class="btn btn-success"
                  @click="themPhuong"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Thêm
                </button>
              </div>
            </form>
            <h6 class="fw-bold mb-3">Danh sách phường</h6>
            <ul class="list-group">
              <li
                v-for="(phuong, pIndex) in currentTinh.phuongs"
                :key="pIndex"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                {{ phuong.tenPhuong }} - {{ phuong.diaSoNha }}
                <button class="btn btn-sm btn-outline-danger" @click="xoaPhuong(pIndex)">Xóa</button>
              </li>
              <li v-if="!currentTinh.phuongs || currentTinh.phuongs.length === 0" class="list-group-item text-muted">
                Chưa có phường nào
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': showPhuongModal }" v-if="showPhuongModal" @click="closePhuongModal"></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      showAddTinhModal: false,
      showEditTinhModal: false,
      showPhuongModal: false,
      newTinh: { tenTinh: '', diaChi: '' },
      editTinh: { tenTinh: '', diaChi: '', id: null },
      newPhuong: { tenPhuong: '', diaSoNha: '' },
      tinhs: [], // Danh sách tỉnh từ API
      selectedTinhIndex: null,
      currentTinh: { phuongs: [] },
      searchQuery: '',
      submitting: false,
      error: '',
      errors: {
        tenTinh: '',
        diaChi: '',
        tenPhuong: '',
        diaSoNha: ''
      }
    };
  },
  computed: {
    filteredTinhs() {
      if (!this.searchQuery) {
        return this.tinhs;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.tinhs.filter(tinh =>
        (tinh.tenTinh?.toLowerCase() || '').includes(query) ||
        (tinh.diaChi?.toLowerCase() || '').includes(query)
      );
    }
  },
  created() {
    this.fetchTinhs();
  },
  methods: {
    fetchTinhs() {
      // gắn API GET ở đây
    },
    async themTinh() {
      this.errors.tenTinh = '';
      this.errors.diaChi = '';
      this.error = '';
      this.submitting = true;

      if (!this.newTinh.tenTinh) {
        this.errors.tenTinh = 'Vui lòng nhập tỉnh/thành phố.';
        this.submitting = false;
        return;
      }
      if (!this.newTinh.diaChi) {
        this.errors.diaChi = 'Vui lòng nhập địa chỉ.';
        this.submitting = false;
        return;
      }

      try {
        // gắn API POST ở đây
      
        this.closeAddTinhModal();
      } catch (err) {
        this.error = err.response?.data?.message || 'Thêm tỉnh thất bại!';
      } finally {
        this.submitting = false;
      }
    },
    openEditTinhModal(index) {
      this.selectedTinhIndex = index;
      this.editTinh = { ...this.tinhs[index] };
      this.showEditTinhModal = true;
    },
    async capNhatTinh() {
      this.errors.tenTinh = '';
      this.errors.diaChi = '';
      this.error = '';
      this.submitting = true;

      if (!this.editTinh.tenTinh) {
        this.errors.tenTinh = 'Vui lòng nhập tỉnh/thành phố.';
        this.submitting = false;
        return;
      }
      if (!this.editTinh.diaChi) {
        this.errors.diaChi = 'Vui lòng nhập địa chỉ.';
        this.submitting = false;
        return;
      }

      try {
        // gắn API PUT ở đây
       
        this.closeEditTinhModal();
      } catch (err) {
        this.error = err.response?.data?.message || 'Cập nhật tỉnh thất bại!';
      } finally {
        this.submitting = false;
      }
    },
    openPhuongModal(index) {
      this.selectedTinhIndex = index;
      this.currentTinh = { ...this.tinhs[index], phuongs: this.tinhs[index].phuongs || [] };
      this.showPhuongModal = true;
    },
    async themPhuong() {
      this.errors.tenPhuong = '';
      this.errors.diaSoNha = '';
      this.error = '';
      this.submitting = true;

      if (!this.newPhuong.tenPhuong) {
        this.errors.tenPhuong = 'Vui lòng nhập xã/phường.';
        this.submitting = false;
        return;
      }
      if (!this.newPhuong.diaSoNha) {
        this.errors.diaSoNha = 'Vui lòng nhập địa số nhà.';
        this.submitting = false;
        return;
      }

      try {
        //  gắn API POST ở đây
        
        this.newPhuong = { tenPhuong: '', diaSoNha: '' };
      } catch (err) {
        this.error = err.response?.data?.message || 'Thêm phường thất bại!';
      } finally {
        this.submitting = false;
      }
    },
    async xoaPhuong(pIndex) {
      if (confirm('Bạn có chắc chắn muốn xóa phường này?')) {
        this.error = '';
        this.submitting = true;
        try {
          // gắn API DELETE ở đây
       
        } catch (err) {
          this.error = err.response?.data?.message || 'Xóa phường thất bại!';
        } finally {
          this.submitting = false;
        }
      }
    },
    closeAddTinhModal() {
      this.newTinh = { tenTinh: '', diaChi: '' };
      this.errors.tenTinh = '';
      this.errors.diaChi = '';
      this.error = '';
      this.showAddTinhModal = false;
    },
    closeEditTinhModal() {
      this.editTinh = { tenTinh: '', diaChi: '', id: null };
      this.errors.tenTinh = '';
      this.errors.diaChi = '';
      this.error = '';
      this.showEditTinhModal = false;
      this.selectedTinhIndex = null;
    },
    closePhuongModal() {
      this.newPhuong = { tenPhuong: '', diaSoNha: '' };
      this.errors.tenPhuong = '';
      this.errors.diaSoNha = '';
      this.error = '';
      this.showPhuongModal = false;
      this.selectedTinhIndex = null;
    }
  }
};
</script>

<style scoped>
.modal {
  display: none;
}
.modal.show {
  display: block;
}
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.dropdown-menu {
  min-width: 150px;
}
</style>
