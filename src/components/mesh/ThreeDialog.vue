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
          <span>大小：</span>
          <v-slider
            v-model="silderScale"
            :min="0.1"
            :max="1"
            :step="0.1"
            color="teal-darken-3"
            hide-details
          />
          <span class="ml-1">{{ silderScale }}</span>
        </div>

        <div class="d-flex align-center my-2">
          <span>轉速：</span>
          <v-slider
            v-model="silderSpeed"
            :min="0"
            :max="0.1"
            :step="0.001"
            color="teal-darken-3"
            hide-details
          />
          <span class="ml-1">{{ silderSpeed }}</span>
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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { MeshItem } from "@/types/mesh";

const showThreeDialog = defineModel<boolean>();
const props = defineProps<{ data: MeshItem | null }>();
const container = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationId: number;
let model: THREE.Group;

const silderScale = ref(0.5);
const silderSpeed = ref(0.01);

// 映射材質
const materialMap: Record<
  string,
  { metalness?: number; roughness?: number } | string
> = {
  "Aluminum 6061": { metalness: 1, roughness: 0.15 },
  Steel: { metalness: 0.8, roughness: 0.7 },
  "PBT Plastic": { metalness: 0, roughness: 0.85 },
  "Tempered Glass": "physical",
};

// 設置材質 / 顏色
const applyMaterialToModel = (
  model: THREE.Group,
  materialName?: string,
  color?: string,
) => {
  const config =
    materialName && typeof materialMap[materialName] !== "string"
      ? (materialMap[materialName] as {
          metalness?: number;
          roughness?: number;
        })
      : null;

  model.traverse((child: any) => {
    if (!child.isMesh) return;

    const baseColor = color || "#cccccc";

    let material: THREE.Material;

    //  玻璃材質 : PhysicalMaterial
    if (materialName === "Tempered Glass") {
      material = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        transmission: 1,
        transparent: true,
        opacity: 0.35,
        ior: 1.25,
        thickness: 0.2,
        roughness: 0,
        metalness: 0,
      });
    }

    //  其他材質 : StandardMaterial
    else {
      material = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: config?.metalness ?? 0,
        roughness: config?.roughness ?? 0.5,
      });
    }

    child.material = material;
  });
};

// 抓取3D檔
const loadModel = (scale = 0.3) => {
  const loader = new GLTFLoader();

  loader.load("/models/nike_shoe.glb", (gltf) => {
    model = gltf.scene;

    applyMaterialToModel(
      model,
      props.data?.metadata?.material,
      props.data?.color,
    );

    // 往下移一點
    model.position.y = -0.5;

    model.scale.set(scale, scale, scale);
    scene.add(model);
  });
};

const initThree = () => {
  // 場景
  scene = new THREE.Scene();

  // 相機
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
  renderer.setClearColor("#1e2a33", 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  container.value!.appendChild(renderer.domElement);

  // 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // controls（滑鼠控制）
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  loadModel();

  // 動畫 loop
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    if (model) {
      model.rotation.y += silderSpeed.value;
    }

    controls.update();
    renderer.render(scene, camera);
  };

  animate();
};

// 延遲大小更新 (只有3D圖延遲)
const updateScale = useDebounceFn((val: number) => {
  if (!model) return;

  model.scale.set(val, val, val);
}, 300);

watch(silderScale, (val) => {
  updateScale(val);
});

// 資料改變 -> 帶動改變3D材質 / 顏色
watch(
  () => props.data,
  (val) => {
    if (!val || !model) return;

    applyMaterialToModel(model, val.metadata?.material, val.color);
  },
  { immediate: true },
);

watch(showThreeDialog, (val) => {
  if (val) {
    silderScale.value = 0.5;
    silderSpeed.value = 0.01;

    nextTick(() => {
      initThree();
    });
  }
});

// 清除並釋放
const disposeScene = () => {
  if (!scene) return;

  scene.traverse((obj: any) => {
    // 清除geometry
    if (obj.geometry) {
      obj.geometry.dispose();
    }

    // 清除材質 Material
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m: any) => disposeMaterial(m));
      } else {
        disposeMaterial(obj.material);
      }
    }
  });
};

// 清除材質 + 貼圖（Texture）
const disposeMaterial = (material: any) => {
  if (!material) return;

  for (const key in material) {
    const value = material[key];
    if (value && value.isTexture) {
      value.dispose();
    }
  }

  material.dispose();
};

// 關閉視窗
const closeThreeDialog = () => {
  showThreeDialog.value = false;

  cancelAnimationFrame(animationId);

  // 移除 model
  if (model) {
    scene?.remove(model);
    model = null as any;
  }

  disposeScene();

  controls?.dispose();
  renderer?.dispose();

  container.value!.innerHTML = "";

  scene = null as any; // 重置 scene
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 300px;
}
</style>
