<template>
  <div class="home-dashboard">
    <SalesDashboard v-if="currentRole === 'salesman'" />
    <DesignerDashboard v-else-if="currentRole === 'designer'" />
    <DesignerManagerDashboard v-else-if="currentRole === 'admin'" />
    <ProductionDashboard v-else-if="currentRole === 'production'" />
    <QualityDashboard v-else-if="currentRole === 'quality'" />
    <FinanceDashboard v-else-if="currentRole === 'finance'" />
    <WarehouseDashboard v-else-if="currentRole === 'warehouse'" />
    <!-- <AdminDashboard v-else-if="currentRole === 'admin'" /> -->
    <FallbackDashboard v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserInfo } from '@/stores/userInfo'
import SalesDashboard from './components/salesDashboard.vue'
import DesignerDashboard from './components/designerDashboard.vue'
import DesignerManagerDashboard from './components/designerManagerDashboard.vue'
import ProductionDashboard from './components/productionDashboard.vue'
import QualityDashboard from './components/qualityDashboard.vue'
import FinanceDashboard from './components/financeDashboard.vue'
import WarehouseDashboard from './components/warehouseDashboard.vue'
import AdminDashboard from './components/adminDashboard.vue'
import FallbackDashboard from './components/fallbackDashboard.vue'

const userStore = useUserInfo()

const currentRole = computed(() => {
  const roleCode = userStore.userInfos.roleCode || ''
  console.log('roleCode', roleCode)

  if (roleCode === 'salesman-self' || roleCode === 'salesman') {
    return 'salesman'
  }

  if (roleCode === 'designer') {
    return 'designer'
  }

  if (roleCode === 'designer-manager') {
    return 'designer-manager'
  }

  if (roleCode === 'production' || roleCode === 'production_manager') {
    return 'production'
  }

  if (roleCode === 'quality') {
    return 'quality'
  }

  if (roleCode === 'finance') {
    return 'finance'
  }

  if (roleCode === 'warehouse') {
    return 'warehouse'
  }

  if (roleCode === 'admin') {
    return 'admin'
  }

  return 'default'
})
</script>

<style scoped>
.home-dashboard {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
