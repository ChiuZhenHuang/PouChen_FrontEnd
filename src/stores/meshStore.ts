import { defineStore } from "pinia";
import type { MeshItem } from "@/types/mesh";

export const useMeshStore = defineStore("mesh", {
  state: () => ({
    list: [] as MeshItem[],
    activeId: "" as string,
  }),

  getters: {
    // 當前被選擇的模型零件
    activeItem(state) {
      return state.list.find((i) => i.id === state.activeId);
    },

    // BOM總價格
    totalBOM(state) {
      return state.list.reduce((sum, item) => {
        return sum + item.basePrice * item.multiplier;
      }, 0);
    },
  },

  actions: {
    // 抓所有list資料，如果當前沒active就選第一個
    setList(data: MeshItem[]) {
      this.list = data;
      if (!this.activeId && data.length) {
        this.activeId = data[0].id;
      }
    },

    // 選擇模型零件
    setActive(id: string) {
      this.activeId = id;
    },

    // 更新細項資料
    updateActive(payload: Partial<MeshItem>) {
      const idx = this.list.findIndex((i) => i.id === this.activeId);
      if (idx !== -1) {
        this.list[idx] = {
          ...this.list[idx],
          ...payload,
        };
      }
    },
  },
});
