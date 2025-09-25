<script setup>
import { onMounted, ref } from "vue";
import { locationService } from "../../services/locationService";

const cities = ref([]);
const wards = ref([]);
const selectCityId = ref(null);
const cityForm = ref({
  name: "",
  address: "",
});

const editCityForm = ref({
  id: null,
  name: "",
  address: "",
});

async function getAllCity() {
  try {
    cities.value = await locationService.getAllLocation();
    console.log(cities.value);
  } catch (err) {
    console.log("Error load cities: ", err);
  }
}

// ------------------- WARD ----------------------------------

async function getLocationByLocation(locationId) {
  try {
    wards.value = [];
    const response = await locationService.getLocationById(locationId);
    wards.value = response.children || [];
    console.log("ward data: ", wards.value);
  } catch (err) {
    console.log("Error get location by id", err);
  }
}

async function createCity() {
  try {
    await locationService.createLocation(cityForm.value);
    cityForm.value = { name: "", address: "" };
    getAllCity();
  } catch (err) {
    console.log("Error create city");
  }
}

function openEditModal(city) {
  console.log("city from table:", city);
  editCityForm.value = {
    id: city.id,
    name: city.name,
    address: city.address,
  };
  console.log(editCityForm.value);
}

async function updateCity() {
  console.log("Prep update: ", editCityForm.value);
  try {
    const responseUp = await locationService.updateLocation(
      editCityForm.value.id,
      {
        name: editCityForm.value.name,
        address: editCityForm.value.address,
      }
    );

    console.log("update", responseUp);
    getAllCity();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editLocationModal")
    );
    modal?.hide();
  } catch (err) {
    console.log("Error update city:", err);
  }
}

const wardForm = ref({
  name: '',
  address: ''
});

async function createWard() {
  if (!selectCityId.value) {
    console.log("City ID not selected");
    return;
  }

  try {
    await locationService.createLocation({
      name: wardForm.value.name,
      address: wardForm.value.address,
      parentId: selectCityId.value,
    });

    wardForm.value = { name: "", address: "" };

    await getLocationByLocation(selectCityId.value);
  } catch (err) {
    console.log("Error create ward:", err);
  }
}

const editWardForm = ref({
  id: null,
  name: "",
  address: ""
});

function openEditWardModal(w) {
  editWardForm.value = {
    id: w.id,
    name: w.name,
    address: w.address
  };
}

async function updateWard() {
  try {
    await locationService.updateLocation(editWardForm.value.id, {
      name: editWardForm.value.name,
      address: editWardForm.value.address
    });

    await getLocationByLocation(selectCityId.value);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editWardModal")
    );
    modal?.hide();
  } catch (err) {
    console.log("Error update ward:", err);
  }
}


onMounted(() => {
  getAllCity();
});
</script>

<template>
  <div class="container py-5" style="max-width: 1000px">
    
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center gap-2">
        <div class="position-relative">
          <input type="text" class="form-control" placeholder="Nhập tên tỉnh" maxlength="100" />
        </div>
      </div>

      <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addLocationModal">
        + Thêm địa chỉ
      </button>
    </div>

    <!-- Table city -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-3">Danh sách tỉnh</h5>

        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Tên tỉnh</th>
              <th>Địa chỉ</th>
              <th class="text-center" style="width: 100px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, index) in cities" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ c.name }}</td>
              <td>{{ c.address }}</td>
              <td class="text-center">
                <div class="dropdown">
                  <button class="btn btn-sm btn-link text-dark" type="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <span class="fw-bold fs-5">⋮</span>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editLocationModal"
                        @click="openEditModal(c)">
                        Chỉnh sửa
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#wardModal" @click="
                        selectCityId = c.id;
                      getLocationByLocation(c.id);
                      ">
                        Phường trực thuộc
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr>
              <!-- <td colspan="3" class="text-center text-muted py-3">
                Chưa có tỉnh nào
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal create city -->
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
                <input v-model.trim="cityForm.name" type="text" class="form-control"
                  placeholder="Nhập tỉnh/thành phố" />
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input v-model.trim="cityForm.address" type="text" class="form-control" placeholder="Nhập địa chỉ" />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="submit" class="btn btn-success">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal update city -->
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
                <input v-model.trim="editCityForm.name" type="text" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input v-model.trim="editCityForm.address" type="text" class="form-control" />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="submit" class="btn btn-success">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal table ward -->

    <div class="modal fade" id="wardModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xxl">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Phường trực thuộc</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">

            <form class="row g-3 mb-4" @submit.prevent="createWard">
              <div class="col-md-5">
                <label class="form-label">Xã/Phường</label>
                <input v-model.trim="wardForm.name" type="text" class="form-control" placeholder="Nhập xã/phường" />
              </div>
              <div class="col-md-5">
                <label class="form-label">Địa số nhà</label>
                <input v-model.trim="wardForm.address" type="text" class="form-control" placeholder="Nhập địa số nhà" />
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-success w-100">
                  + Thêm
                </button>
              </div>
            </form>

            <!-- table ward -->
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
                <tr v-for="(w, index) in wards" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ w?.name }}</td>
                  <td>{{ w?.address }}</td>
                  <td class="text-center">
                    <button @click="openEditWardModal(w)" class="btn btn-sm btn-primary me-2" data-bs-toggle="modal"
                      data-bs-target="#editWardModal">
                      Cập nhật
                    </button>
                    <button class="btn btn-sm btn-outline-danger">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal update ward -->
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
                <label class="form-label">Xã/Phường</label>
                <input v-model.trim="editWardForm.name" type="text" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Địa số nhà</label>
                <input v-model.trim="editWardForm.address" type="text" class="form-control" />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="submit" class="btn btn-success">Lưu</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
  min-width: 150px;
}

#wardModal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem;
}


#wardModal .modal-dialog.modal-xxl {
  max-width: 90vw;
  width: 90vw;
}

@media (min-width: 1200px) {
  #wardModal .modal-dialog.modal-xxl {
    max-width: 1100px;
  }
}


#wardModal table {
  width: 100%;
}


#wardModal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem;
}
</style>
