import { ref} from "vue";

const isOpen = ref(false);
const sidebarRef = ref(null);
const buttonRef = ref(null); 

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};
const closeSidebar = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (isOpen.value && sidebarRef.value && !sidebarRef.value.contains(event.target) 
    && !(buttonRef.value && buttonRef.value.contains(event.target))) {
 
    isOpen.value = false;
  }


};



export default {
  isOpen,
  sidebarRef,
  buttonRef,
  toggleSidebar,
  closeSidebar,
  handleClickOutside,
};