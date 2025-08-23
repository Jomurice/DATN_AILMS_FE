<template>
    <div class="profile-container p-6 d-flex gap-3">

        <div class="profile md:col-span-2 bg-white rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>
            <div class="space-y-3">
                <p class="text"><span class="text-gray-500 px-1">Mã NV:</span> {{ employee.username }}</p>
                <p class="text"><span class="text-gray-500 px-1">Họ tên:</span> {{ employee.name }}</p>
                <p class="text"><span class="text-gray-500 px-1">Giới tính:</span> {{ employee.gender }} </p>
                <p class="text"><span class="text-gray-500 px-1">Ngày sinh:</span> {{ formatDate(employee.dob) }}</p>
                <p class="text"><span class="text-gray-500 px-1">Điện thoại:</span> {{ employee.phone }}</p>
                <p class="text"><span class="text-gray-500 px-1">Email:</span> {{ employee.email }}</p>
                <p class="text"><span class="text-gray-500 px-1">Địa chỉ:</span> {{ employee.address }}</p>
                <p class="text"><span class="text-gray-500 px-1">Role:</span>
                    <span class="font-semibold text-blue-600 px-1">{{ employee.role }}</span>
                </p>
            </div>

            <div>
                <button class=" btn">Change Password</button>
            </div>
        </div>


        <div class=" p-6">
            <img class=" img w-100 object-cover border rounded-full mb-4" src="/public/z6827970432778_2b43b97a704617f03c546e5bc7bd82e8.jpg" alt="Employee Avatar" />
            <p class="text-gray-600 text-sm">Ảnh thẻ nhân viên</p>
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const employee = ref({
    username: "NV002",
    name: "Nguyễn Văn A",
    dob: "1995-05-15",
    phone: "0987654321",
    email: "nguyenvana@company.com",
    gender: "Nam",
    address: "KCN VSIP, Thuận An, Bình Dương",
    role: "Warehouse Operator",
    avatar: ""
});


async function load() {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8080/identity/users/my-info/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        employee.value = response.data.result;
    } catch (error) {
        console.log("Error fetching employee data:", error);
    }
}



const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

onMounted(() => {
    load();
});

</script>

<style scoped>
body {
    background: #f3f4f6;
}

.profile-container {
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.img {
    width: 30%;
    max-height: 350px;
    border-radius: 800px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile {
    width: 70%;
    padding-left: 20px;
    margin-left: 30px;
}

.text {
    font-size: 18px;
    color: #333;
    line-height: 2.5;
}

.btn {
    background-color: #f59e0b;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn:hover {
    background-color: #134ef1;
    color: rgb(18, 17, 17);
}

</style>
