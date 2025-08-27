<template>
    <div class="warehouse-management gap-4">
            
        <div v-if="showFrom" class="px-4">
            <h5 class="fw-bold mb-3">Danh sách warehouse</h5>  
            <div class="d-flex justify-content-end align-items-center px-4 mb-4">
                <button @click="showFrom = false" >+ Add Warehouse</button>
            </div>
            <div v-if="warehouses.length > 0">
                <table border="1" class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="warehouse in warehouses" :key="warehouse.id">
                            <td>{{ warehouse.id }}</td>
                            <td>{{ warehouse.name }}</td>
                            <td>{{ warehouse.location }}</td>
                            <td class="d-flex gap-2">
                                <button @click="editWarehouse(warehouse.id)">Edit</button>
                                <router-link
                                    :to="`/warehouse/${warehouse.id}/zone`"><button>Show</button></router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div> 
            <div v-else>Khong co du lieu....</div>
        </div>
            

        <div v-else>
            <div @click="showFrom = true" class="d-flex fs-4 link"> < </div>
            <div class="form col-md-5">
                <h2>Warehouse Management</h2>
                <form class="w-100 gap-4" @submit.prevent="handleSubmit">
                    <input v-model="form.name" placeholder="Warehouse Name" class="" required />
                    <input v-model="form.location" placeholder="Location" required />

                    <div class="d-flex gap-3 mt-3">
                        <button type="submit">Add</button>
                        <button @click="updated(form.id)">update</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { warehouseService } from '../../services/WarehouseService';

const showFrom = ref(true);
const warehouses = ref([
    { id: 1, name: 'Warehouse A', location: 'Location A' },
    { id: 2, name: 'Warehouse B', location: 'Location B'}
])
const form = ref({ id: null, name: '', location: '' })


async function load() {
    try {
        warehouses.value = await warehouseService.getAll();
    } catch (error) {
        console.error('Failed to load warehouses:', error);
    }
}

async function handleSubmit() {
    try {
        await warehouseService.create(form.value);
        resetForm();
        showFrom.value = false;
    } catch (error) {
        console.error('Failed to create warehouse:', error);
    }
}

function editWarehouse(id) {
    try {
        const response = warehouseService.getById(id);
        form.value = { ...response }
        showFrom.value = true
    } catch (error) {
        console.error('Failed to fetch warehouse:', error);
    }
}

async function updated(id) {
    try {
        await warehouseService.update(id, form.value);
        resetForm();
        showFrom.value = false;
    } catch (error) {
        console.error('Failed to update warehouse:', error);
    }
}

function enable(id) {
    try {
        warehouseService.enable(id);
        showFrom.value = false;
    } catch (error) {
        console.error('Failed to enable warehouse:', error);
    }
}

function resetForm() {
    form.value = { id: null, name: '', location: '' }
    showFrom.value = false
}

onMounted(() => {
    load();
})
</script>

<style scoped>
.warehouse-management {
    max-width: 100%;
    min-height: 650px;
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

.form {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
}

form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

input {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

button {
    width: fit-content;
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    background: #2563eb;
    color: #fff;
    cursor: pointer;
}

button:hover {
    background: #db7508;
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