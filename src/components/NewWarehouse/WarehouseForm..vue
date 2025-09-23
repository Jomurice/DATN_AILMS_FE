<template>
  <div class="d-flex justify-content-center">
    <div class="w-75 card p-3 rounded-4">

      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật kho' : 'Thêm kho mới' }}</h4>
        <button class="btn btn-outline-secondary" @click="$router.push('/warehousess')">← Quay lại</button>
      </div>

      <div>
        <div class="card-body">
          <form @submit.prevent="submit" class="row g-3">
            
            <div class="col-md-6">
              <label class="form-label">Tên kho <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" placeholder="Nhập tên kho"
                     maxlength="100" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Mã kho <span class="text-danger">*</span></label>
              <input v-model.trim="form.code" class="form-control" placeholder="Ví dụ: HN01, ZN01"
                     maxlength="20" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Loại kho <span class="text-danger">*</span></label>
              <select v-model="form.type" class="form-select" required>
                <option disabled value="">-- Chọn loại kho --</option>
                <option value="WAREHOUSE">Kho tổng</option>
                <option value="ZONE">Zone</option>
                <option value="AISLE">Aisle</option>
                <option value="SHELF">Shelf</option>
                <option value="BIN">Bin</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Sức chứa</label>
              <input type="number" v-model.number="form.capacity" class="form-control"
                     placeholder="Nhập sức chứa (nếu có)" min="0" />
            </div>

            <!-- <div class="col-md-6">
              <label class="form-label">Thuộc Location<span class="text-danger">*</span></label>
              <input v-model.trim="form.locationId" class="form-control" placeholder="Nhập Location ID"
                     required />
            </div> -->

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-success" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
              <button type="button" class="btn btn-outline-secondary"
                      @click="$router.push('/admin/warehouse')">Huỷ</button>
            </div>
          </form>

          <div v-if="error" class="text-danger mt-2">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { newWarehouseService } from '@/services/newWarehouseService'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const submitting = ref(false)
const error = ref('')
const warehouseId = route.params.id

const form = ref({
  name: '',
  code: '',
  type: '',
  capacity: null,
  locationId: 'd2cf5271-fb8d-47d8-af6a-483594b13445'
})

async function load() {
  if (warehouseId) {
    try {
      const data = await newWarehouseService.getById(warehouseId)
      if (data) {
        form.value = data
        isEdit.value = true
      }
    } catch (err) {
    
    }
  }
}

async function submit() {
  submitting.value = true
  

  try {
    if (isEdit.value) {
      await newWarehouseService.update(form.value.id, { ...form.value })
    } else {
      await newWarehouseService.create({ ...form.value })
    }
  
  } catch (err) {
   console.log(err)
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>
