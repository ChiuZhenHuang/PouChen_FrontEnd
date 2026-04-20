<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" md="4" class="d-flex">
        <MeshList />
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column">
        <MaterialEditor />
        <BOMSummary />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import MeshList from "@/components/mesh/MeshList.vue";
import MaterialEditor from "@/components/mesh/MaterialEditor.vue";
import BOMSummary from "@/components/mesh/BOMSummary.vue";
import data from "@/data.json";

import { useMeshStore } from "@/stores/meshStore";

const store = useMeshStore();

onMounted(() => {
  store.setList(data);
});
</script>
