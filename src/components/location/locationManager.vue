<!-- src/pages/location/Location.vue -->
<script setup>
import { onMounted, ref, computed } from "vue";
import { locationService } from "../../services/locationService";

/* ===== state ===== */
const cities = ref([]);
const wards  = ref([]);
const selectCityId = ref(null);

/* --- Create City --- */
const cityForm = ref({ name: "", address: "" });
const citySubmit = ref(false);

/* --- Edit City --- */
const editCityForm = ref({ id: null, name: "", address: "" });
const editCitySubmit = ref(false);

/* --- Create Ward --- */
const wardForm = ref({ name: "", address: "" });
const wardSubmit = ref(false);

/* --- Edit Ward --- */
const editWardForm = ref({ id: null, name: "", address: "" });
const editWardSubmit = ref(false);

/* ===== load ===== */
async function getAllCity() {
  try { cities.value = await locationService.getAllLocation(); }
  catch (err) { console.log("Error load cities:", err); cities.value = []; }
}

async function getLocationByLocation(locationId) {
  try {
    wards.value = [];
    const res = await locationService.getLocationById(locationId);
    wards.value = res?.children || [];
  } catch (err) {
    console.log("Error get location by id:", err);
    wards.value = [];
  }
}

/* ===== validation ===== */
const maxName = 50, maxAddr = 100;

const cityErrors = computed(() => {
  const e = {}, v = cityForm.value;
  if (!v.name?.trim()) e.name = "Vui lòng nhập Tỉnh/Thành phố.";
  else if (v.name.length > maxName) e.name = `Không vượt quá ${maxName} ký tự.`;
  if (!v.address?.trim()) e.address = "Vui lòng nhập Địa chỉ.";
  else if (v.address.length > maxAddr) e.address = `Không vượt quá ${maxAddr} ký tự.`;
  return e;
});

const editCityErrors = computed(() => {
  const e = {}, v = editCityForm.value;
  if (!v.name?.trim()) e.name = "Vui lòng nhập Tỉnh/Thành phố.";
  else if (v.name.length > maxName) e.name = `Không vượt quá ${maxName} ký tự.`;
  if (!v.address?.trim()) e.address = "Vui lòng nhập Địa chỉ.";
  else if (v.address.length > maxAddr) e.address = `Không vượt quá ${maxAddr} ký tự.`;
  return e;
});

const wardErrors = computed(() => {
  const e = {}, v = wardForm.value;
  if (!v.name?.trim()) e.name = "Vui lòng nhập Xã/Phường.";
  else if (v.name.length > maxName) e.name = `Không vượt quá ${maxName} ký tự.`;
  if (!v.address?.trim()) e.address = "Vui lòng nhập Địa số nhà.";
  else if (v.address.length > maxAddr) e.address = `Không vượt quá ${maxAddr} ký tự.`;
  if (!selectCityId.value) e.city = "Chưa chọn tỉnh ở danh sách ngoài.";
  return e;
});

const editWardErrors = computed(() => {
  const e = {}, v = editWardForm.value;
  if (!v.name?.trim()) e.name = "Vui lòng nhập Xã/Phường.";
  else if (v.name.length > maxName) e.name = `Không vượt quá ${maxName} ký tự.`;
  if (!v.address?.trim()) e.address = "Vui lòng nhập Địa số nhà.";
  else if (v.address.length > maxAddr) e.address = `Không vượt quá ${maxAddr} ký tự.`;
  return e;
});

/* ------------- CITY--------- */
async function createCity() {
  citySubmit.value = true;
  if (Object.keys(cityErrors.value).length) return;
  try {
    await locationService.createLocation({ ...cityForm.value });
    cityForm.value = { name: "", address: "" };
    citySubmit.value = false;
    await getAllCity();
    bootstrap.Modal.getInstance(document.getElementById("addLocationModal"))?.hide();
    alert("Thêm tỉnh/thành phố thành công!");
  } catch { console.log("Error create city"); }
}

function openEditModal(city) {
  editCityForm.value = { id: city.id, name: city.name, address: city.address };
  editCitySubmit.value = false;
}

async function updateCity() {
  editCitySubmit.value = true;
  if (Object.keys(editCityErrors.value).length) return;
  try {
    await locationService.updateLocation(editCityForm.value.id, {
      name: editCityForm.value.name,
      address: editCityForm.value.address,
    });
    await getAllCity();
    bootstrap.Modal.getInstance(document.getElementById("editLocationModal"))?.hide();
    alert("Cập nhật tỉnh/thành phố thành công!");
  } catch (err) { console.log("Error update city:", err); }
}

