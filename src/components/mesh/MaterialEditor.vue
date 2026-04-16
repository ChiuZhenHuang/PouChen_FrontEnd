<template>
  <v-container>
    <v-card outlined>
      <div v-if="item">
        <v-card-title>
          {{ item.name }}
        </v-card-title>

        <v-card-text>
          <v-row no-gutters density="comfortable">
            <v-col cols="12" md="6" class="pa-1">
              <label class="text-label-large">材質顏色(Color)</label>
              <v-text-field
                v-model="item.color"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                clearable
              >
                <template #prepend-inner>
                  <v-icon size="16" :style="{ color: item.color }">
                    mdi-square
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pa-1">
              <label class="text-label-large">基本售價(Price)</label>
              <v-text-field
                v-model.number="item.basePrice"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" class="pa-1 mt-2">
              <label class="d-flex justify-space-between">
                <span class="text-label-large"
                  >材質複雜度加成(Multiplier)
                </span>

                <span class="font-weight-semibold">{{
                  formatNumber(item.multiplier, 1)
                }}</span>
              </label>
              <v-slider
                v-model="tempMultiplier"
                @update:modelValue="updateMultiplier"
                color="teal-darken-3"
                :min="1"
                :max="5"
                hide-details
              >
                <template #prepend>
                  <v-tooltip text="減少" location="bottom">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        :disabled="item.multiplier <= 1"
                        @click="changeMultiplier(-0.1)"
                      >
                        mdi-minus
                      </v-icon>
                    </template>
                  </v-tooltip>
                </template>
                <template #append>
                  <v-tooltip text="增加" location="bottom">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        :disabled="item.multiplier >= 5"
                        @click="changeMultiplier(0.1)"
                      >
                        mdi-plus
                      </v-icon>
                    </template>
                  </v-tooltip>
                </template>
              </v-slider>
              <div class="d-flex justify-space-between text-body-small">
                <span>基礎(1.0x)</span>
                <span>極高(5.0x)</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
      <div
        v-else
        style="min-height: 210px"
        class="d-flex align-center justify-center text-grey"
      >
        未選擇模型零件
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import debounce from "debounce";
import { ref, watch, computed } from "vue";
import { useMeshStore } from "@/stores/meshStore";
import { formatNumber } from "@/utils/format";

const store = useMeshStore();
const item = computed(() => store.activeItem);

// 本地暫存multiplier
const tempMultiplier = ref(1);

// silder滑動更新全域，延遲觸發
const updateMultiplier = debounce(() => {
  store.updateActive({
    multiplier: tempMultiplier.value,
  });
}, 300);

// icon改變multiplier
function changeMultiplier(step: number) {
  tempMultiplier.value = Math.min(5, Math.max(1, tempMultiplier.value + step));

  updateMultiplier();
}

// 把全域multiplier帶給本地multiplier
watch(
  () => item.value?.multiplier,
  (val) => {
    // 切換前若updateMultiplier尚未執行就取消掉
    updateMultiplier.clear();

    tempMultiplier.value = val ?? 1;
  },
  { immediate: true }
);
</script>
