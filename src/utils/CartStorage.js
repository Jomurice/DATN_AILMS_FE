export const CartStorage = {  
    getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    },
    saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    },
    clearCart() {
        localStorage.removeItem("cart");
    },
};