async function removeCity(id) {
  if (!confirm("Xóa tỉnh/thành phố này?")) return;
  try {
    await locationService.deleteLocation?.(id);
    if (selectCityId.value === id) { selectCityId.value = null; wards.value = []; }
    await getAllCity();
  } catch (err) { console.log("Error delete city:", err); }
}

/* ---------------------- WARD -----------*/
async function createWard() {
  wardSubmit.value = true;
  if (Object.keys(wardErrors.value).length) return;
  try {
    await locationService.createLocation({
      name: wardForm.value.name,
      address: wardForm.value.address,
      parentId: selectCityId.value,
    });
    wardForm.value = { name: "", address: "" };
    wardSubmit.value = false;
    await getLocationByLocation(selectCityId.value);
    alert("Thêm phường thành công!");
  } catch { console.log("Error create ward"); }
}

function openEditWardModal(w) {
  editWardForm.value = { id: w.id, name: w.name, address: w.address };
  editWardSubmit.value = false;
}

async function updateWard() {
  editWardSubmit.value = true;
  if (Object.keys(editWardErrors.value).length) return;
  try {
    await locationService.updateLocation(editWardForm.value.id, {
      name: editWardForm.value.name,
      address: editWardForm.value.address,
      parentId: selectCityId.value
    });
    await getLocationByLocation(selectCityId.value);
    getAllCity();
    bootstrap.Modal.getInstance(document.getElementById("editWardModal"))?.hide();
    alert("Cập nhật phường thành công!");
  } catch (err) { console.log("Error update ward:", err); }
}

async function removeWard(id) {
  if (!confirm("Xóa phường này?")) return;
  try {
    await locationService.deleteLocation?.(id);
    await getLocationByLocation(selectCityId.value);
  } catch (err) { console.log("Error delete ward:", err); }
}


onMounted(getAllCity);
</script>

