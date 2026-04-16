<template>
  <v-container>
    <v-card outlined class="h-100" :style="mdAndUp && { minHeight: '524px' }">
      <v-card-title class="d-flex align-center">
        <v-icon size="20" color="teal-darken-3" start>mdi-content-copy</v-icon>
        模型零件清單
      </v-card-title>
      <v-divider />
      <v-card-text style="overflow-y: auto; max-height: 70vh">
        <v-list>
          <v-list-item
            v-for="item in store.list"
            :key="item.id"
            @click="store.setActive(item.id)"
            :active="item.id === store.activeId"
            clickable
            active-class="bg-teal-lighten-5 text-teal-darken-3"
            class="rounded mb-2 bg-white border"
          >
            <v-list-item-title class="text-label-large">
              {{ item.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ item.category }}
            </v-list-item-subtitle>

            <template #append>
              <div class="text-right d-flex align-center">
                <div class="mr-1">
                  ${{
                    formatThousands(
                      formatNumber(item.basePrice * item.multiplier)
                    )
                  }}
                </div>

                <v-icon size="16" :style="{ color: item.color }">
                  mdi-circle
                </v-icon>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { formatThousands, formatNumber } from "@/utils/format";
import { useMeshStore } from "@/stores/meshStore";
import { useDisplay } from "vuetify";

const store = useMeshStore();
const { mdAndUp } = useDisplay();
</script>
