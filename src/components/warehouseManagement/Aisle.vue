<template>
  <div class="aisle-management">
    <div v-if="showFrom" class="d-flex justify-content-end align-items-center mb-4">
      <button @click="showFrom = false"> + Add Aisle</button>
    </div>

    <div v-if="showFrom">
      <div v-if="aisles.length > 0">
        <table class="table table-bordered mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="aisle in aisles" :key="aisle.id">
              <td>{{ aisle.id }}</td>
              <td>{{ aisle.name }}</td>
              <td>{{ aisle.code }}</td>
              <td class="d-flex gap-2">
                <button @click="editAisle(aisle)">Edit</button>
                <button @click="deleteAisle(aisle.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>No aisles available.</div>
    </div>


    <div v-else class="mb-4">
      <div @click="showFrom = true" class="fs-4 link">
        < </div>
          <div class="w-50 m-auto">
            <h2 class="text-center">Aisle Management</h2>
            <form class="d-flex flex-column gap-3 mt-3" @submit.prevent="handleSubmit">
              <input v-model="form.name" placeholder="Aisle Name" required />
              <input v-model="form.code" placeholder="Aisle Code" required />
              <div class="d-flex gap-3">
                <button type="submit">{{ isEdit ? 'Update' : 'Add' }}</button>
                <button v-if="isEdit" type="button" @click="showFrom = true">Cancel</button>
              </div>
            </form>
          </div>
      </div>

    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const form = ref({ id: null, name: '', code: '' })
const isEdit = ref(false)
const showFrom = ref(true)
const warehouseId = route.params.id
const zoneId = route.params.id


const aisles = ref([
  { id: 1, name: 'Aisle 1', code: 'A1' },
  { id: 2, name: 'Aisle 2', code: 'A2' }
])


function handleSubmit() {
  if (isEdit.value) {
    const idx = aisles.value.findIndex(a => a.id === form.value.id)
    if (idx !== -1) aisles.value[idx] = { ...form.value }
  } else {
    const newId = aisles.value.length ? Math.max(...aisles.value.map(a => a.id)) + 1 : 1
    aisles.value.push({ ...form.value, id: newId })
  }

  resetForm()
}

function editAisle(aisle) {
  form.value = { ...aisle }
  isEdit.value = true
  showFrom.value = false
}

function deleteAisle(id) {
  aisles.value = aisles.value.filter(a => a.id !== id)
  resetForm()
}

function resetForm() {
  form.value = { id: null, name: '', code: '' }
  isEdit.value = false
}
</script>


<style scoped>
.aisle-management {
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