<template>
  <div class="container py-5" style="max-width: 1000px">
    <!-- header + search -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center gap-2">
        <div class="position-relative">
          <input type="text" class="form-control" placeholder="Nhập tên tỉnh" maxlength="100" />
        </div>
      </div>
      <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addLocationModal">+ Thêm địa chỉ</button>
    </div>

    <!-- cities table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-3">Danh sách tỉnh</h5>
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Tên tỉnh</th>
              <th>Địa chỉ</th>
              <th class="text-center" style="width: 190px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, index) in cities" :key="c.id || index">
              <td>{{ index + 1 }}</td>
              <td>{{ c.name }}</td>
              <td>{{ c.address }}</td>
              <td class="text-center">
                <div class="row-actions">
                  <button class="btn btn-outline-warning btn-icon" title="Chỉnh sửa"
                          data-bs-toggle="modal" data-bs-target="#editLocationModal"
                          @click="openEditModal(c)">
                    <i class="fas fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-outline-primary btn-icon" title="Phường trực thuộc"
                          data-bs-toggle="modal" data-bs-target="#wardModal"
                          @click="selectCityId = c.id; getLocationByLocation(c.id);">
                    <i class="fa-solid fa-table-list"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-icon" title="Xóa"
                          @click="removeCity(c.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!cities.length"><td colspan="4" class="text-center text-muted">Chưa có tỉnh nào</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: create city -->
    <div class="modal fade" id="addLocationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Thêm địa chỉ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createCity">
              <div class="mb-3">
                <label class="form-label">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                <input v-model.trim="cityForm.name" :class="['form-control', citySubmit && cityErrors.name && 'is-invalid']"
                       maxlength="50" placeholder="Nhập tỉnh/thành phố" />
                <div v-if="citySubmit && cityErrors.name" class="invalid-feedback">{{ cityErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input v-model.trim="cityForm.address" :class="['form-control', citySubmit && cityErrors.address && 'is-invalid']"
                       maxlength="100" placeholder="Nhập địa chỉ" />
                <div v-if="citySubmit && cityErrors.address" class="invalid-feedback">{{ cityErrors.address }}</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-success">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: update city -->
    <div class="modal fade" id="editLocationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Chỉnh sửa tỉnh</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateCity">
              <div class="mb-3">
                <label class="form-label">Tỉnh/Thành phố</label>
                <input v-model.trim="editCityForm.name" :class="['form-control', editCitySubmit && editCityErrors.name && 'is-invalid']"
                       maxlength="50" />
                <div v-if="editCitySubmit && editCityErrors.name" class="invalid-feedback">{{ editCityErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input v-model.trim="editCityForm.address" :class="['form-control', editCitySubmit && editCityErrors.address && 'is-invalid']"
                       maxlength="100" />
                <div v-if="editCitySubmit && editCityErrors.address" class="invalid-feedback">{{ editCityErrors.address }}</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: wards of a city -->
    <div class="modal fade" id="wardModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xxl">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Phường trực thuộc</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- create ward -->
            <form class="row g-3 mb-4" @submit.prevent="createWard">
              <div class="col-md-5">
                <label class="form-label">Xã/Phường <span class="text-danger">*</span></label>
                <input v-model.trim="wardForm.name" :class="['form-control', wardSubmit && wardErrors.name && 'is-invalid']"
                       maxlength="50" placeholder="Nhập xã/phường" />
                <div v-if="wardSubmit && wardErrors.name" class="invalid-feedback">{{ wardErrors.name }}</div>
              </div>
              <div class="col-md-5">
                <label class="form-label">Địa số nhà <span class="text-danger">*</span></label>
                <input v-model.trim="wardForm.address" :class="['form-control', wardSubmit && wardErrors.address && 'is-invalid']"
                       maxlength="100" placeholder="Nhập địa số nhà" />
                <div v-if="wardSubmit && wardErrors.address" class="invalid-feedback">{{ wardErrors.address }}</div>
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-success w-100">+ Thêm</button>
              </div>
              <div v-if="wardSubmit && wardErrors.city" class="col-12 text-danger small">{{ wardErrors.city }}</div>
            </form>

            <!-- wards table -->
            <table class="table table-bordered align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 10%">STT</th>
                  <th style="width: 30%">Tên Phường</th>
                  <th style="width: 40%">Địa chỉ</th>
                  <th class="text-center" style="width: 20%">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(w, index) in wards" :key="w.id || index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ w?.name }}</td>
                  <td>{{ w?.address }}</td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="btn btn-outline-warning btn-icon" title="Cập nhật"
                              data-bs-toggle="modal" data-bs-target="#editWardModal"
                              @click="openEditWardModal(w)">
                        <i class="fas fa-pen-to-square"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-icon" title="Xóa" @click="removeWard(w.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!wards.length"><td colspan="4" class="text-center text-muted">Chưa có phường</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: update ward -->
    <div class="modal fade" id="editWardModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Cập nhật phường</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateWard">
              <div class="mb-3">
                <label class="form-label">Xã/Phường <span class="text-danger">*</span></label>
                <input v-model.trim="editWardForm.name" :class="['form-control', editWardSubmit && editWardErrors.name && 'is-invalid']"
                       maxlength="50" />
                <div v-if="editWardSubmit && editWardErrors.name" class="invalid-feedback">{{ editWardErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa số nhà <span class="text-danger">*</span></label>
                <input v-model.trim="editWardForm.address" :class="['form-control', editWardSubmit && editWardErrors.address && 'is-invalid']"
                       maxlength="100" />
                <div v-if="editWardSubmit && editWardErrors.address" class="invalid-feedback">{{ editWardErrors.address }}</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); }

/* Wards modal sizing */
#wardModal .modal-dialog.modal-xxl { max-width: 90vw; width: 90vw; }
@media (min-width: 1200px){ #wardModal .modal-dialog.modal-xxl { max-width: 1100px; } }
#wardModal .modal-body { max-height: 70vh; overflow-y: auto; padding-right: 1rem; }

/* Row actions (icon buttons) */
.row-actions { display: inline-flex; gap: 10px; }
.btn-icon{
  width: 40px; height: 40px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 12px; font-size: 18px; line-height: 1;
}
.btn-outline-warning{ border-color:#f4c016; color:#f4c016; background:#fff; }
.btn-outline-warning:hover{ background:rgba(244,192,22,.12); color:#bf900c; border-color:#f4c016; }
.btn-outline-danger{ border-color:#ef4444; color:#ef4444; background:#fff; }
.btn-outline-danger:hover{ background:rgba(239,68,68,.12); color:#b91c1c; border-color:#ef4444; }
/* Thêm viền/màu primary cho nút “Phường trực thuộc” cho đồng bộ */
.btn-outline-primary{ border-color:#60a5fa; color:#2563eb; background:#fff; }
.btn-outline-primary:hover{ background:rgba(59,130,246,.12); color:#1d4ed8; border-color:#60a5fa; }
</style>
