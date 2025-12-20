<template>
    <div class="warehouse-management gap-4">

        <div>
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
import { warehouseService } from '../../../services/WarehouseService';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const warehouseId = route.params.id;
const form = ref({ 
    id: null, 
    name: '', 
    location: '' 
});


async function load() {
    try {
        form.value = warehouseService.getById(warehouseId);
    } catch (error) {
        console.error('Failed to load warehouse:', error);
    }
}

async function handleSubmit() {
    try {
        await warehouseService.create(form.value);
        resetForm();
        router.push('/warehouse')
    } catch (error) {
        console.error('Failed to create warehouse:', error);
    }
}


async function updated(id) {
    try {
        await warehouseService.update(id, form.value);
        resetForm();
        router.push('/warehouse')
    } catch (error) {
        console.error('Failed to update warehouse:', error);
    }
}

function enable(id) {
    try {
        warehouseService.enable(id);
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

</style>