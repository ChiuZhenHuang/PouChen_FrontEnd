<template>
  <v-dialog
    v-model="showThreeDialog"
    max-width="650px"
    @click:outside="closeThreeDialog"
  >
    <v-card rounded>
      <v-card-title
        class="bg-teal-darken-3 d-flex align-center justify-space-between"
      >
        <h3 class="my-1">{{ data?.name }}</h3>

        <v-btn icon variant="tonal" @click="closeThreeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Three.js -->
        <div ref="container" class="three-container" />

        <div class="d-flex align-center my-2">
          <sapn>大小：</sapn>
          <v-slider
            v-model="silderScale"
            :min="1"
            :max="3"
            :step="0.1"
            color="teal-darken-3"
            hide-details
          />
          <sapn class="ml-1">{{ silderScale }}</sapn>
        </div>

        <div class="d-flex align-center my-2">
          <sapn>轉速：</sapn>
          <v-slider
            v-model="silderSpeed"
            :min="0"
            :max="0.1"
            :step="0.001"
            color="teal-darken-3"
            hide-details
          />
          <sapn class="ml-1">{{ silderSpeed }}</sapn>
        </div>

        <div>
          <p>材質：{{ data?.metadata.material }}</p>
          <p>重量：{{ data?.metadata.weight }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useDebounceFn } from "@vueuse/core";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { MeshItem } from "@/types/mesh";

const showThreeDialog = defineModel<boolean>();
const props = defineProps<{ data: MeshItem | null }>();
const container = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;
let controls: OrbitControls;
let animationId: number;

const silderScale = ref(1.5);
const silderSpeed = ref(0.01);

// 映射材質
const materialMap: Record<string, any> = {
  "Aluminum 6061": { metalness: 1, roughness: 0.15 },
  Steel: { metalness: 0.8, roughness: 0.7 },
  "PBT Plastic": { metalness: 0, roughness: 0.85 },
  "Tempered Glass": {
    metalness: 0,
    roughness: 0,
    transmission: 1,
    transparent: true,
    opacity: 0.35,
    ior: 1.25,
    thickness: 0.2,
  },
};

// 設置材質 / 顏色
const getMaterial = (material?: string, color?: string) => {
  if (!material) {
    return new THREE.MeshStandardMaterial({ color: color || "#00ff00" });
  }
  const config = materialMap[material];
  if (material === "Tempered Glass") {
    return new THREE.MeshPhysicalMaterial({
      color: color || "#ffffff",
      ...(config as THREE.MeshPhysicalMaterialParameters),
    });
  }
  return new THREE.MeshStandardMaterial({
    color: color || "#cccccc",
    ...(config as THREE.MeshStandardMaterialParameters),
  });
};

const initThree = () => {
  // 建立場景
  scene = new THREE.Scene();

  // 建立相機
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  // 建立 renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);
  renderer.setClearColor("#1e2a33", 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2; // 建立物件（立方體）
  const geometry = new THREE.BoxGeometry();

  // 材質 / 顏色
  const material = getMaterial(
    props.data?.metadata?.material,
    props.data?.color,
  );
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 方向光
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5); // 斜上方照射
  scene.add(light);

  // OrbitControls（滑鼠控制視角）
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 動畫
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    cube.rotation.x += silderSpeed.value;
    cube.rotation.y += silderSpeed.value;
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
};

//延遲大小更新 (只有3D圖延遲)
const updateScale = useDebounceFn((val: number) => {
  cube.scale.set(val, val, val);
}, 300);

watch(silderScale, (val) => {
  if (!cube) return;

  updateScale(val);
});

// 資料改變 -> 帶動改變3D材質
watch(
  () => props.data,
  (val) => {
    if (!val || !cube) return;

    const newMaterial = getMaterial(val.metadata?.material, val.color);

    cube.material = newMaterial;
  },
  { immediate: true },
);

watch(showThreeDialog, (val) => {
  if (val) {
    silderScale.value = 1.5;
    silderSpeed.value = 0.01;

    nextTick(() => {
      initThree();
    });
  }
});

// 清除並釋放
const disposeScene = () => {
  scene?.traverse((obj: any) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
};

const closeThreeDialog = () => {
  showThreeDialog.value = false;

  cancelAnimationFrame(animationId);

  disposeScene();

  renderer?.dispose();
  controls?.dispose();

  container.value!.innerHTML = "";

  scene = null as any;
  cube = null as any;
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 300px;
}
</style>
