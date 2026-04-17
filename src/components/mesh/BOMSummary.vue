<template>
  <v-container>
    <v-card outlined>
      <v-card-title class="d-flex justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="20" color="teal-darken-3" start
            >mdi-cube-outline</v-icon
          >
          <span>BOM物料清單預估</span>
        </div>
        <p class="d-flex align-end my-0 text-grey text-body-small">
          總計{{ store.list.length }}項
        </p>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0" style="overflow-y: auto; max-height: 40vh">
        <v-data-table
          :items="store.list"
          :headers="header"
          :mobile="smAndDown"
          :hide-default-header="smAndDown"
          :items-per-page="-1"
          item-value="id"
          hover
          density="comfortable"
          hide-default-footer
        >
          <template #[`item.name`]="{ item }">
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <span v-bind="props">
                  {{ item.name }}
                </span>
              </template>
              <p class="my-0">材質：{{ item.metadata.material }}</p>
              <p class="my-0">重量：{{ item.metadata.weight }}</p>
            </v-tooltip>
          </template>

          <template #[`item.color`]="{ item }">
            <v-icon size="14" :style="{ color: item.color }">
              mdi-square
            </v-icon>
            {{ item.color }}
          </template>

          <template #[`item.price`]="{ item }">
            ${{ formatThousands(item.basePrice) }} x
            {{ formatNumber(item.multiplier, 1) }}
          </template>

          <template #[`item.total`]="{ item }">
            <span class="text-right text-teal-lighten-1">
              ${{
                formatThousands(formatNumber(item.basePrice * item.multiplier))
              }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <h3 class="my-0">
          專案總估價：
          <span class="text-teal-darken-3">
            ${{ formatThousands(formatNumber(store.totalBOM)) }}
          </span>
        </h3>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { formatThousands, formatNumber } from "@/utils/format";
import { useMeshStore } from "@/stores/meshStore";
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();
const store = useMeshStore();

const header = [
  {
    title: "零件名稱",
    value: "name",
    align: "start",
    minWidth: 120,
  },
  {
    title: "顏色預覽",
    value: "color",
    align: "start",
    minWidth: 110,
  },
  {
    title: "單價 x 加成",
    value: "price",
    align: "start",
    minWidth: 120,
  },
  {
    title: "小計",
    value: "total",
    align: "end",
    minWidth: 100,
  },
] as const;
</script>
