<template>
    <div class="d-flex align-items-center justify-content-center modal-overlay">
        <div class="card w-50 p-2">
            <div class="d-flex align-items-center justify-content-between">
                <h3>Thuộc tính hàng hóa</h3>
                <p class="fs-4 exit" @click="$emit('close')">X</p>
            </div>
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <a href="#listAttribute" class="nav-link active" data-bs-toggle="tab">Danh sách</a>
                </li>
                <li class="nav-item">
                    <a href="#add" class="nav-link" data-bs-toggle="tab">Thêm thuộc tính</a>
                </li>

            </ul>

            <div class="tab-content">
                <div id="listAttribute" class="container active tab-pane">
                    <div class="d-flex flex-wrap gap-4 mt-3">
                        <nav>
                            <input type="checkbox" name="" id="">RAM
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Độ phân giải
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Tần số quét
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Dung lượng lưu trữ
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Tính năng sạc
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Tính năng đặc biệt
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Card độ họa
                        </nav>
                        <nav>
                            <input type="checkbox" name="" id="">Ổ cứng
                        </nav>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-success">Thêm</button>
                    </div>
                </div>

                <div id="add" class="container tab-pane ">
                    <div>
                        <label for="txt" class="fw-bold">Tên thuộc tính:</label>
                        <input type="text" class="form-control" placeholder="Nhập tên thuộc tính" maxlength="50">
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-success">Thêm</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['close', 'saved']);
</script>

<style scoped>
/* .product-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
} */

nav {
    width: fit-content;
}

nav>input {
    margin-right: 5px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    min-height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.exit {
    cursor: pointer !important;
}
</style>