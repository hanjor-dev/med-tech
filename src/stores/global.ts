import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobal = defineStore('global', () => {
  const asideCollapsed = ref(false);

  const toggleAside = () => {
    asideCollapsed.value = !asideCollapsed.value;
  };

  return { asideCollapsed, toggleAside };
});
