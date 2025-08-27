<template>
  <div class="zone-management">


    <div v-if="showForm" class="mb-4">
      <h5 class="fw-bold mb-3">Danh sách zone</h5>  
      <div class="d-flex justify-content-end align-items-center mb-4">
        <button @click="showForm = false"> + Add Zone</button>
      </div>
      <div v-if="zones.length > 0">
        <table class="table table-bordered mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="zone in zones" :key="zone.id">
              <td>{{ zone.id }}</td>
              <td>{{ zone.name }}</td>
              <td>{{ zone.description }}</td>
              <td class="d-flex gap-2">
                <button @click="editZone(zone)">Edit</button>
                <router-link :to="`/warehouse/${warehouseId}/zone/${zone.id}/aisle`"><button>Show</button></router-link>
              </td>
            </tr>
          </tbody>

        </table>
      </div>
      <div v-else>Khong co du lieu.....</div>
    </div>

    <div v-else class="mb-4">
      <div @click="showForm = true" class="fs-4 link"> < </div>
      <div class="w-50 m-auto">
        <h2 class="text-center ">Zone Management</h2>
        <form class="d-flex flex-column gap-4 mt-4" @submit.prevent="handleSubmit">
          <input v-model="form.name" placeholder="Zone Name" required />
          <input v-model="form.description" placeholder="Description" />
          <div class="d-flex gap-2">
            <button type="submit">{{ isEdit ? 'Update' : 'Add' }}</button>
            <button v-if="isEdit" type="button" @click="showForm = true">Cancel</button>
            <button v-if="isEdit" type="button" @click="resetForm()">Reset</button>
          </div>
        </form>
      </div>
    </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {ZoneService} from '../../services/ZoneService';

const route = useRoute()
const showForm = ref(true)

const warehouseId = route.params.id

const zones = ref([
  { id: 1, name: 'Zone A', description: 'Main storage area' },
  { id: 2, name: 'Zone B', description: 'Secondary storage' }
])

const form = ref({ id: null, name: '', description: '' })
const isEdit = ref(false)


async function load() {
  try {
    zones.value = await ZoneService.getAllZones();
  } catch (error) {
    console.error('Failed to load zone',error);
  }
}

async function handleSubmit() {
    if (isEdit.value) {
    const idx = zones.value.findIndex(a => a.id === form.value.id)
    if (idx !== -1) zones.value[idx] = { ...form.value }
  } else {
    const newId = zones.value.length ? Math.max(...zones.value.map(a => a.id)) + 1 : 1
    zones.value.push({ ...form.value, id: newId })
  }
}

function editZone(zone) {
  form.value = { ...zone }
  isEdit.value = true
  showForm.value = false;
}


function resetForm() {
  form.value = { id: null, name: '', description: '' }
  isEdit.value = false
}

onMounted (() => {
  load();
})
</script>

<style scoped>
.zone-management {
  width: 100%;
  min-height: calc(100vh - 80px);
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.link {
  width: 15px;
  text-decoration: none;
  color: #080808;
  display: inline-block;
  cursor: pointer;
}

.link:hover {
  color: #3f20f0;
}

form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

button[type="button"] {
  background: #f59e0b;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>