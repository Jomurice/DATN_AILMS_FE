<template>
  <div class="row  justify-content-center">
    <div class="card rounded-4 p-3 w-75">

      <div class="d-flex align-items-center justify-content-between">
        <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h4>
        <button class="btn btn-outline-secondary" @click="$router.push('/product')"> ← Quay lại</button>
      </div>

      <div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="submitForm" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Mã SKU <span class="text-danger">*</span></label>
              <input v-model.trim="form.sku" class="form-control" placeholder="Nhập mã SKU" required />
            </div>

             <div class="col-md-6">
              <label class="form-label">Serial Prefix <span class="text-danger">*</span></label>
              <input v-model.trim="form.serialPrefix" class="form-control" placeholder="Nhập serial prefix" required />
            </div>

            <div class="col-md-8">
              <label class="form-label">Tên hàng hóa <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" :class="{ 'is-invalid': touched.name && nameError }"
                maxlength="255" placeholder="Nhập tên hàng hóa" required />
              <div class="invalid-feedback" v-if="touched.name">{{ nameError }}</div>
            </div>

            <div class="col-md-4" v-if="brands.length > 0">
              <label class="form-label">Thương hiệu <span class="text-danger">*</span></label>
              <Multiselect v-model="form.brandId" :options="brands.map(br => br.id)" :searchable="true" track-by="id"
                :custom-label="id => brands.find(br => br.id === id)?.name || '--'"
                placeholder="-- Chọn thương hiệu --">

                <template #noResult>
                  <div class="no-result-custom">Không thương hiệu bạn tìm !</div>
                </template>
              </Multiselect>
              <div class="invalid-feedback" v-if="touched.brand && brandError">{{ brandError }}</div>
            </div>

            <div class="col-md-4" v-if="categories.length > 0">
              <label class="form-label">Loại <span class="text-danger">*</span></label>
              <Multiselect v-model="form.categoryId" :options="categories.map(c => c.id)" :searchable="true"
                :custom-label="id => categories.find(c => c.id === id)?.name || '---'" placeholder="-- Chọn loại --">

                <template #noResult>
                  <div class="no-result-custom">Không có loại hàng bạn tìm !</div>
                </template>
              </Multiselect>
              <div class="invalid-feedback" v-if="touched.categoryId && categoryError">{{ categoryError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Màu sắc <span class="text-danger">*</span></label>
              <select name="" id="" v-model="form.color" class="form-select">
                <option value="">-- Chọn màu sắc --</option>
                <option value="Red">Đỏ</option>
                <option value="Black">Đen</option>
                <option value="Gold">Vàng kim</option>
                <option value="Phantom Black">Đen tuyền</option>
                <option value="Green">Xanh lá</option>
              </select>
              <div class="invalid-feedback" v-if="touched.color && colorError">{{ colorError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Dung lượng</label>
              <input v-model.trim="form.storage" class="form-control" />
            </div>



            <div class="col-md-4">
              <label for="txtThuoctinh">Thuộc tính khác:</label>
              <p class="addAttribute" @click="isModal = true">+ Thêm thuộc tính</p>
            </div>

            <div class="col-12">
              <label class="form-label">Thông số kỹ thuật</label>
              <textarea v-model.trim="form.specifications" class="form-control" rows="4" maxlength="1000"
                placeholder="VD: CPU..., RAM..., SSD..., Màn..."></textarea>
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="$router.push('/product')">Huỷ</button>
            </div>
          </form>
        </div>
      </div>

      <attribute v-if="isModal" @close="isModal = false" />

      <div v-if="isLoading" class="modal-overlay text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <div class="small mx-2 fs-5 text-info mt-2">Đang tải...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../../services/product/productService'
import { categoryService } from '../../services/categoryService'

import { brandService } from '../../services/BrandService'
import Attribute from './Attribute.vue'

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const isEdit = ref(false);
const isModal = ref(false);
const isLoading = ref(false);
const categories = ref([]);
const brands = ref([]);
const form = ref({ sku: '', name: '', brandId: null, specifications: '', color: '', storage: '',serialPrefix: '', categoryId: null })
const submitting = ref(false)
const error = ref('')
const touched = ref({ brand: false, name: false, brandId: false, color: false, categoryId: false })


const nameError = computed(() => {
  const v = form.value.name?.trim() || ''
  if (!v) return 'Vui lòng nhập tên sản phẩm.'
  if (v.length > 200) return 'Tên tối đa 200 ký tự.'
  return ''
})
const brandError = computed(() => {
  const v = form.value.brand?.trim() || ''
  if (!v) return 'Vui lòng nhập nhãn hiệu.'
  if (v.length > 50) return 'Nhãn hiệu tối đa 50 ký tự.'
  return ''
})
const colorError = computed(() => {
  const v = form.value.color?.trim() || ''
  if (!v) return 'Vui lòng nhập màu sắc.'
  if (v.length > 50) return 'Màu sắc tối đa 50 ký tự.'
  return ''
})
const categoryError = computed(() => (form.value.categoryId ? '' : 'Vui lòng chọn loại sản phẩm.'))

async function loadData() {
  isLoading.value = true;
  try {
    categories.value = await categoryService.getAll();
    brands.value = await brandService.getAllBrand();
    if (productId) {
      isEdit.value = true
      const p = await productService.getById(productId);
      if (p) form.value = { ...form.value, ...p };
    } else {
      isEdit.value = false;
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
}

async function submitForm() {

  // touched.value = { brand: true, name: true, color: true, categoryId: true }
  // if (brandError.value || colorError.value || nameError.value || categoryError.value) return
  // submitting.value = true; error.value = ''
  submitting.value = true;
  console.log(form.value);
  try {
    if (isEdit.value) await productService.update(productId, { ...form.value })
    else await productService.create({ ...form.value })

    router.push('/product')
  } catch (e) {
    error.value = 'Lưu thất bại.'
    console.log("error", e);

  } finally {
    submitting.value = false
  }
  console.log(form.value);
}



onMounted(loadData)

</script>

<style scoped>
.addAttribute {
  cursor: pointer !important;
}

.no-result-custom {
  padding: 10px;
  color: #dc3545;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgba(0, 0, 0, 0.147);
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

::v-deep(.multiselect__content-wrapper) {
  max-height: 200px;
  overflow-y: auto;
}

/* Hover highlight */
::v-deep(.multiselect__option--highlight) {
  background-color: #0d6efd !important;
  color: #fff !important;
  cursor: pointer;
  /* con trỏ pointer khi hover */
}

::v-deep(.multiselect__option--highlight::after) {
  content: none !important;
}


/* Selected + hover */
::v-deep(.multiselect__option--selected.multiselect__option--highlight) {
  background-color: #0b5ed7 !important;
  color: #fff !important;
}
</style>
