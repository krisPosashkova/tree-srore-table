import { createApp } from 'vue'
import App from './App.vue'
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from "ag-grid-enterprise";
import { KEY_AG } from '@/constants'

LicenseManager.setLicenseKey(KEY_AG);

ModuleRegistry.registerModules([
  AllEnterpriseModule
]);

createApp(App).mount('#app')
