<template>
  <div class="bin-management">
    <!-- LIST -->
    <div v-if="ui==='list'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">
          Danh sách
        </h5>
        <button class="btn btn-primary" @click="openAdd">+ Add Bin</button>
      </div>

      <div v-if="items.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width:260px">ID</th>
              <th>Tên</th>
              <th>Mã</th>
              <th class="text-end">Sức chứa</th>
              <th class="text-end">Hiện có</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in items" :key="b.id">
              <td class="text-monospace small">{{ b.id }}</td>
              <td>{{ b.name }}</td>
              <td>{{ b.code }}</td>
              <td class="text-end">{{ b.capacity }}</td>
              <td class="text-end">{{ b.currentQty }}</td>
              <td class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-warning" @click="openEdit(b)">Edit</button>
                <button class="btn btn-sm btn-outline-info" @click="openDetail(b.id)">Detail</button>
                <button class="btn btn-sm btn-outline-danger" @click="remove(b.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted">Không có dữ liệu…</div>
    </div>

    <!-- FORM -->
    <div v-else-if="ui==='form'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">{{ isEdit ? 'Cập nhật Bin' : 'Thêm Bin' }}</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form class="row g-3" @submit.prevent="submit" novalidate>
            <div class="col-md-6">
              <label class="form-label">Tên Bin <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mã Code <span class="text-danger">*</span></label>
              <input v-model.trim="form.code" class="form-control" placeholder="VD: BIN-A1-S1" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Sức chứa (capacity) <span class="text-danger">*</span></label>
              <input v-model.number="form.capacity" type="number" min="1" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Hiện có (currentQty) <span class="text-danger">*</span></label>
              <input v-model.number="form.currentQty" type="number" min="0" :max="form.capacity || 1" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Preferred Product ID (tuỳ chọn)</label>
              <input v-model.number="form.preferredProductId" type="number" class="form-control" />
            </div>
            <div class="col-12 small text-muted">Context: wid={{ wid }}, zid={{ zid }}, aid={{ aid }}, sid={{ sid }}</div>
            <div class="col-12">
              <button class="btn btn-primary">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button type="button" class="btn btn-outline-secondary ms-2" @click="back">Huỷ</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DETAIL -->
    <div v-else-if="ui==='detail'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Chi tiết Bin</h5>
        <button class="btn btn-outline-secondary" @click="back">← Quay lại</button>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
          <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
          <div class="mb-2"><small class="text-muted">Mã code</small><div>{{ detail?.code }}</div></div>
          <div class="row">
            <div class="col-md-3 mb-2">
              <div class="text-muted small">Sức chứa</div><div>{{ detail?.capacity }}</div>
            </div>
            <div class="col-md-3 mb-2">
              <div class="text-muted small">Hiện có</div><div>{{ detail?.currentQty }}</div>
            </div>
            <div class="col-md-3 mb-2">
              <div class="text-muted small">Shelf</div><div>{{ detail?.shelf?.name || '—' }}</div>
            </div>
            <div class="col-md-3 mb-2">
              <div class="text-muted small">Preferred Product</div><div>{{ detail?.preferredProductId ?? '—' }}</div>
            </div>
          </div>

          <h6 class="fw-bold mt-4">Serial trong Bin ({{ detail?.productDetails?.length || 0 }})</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Serial</th><th>Sản phẩm</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr v-for="d in (detail?.productDetails || [])" :key="d.id">
                  <td>{{ d.serialNumber }}</td>
                  <td>{{ d.product?.sku }} — {{ d.product?.name }}</td>
                  <td>{{ toViStatus(d.status) }}</td>
                </tr>
                <tr v-if="!detail?.productDetails || detail?.productDetails.length===0">
                  <td colspan="3" class="text-center text-muted">Chưa có serial</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import { binService, viStatus } from "../../services/BinService"

const route = useRoute()
const wid = route.params.wid || route.params.id
const zid = route.params.zid || route.params.id
const aid = route.params.aid || route.params.id
const sid = route.params.sid // shelf id

const ui = ref("list")
const items = ref([])
const detail = ref(null)
const isEdit = ref(false)
const editingId = ref(null)
const form = ref({ name:"", code:"", capacity:1, currentQty:0, preferredProductId:null })

async function load(){ items.value = await binService.list(String(sid)) }

function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",code:"",capacity:1,currentQty:0,preferredProductId:null}; ui.value="form" }
function openEdit(b){ isEdit.value=true; editingId.value=b.id; form.value={ name:b.name||"", code:b.code||"", capacity:b.capacity??1, currentQty:b.currentQty??0, preferredProductId:b.preferredProductId ?? null }; ui.value="form" }
async function openDetail(id){ detail.value = await binService.getById(String(id)); ui.value="detail" }
function back(){ ui.value="list" }

async function submit(){
  if (form.value.currentQty > form.value.capacity) {
    alert("currentQty không được vượt quá capacity"); return
  }
  if (isEdit.value) await binService.update(String(editingId.value), { ...form.value, shelfId: sid })
  else await binService.create(String(sid), { ...form.value })
  await load(); back()
}
async function remove(id){ if(confirm("Xoá Bin này?")){ await binService.remove(String(id)); await load() } }

function toViStatus(s){ return viStatus(s) }

watch(() => form.value.capacity, c => {
  if (Number(form.value.currentQty) > Number(c)) form.value.currentQty = Number(c) || 0
})

onMounted(load)
</script>

<style scoped>
.bin-management{ padding:24px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.1) }
</style>
