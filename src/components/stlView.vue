<template>
  <div style="width: 100%; height: 100%;" :style="{background: backgroundPag}">
    <div class="viewer" v-if="!isLoading">

      <div class="bgSelect" @click="toolsShow=!toolsShow">
        <svg data-v-006099da="" t="1593851227612" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3832" width="24" height="24" class="icon"><path data-v-006099da="" d="M431.407407 474.074074H170.666667c-23.514074 0-42.666667-19.152593-42.666667-42.666667V170.666667c0-23.514074 19.152593-42.666667 42.666667-42.666667h260.74074c23.514074 0 42.666667 19.152593 42.666667 42.666667v260.74074c0 23.514074-19.152593 42.666667-42.666667 42.666667zM170.666667 170.666667v260.74074h260.74074V170.666667H170.666667zM853.333333 474.074074H592.592593c-23.514074 0-42.666667-19.152593-42.666667-42.666667V170.666667c0-23.514074 19.152593-42.666667 42.666667-42.666667h260.74074c23.514074 0 42.666667 19.152593 42.666667 42.666667v260.74074c0 23.514074-19.152593 42.666667-42.666667 42.666667zM592.592593 170.666667v260.74074h260.74074V170.666667H592.592593zM431.407407 896H170.666667c-23.514074 0-42.666667-19.152593-42.666667-42.666667V592.592593c0-23.514074 19.152593-42.666667 42.666667-42.666667h260.74074c23.514074 0 42.666667 19.152593 42.666667 42.666667v260.74074c0 23.514074-19.152593 42.666667-42.666667 42.666667zM170.666667 592.592593v260.74074h260.74074V592.592593H170.666667zM571.259259 896c-11.757037 0-21.333333-9.576296-21.333333-21.333333v-192.474074c0-11.757037 9.576296-21.333333 21.333333-21.333334s21.333333 9.576296 21.333334 21.333334v192.474074c0 11.757037-9.576296 21.333333-21.333334 21.333333zM672.426667 896c-11.757037 0-21.333333-9.576296-21.333334-21.333333v-192.474074c0-11.757037 9.576296-21.333333 21.333334-21.333334s21.333333 9.576296 21.333333 21.333334v192.474074c0 11.757037-9.576296 21.333333-21.333333 21.333333zM874.666667 896c-11.757037 0-21.333333-9.576296-21.333334-21.333333v-303.407408c0-11.757037 9.576296-21.333333 21.333334-21.333333s21.333333 9.576296 21.333333 21.333333v303.407408c0 11.757037-9.576296 21.333333-21.333333 21.333333zM773.499259 896c-11.757037 0-21.333333-9.576296-21.333333-21.333333v-303.407408c0-11.757037 9.576296-21.333333 21.333333-21.333333s21.333333 9.576296 21.333334 21.333333v303.407408c0 11.757037-9.481481 21.333333-21.333334 21.333333z" p-id="3833"></path></svg>
      </div>
      <div class="userName touch-actio" @contextmenu.prevent @touchstart.prevent @click="empty">{{ userName }}</div>
      <ul class="tools-ul" v-show="toolsShow">
        <li @click="setBg">
          <svg data-v-006099da="" t="1593851104373" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1988" width="24" height="24" class="icon"><path data-v-006099da="" d="M200.04575469 32L32 200.04575469v76.23714656L276.28290125 32h-76.23714656zM407.17017219 32L32 407.17017219v76.22214562L483.39231781 32h-76.22214562zM614.29458969 32L32 614.29458969v76.22214656L690.51673625 32h-76.22214656zM821.40400625 32L32 821.40400625v76.2371475L897.64115375 32h-76.2371475zM992 71.24367875a48.0045 48.0045 0 0 0-10.50098437 7.81573312L71.27368156 989.25474219c-0.85508062 0.85508062-1.27512 1.86017437-2.04019125 2.74525781h75.51708L992 144.76557219zM992 275.63784125L275.63784125 992h76.23714656l640.12501219-640.12501219v-76.23714656zM992 482.76225875L482.76225875 992h76.2371475L992 558.99940625v-76.2371475zM992 689.88667719L689.88667719 992h76.22214562l225.89117719-225.89117719v-76.22214562z" p-id="1989"></path></svg>
        </li>
        <li @click="reset">
          <svg data-v-006099da="" t="1593851298018" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4134" width="24" height="24" class="icon"><path data-v-006099da="" d="M639.959893 0l0.085334 102.997333a469.333333 469.333333 0 1 1-414.464 79.786667 43.264 43.264 0 0 1 60.586666 0.341333 42.666667 42.666667 0 0 1 0 60.416l0.256 0.256a384 384 0 1 0 353.621334-51.285333L639.959893 256 469.293227 128 639.959893 0zM511.959893 426.666667a128 128 0 1 1 0 256 128 128 0 0 1 0-256z" p-id="4135"></path></svg>
        </li>
        <!-- <li @click="showBlock=!showBlock" :class="showBlock ?'active': 'dis-active'">
          <svg data-v-006099da="" t="1604903154152" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2917" width="24" height="24" class="icon"><path data-v-006099da="" d="M975.967 260.8l-2.88 468.478c0 13.92-3.392 26.816-10.112 38.72-6.72 11.904-15.904 21.344-27.392 27.904l-389.631 218.56a63.168 63.168 0 0 1-33.984 9.535c-12.288 0-23.552-3.104-33.984-9.536L85.409 785.406a74.528 74.528 0 0 1-27.392-27.904 77.344 77.344 0 0 1-10.048-38.72V260.799c0-15.872 4.16-30.4 12.768-43.52 8.576-13.12 19.936-22.432 33.984-27.904L487.264 4.736C495.488 1.6 503.616 0 511.744 0c8.224 0 16.32 1.6 24.48 4.704L928.99 189.375c14.048 5.44 25.408 14.88 33.984 27.904 8.704 13.024 12.992 27.648 12.992 43.52z m-464 150.303l362.688-167.52L511.968 76.032l-368 167.551 368 167.52z m35.617 527.87L904.51 735.998V319.999L547.584 478.463v460.51z" p-id="2918"></path></svg>
        </li> -->
        <li @click="rotate" :class="timer ?'active': 'dis-active'">
          <svg data-v-006099da="" t="1629168966473" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2865" width="24" height="24" class="icon"><path data-v-006099da="" d="M929 849a30 30 0 0 1-30-30v-83.137a447.514 447.514 0 0 1-70.921 92.209C722.935 933.225 578.442 975.008 442 953.482a444.917 444.917 0 0 1-241.139-120.591 30 30 0 1 1 37.258-47.01l0.231-0.231A385.175 385.175 0 0 0 442 892.625v-0.006c120.855 22.123 250.206-13.519 343.656-106.975a386.646 386.646 0 0 0 70.6-96.653h-87.247a30 30 0 0 1 0-60H929a30 30 0 0 1 30 30V819a30 30 0 0 1-30 30zM632 342a50 50 0 0 1 50 50v240a50 50 0 0 1-50 50H392a50 50 0 0 1-50-50V392a50 50 0 0 1 50-50h240zM402 607a15 15 0 0 0 15 15h190a15 15 0 0 0 15-15V417a15 15 0 0 0-15-15H417a15 15 0 0 0-15 15v190z m403.005-362.025a29.87 29.87 0 0 1-19.117-6.882l-0.232 0.231A386.5 386.5 0 0 0 689.478 168h-0.011c-145.646-75.182-329.021-51.747-451.117 70.35a386.615 386.615 0 0 0-70.6 96.65H255a30 30 0 0 1 0 60H95a30 30 0 0 1-30-30V205a30 30 0 0 1 60 0v83.129a447.534 447.534 0 0 1 70.923-92.206C317.981 73.866 493.048 37.2 647 85.836v-0.045a444.883 444.883 0 0 1 176.143 105.291 30 30 0 0 1-18.138 53.893z" p-id="2866"></path></svg>
        </li>
        <li @click="setLine" :class="isRuler ? 'active' : 'dis-active'">
          <svg data-v-006099da="" t="1716883891157" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1693" width="24" height="24" class="icon"><path data-v-006099da="" d="M908.1856 695.0912a34.133333 34.133333 0 0 1 0 48.264533l-164.829867 164.829867a34.133333 34.133333 0 0 1-48.264533 0l-24.132267-24.132267 96.529067-96.5632a34.133333 34.133333 0 0 0-48.264533-48.264533l-96.529067 96.529067-72.430933-72.3968 24.1664-24.132267a34.133333 34.133333 0 0 0-48.298667-48.264533l-24.132267 24.132266-72.3968-72.430933L526.1312 546.133333A34.133333 34.133333 0 1 0 477.866667 497.8688l-96.529067 96.529067-72.430933-72.3968 24.132266-24.132267a34.133333 34.133333 0 0 0-48.264533-48.264533l-24.132267 24.132266-72.3968-72.430933L284.7744 304.810667A34.133333 34.133333 0 1 0 236.544 256.512l-96.529067 96.529067-24.1664-24.132267a34.133333 34.133333 0 0 1 0-48.264533l164.829867-164.829867a34.133333 34.133333 0 0 1 48.264533 0l579.242667 579.2768zM377.173333 67.549867a102.4 102.4 0 0 0-144.7936 0L67.549867 232.379733a102.4 102.4 0 0 0 0 144.7936L236.544 546.133333l-134.826667 134.826667a68.266667 68.266667 0 0 0-20.002133 48.264533v178.961067a34.133333 34.133333 0 0 0 34.133333 34.133333h178.961067a68.266667 68.266667 0 0 0 48.264533-20.002133L477.866667 787.456l168.96 168.96a102.4 102.4 0 0 0 144.7936 0l164.829866-164.829867a102.4 102.4 0 0 0 0-144.7936L787.456 477.866667l124.8256-124.8256a102.4 102.4 0 0 0 0-144.7936L815.786667 111.684267a102.4 102.4 0 0 0-144.827734 0L546.133333 236.544l-168.96-168.96zM149.947733 729.224533l134.826667-134.826666 144.827733 144.827733-134.826666 134.826667H200.704l84.821333-84.855467a34.133333 34.133333 0 0 0-48.264533-48.264533l-87.278933 87.2448v-98.952534z m444.450134-444.416l124.8256-124.859733a34.133333 34.133333 0 0 1 48.264533 0l96.5632 96.5632a34.133333 34.133333 0 0 1 0 48.264533l-124.8256 124.8256-144.827733-144.827733z" p-id="1695"></path></svg>
        </li>
        <li @click="stlToImage">
          <svg data-v-006099da="" t="1588142095000" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2362" width="24" height="24" class="icon"><path data-v-006099da="" d="M192 320l320-224 448 320v576H64V320h128z m576 96L512 224 224 416h544zM896 832H128v-96c0-35.2 28.8-64 64-64h640c35.2 0 64 28.8 64 64v96z" p-id="2363"></path></svg>
        </li>
      </ul>
      <!-- <ul class="viewer-menu" style="bottom: 10px;">
        <ul class="viewer-menu-list">
          <li class="viewer-menu-item viewer-menu-item-one" @click="setAllShowList()">{{ currentShowName ? '全部隐藏' : '全部显示' }}</li>
          <li class="viewer-menu-item" v-for="(item, index) in urls" :key="index" @click.stop="setOpacity(item,index)" :style="{ background: compRgb(item.color) }">
            <div class="item-row">
              <i>{{ !currentShowName ? 0 : opacityNumber(item.state) }}%</i>
              <strong>
                <svg t="1728625905851" @click.stop="setDisplay(item,index, false)" v-if="item.state != 0" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4888" width="20" height="20"><path d="M512.14 819c-136.83 0-253.2-59.32-326.73-109.08C97.84 650.6 35.29 581.25 12.15 538.82a56.53 56.53 0 0 1 0-54.35c23.14-42.44 85.69-111.79 173.26-171 73.53-49.77 189.9-109.09 326.73-109.09 137.53 0 253.1 57.92 325.84 106.51 40.4 27 78.56 58.49 110.35 91.12 28.79 29.53 51.46 59.18 63.84 83.48a57.94 57.94 0 0 1 0 52.4c-12.38 24.3-35 53.95-63.84 83.48-31.79 32.63-70 64.14-110.35 91.13C765.24 761 649.67 819 512.14 819zM67 511.64c10 17.43 28.73 40.66 51.89 64.2a672.78 672.78 0 0 0 100.8 83.41c66.45 45 171.14 98.59 292.48 98.59 122.21 0 226.18-52.32 291.89-96.21 78.53-52.46 133.92-114.07 152.88-150-19-35.92-74.35-97.53-152.88-150-65.71-43.89-169.68-96.21-291.89-96.21-121.34 0-226 53.61-292.48 98.59a672.23 672.23 0 0 0-100.8 83.42C95.7 471 76.93 494.21 67 511.64z" fill="#000000" p-id="4889"></path><path d="M511.81 682.86c-94.41 0-171.22-76.81-171.22-171.22s76.81-171.22 171.22-171.22S683 417.23 683 511.64s-76.78 171.22-171.19 171.22z m0-278.44A107.22 107.22 0 1 0 619 511.64a107.34 107.34 0 0 0-107.19-107.22z" fill="#000000" p-id="4890"></path></svg>
                <svg t="1728625770869" @click.stop="setDisplay(item,index, true)" v-if="item.state == 0 || !currentShowName" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3689" width="20" height="32"><path d="M817.64 376.868c3.94-21.737 24.754-36.166 46.492-32.227 21.737 3.939 36.166 24.753 32.227 46.49-10.204 56.318-60.2 102.297-135.684 134.099C690.844 554.65 600.989 571 506 571c-94.99 0-184.844-16.35-254.675-45.77-75.484-31.802-125.48-77.78-135.684-134.098-3.939-21.738 10.49-42.552 32.227-46.491 21.52-3.9 42.136 10.203 46.368 31.577l0.123 0.65c4.384 24.197 34.889 52.25 88.027 74.638C341.856 476.56 421.208 491 506 491s164.143-14.439 223.614-39.494c52.607-22.164 83.03-49.88 87.888-73.91l0.139-0.728z" fill="#ffffff" p-id="3690"></path><path d="M423.235 495.285c21.126 5.66 33.748 27.214 28.45 48.35l-0.165 0.64-28.334 105.742c-5.718 21.339-27.651 34.002-48.99 28.284-21.125-5.66-33.748-27.214-28.45-48.349l0.166-0.64 28.334-105.743c5.717-21.339 27.65-34.002 48.99-28.284zM228.864 449.495c18.94 10.935 25.554 35.021 14.967 54.065l-0.326 0.576-54.737 94.806c-11.045 19.132-35.51 25.687-54.64 14.641-18.941-10.935-25.555-35.021-14.968-54.065l0.326-0.576 54.737-94.806c11.045-19.132 35.509-25.687 54.64-14.641zM763.824 464.55c15.464-15.465 40.442-15.62 56.097-0.464l0.471 0.464 77.41 77.41c15.62 15.62 15.62 40.947 0 56.568-15.465 15.464-40.443 15.62-56.098 0.464l-0.471-0.464-77.41-77.41c-15.62-15.62-15.62-40.947 0-56.568zM590.635 495.285c21.125-5.66 42.834 6.694 48.814 27.646l0.176 0.638 28.334 105.743c5.717 21.338-6.946 43.272-28.285 48.99-21.125 5.66-42.833-6.695-48.813-27.647l-0.176-0.638-28.334-105.743c-5.718-21.338 6.946-43.272 28.284-48.99z" fill="#ffffff" p-id="3691"></path></svg>
              </strong>
            </div>
            <span>{{ item.name }}</span>
            <div style="text-align: center;" class="item-row">
              <b>{{ item.volume }}</b>
            </div>
          </li>
        </ul>
      </ul> -->

    </div>

    <div class="viewer3D" @click="empty" @contextmenu.prevent @touchstart.prevent>
      <div ref="vtkContainer3D" id="vtkContainer3d"></div>
    </div>
  </div>
</template>

<script setup>
// @ts-nocheck

import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkPolyDataNormals from '@kitware/vtk.js/Filters/Core/PolyDataNormals';
import vtkDracoReader from '@kitware/vtk.js/IO/Geometry/DracoReader';
import vtkResourceLoader from '@kitware/vtk.js/IO/Core/ResourceLoader';
import vtkAnnotatedCubeActor from '@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor';
import vtkOrientationMarkerWidget from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget';
import vtkTransform from '@kitware/vtk.js/Common/Transform/Transform';
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import svgRoi from '@/utils/ruler';
import { cellPicker, getActors } from '@/utils/coordTool';
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  modelList: { type: Array, default: () => [] },
})

const modelLsit = computed(() => props.modelList ?? [])

// ========== 常量 / 工具函数 ==========
/**
 * 检测用户设备是否为 iOS 13 以下版本
 * iOS 低版本不支持某些 WASM 功能，需降级处理
 */
function isIOSBelow13() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const match = ua.match(/OS (\d+)_/i);
  if (match && match.length > 1) {
    return parseInt(match[1], 10) <= 15;
  }
  return false;
}

// ========== 数据 ==========
const urls = ref([]);
const dicomUrl = ref('');
const timer = ref(null);
const toolsShow = ref(true);
const showBlock = ref(false);
const wordActorList = ref([]);
const mouseMoveFlag = ref(false);
const isRuler = ref(false);
const isLoading = ref(true);
const progress = ref(0);
const userName = ref('');
const backgroundPag = ref('rgb(255,255,255)');
const showLiverVolumeTable = ref(false);
const bgFlag = ref(1);
const stlDataArray = ref([]);
const axleArr = ref([
  { axle: 'x', value: [-2500, 2500], max: 100, min: -100 },
  { axle: 'y', value: [-2500, 2500], max: 100, min: -100 },
  { axle: 'z', value: [-2500, 2500], max: 100, min: -100 },
]);

const screen = ref({});




const currentShowName = computed(() => {
  let flag = true;
  urls.value.forEach(item => {
    if (!item.isShow) flag = false;
  });
  return flag;
});




// ========== 生命周期 ==========
/**
 * 组件挂载时初始化：加载 STL 模型列表并禁用浏览器默认右键菜单和文字选中
 */
onMounted(() => {
  loadModels();

  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      selection.removeAllRanges();
    }
  });
});

/** 监听 modelList prop 变化，重新加载模型 */
watch(
  () => props.modelList,
  () => { if (!isLoading.value) loadModels() },
  { deep: true }
)

/** 加载模型并初始化渲染 */
const loadModels = () => {
  if (!modelLsit.value.length) return
  urls.value = []
  modelLsit.value.forEach((item) => {
    const opacity = item.opacity ?? 0.3;
    const colorCode = item.colorCode
      ? `rgba(${item.colorCode},${opacity})`
      : hexToRgb(null, opacity);
    urls.value.push({
      url: item.filePath,
      color: colorCode,
      name: item.fileName,
      currentItem: true,
      state: opcaityPercent(opacity * 100),
      currentState: opcaityPercent(opacity * 100),
      isShow: true,
      packageFileId: item.packageFileId,
    });
  });
  init();
};

defineExpose({ reload: loadModels });

/**
 * 初始化 vtk 渲染环境
 * - 创建全屏渲染窗口（背景白色）
 * - 设置交互器，更新率为120fps，静止时30fps
 * - 创建 X/Y/Z 三轴方向裁剪平面对（共6个 Plane，用于三平面切割模型）
 * - 加载 Draco 模型作为方位指示器（仅 iOS 低版本）
 * - 调用 renderStl() 渲染所有已加载的 STL 模型
 */
const init = () => {
  screen.value.fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.querySelector('.viewer3D'),
    background: [1, 1, 1],
  });
  screen.value.renderWindow = screen.value.fullScreenRenderWindow.getRenderWindow();
  screen.value.renderWindow.getInteractor().setDesiredUpdateRate(120);
  screen.value.renderWindow.getInteractor().setStillUpdateRate(120);
  screen.value.renderer = screen.value.fullScreenRenderWindow.getRenderer();
  screen.value.renderer.resetCameraClippingRange();
  screen.value.camera = screen.value.renderer.getActiveCamera();
  screen.value.camera.setViewAngle(60);
  screen.value.xPlane = vtkPlane.newInstance({ origin: [-200, 0, 0], normal: [1, 0, 0] });
  screen.value.yPlane = vtkPlane.newInstance({ origin: [0, 0, 100], normal: [0, 0, -1] });
  screen.value.zPlane = vtkPlane.newInstance({ origin: [0, -100, 0], normal: [0, 1, 0] });
  screen.value.xPlaneB = vtkPlane.newInstance({ origin: [-200, 0, 0], normal: [-1, 0, 0] });
  screen.value.yPlaneB = vtkPlane.newInstance({ origin: [0, 0, 100], normal: [0, 0, 1] });
  screen.value.zPlaneB = vtkPlane.newInstance({ origin: [0, -100, 0], normal: [0, -1, 0] });
  screen.value.apiSpecificRenderWindow = screen.value.fullScreenRenderWindow.getInteractor().getView();
  screen.value.style = vtkInteractorStyleTrackballCamera.newInstance();
  screen.value.renderWindow.getInteractor().setInteractorStyle(screen.value.style);
  screen.value.style.setMotionFactor(10);

  if (isHarmonyOS4()) {
    const size = screen.value.apiSpecificRenderWindow.getSize();
    screen.value.apiSpecificRenderWindow.setSize(size[0] * 0.3, size[1] * 0.3);
    screen.value.camera.setViewAngle(30);
    screen.value.renderWindow.getInteractor().setDesiredUpdateRate(30);
    screen.value.renderWindow.getInteractor().setStillUpdateRate(30);
  }

  window.obj = this;
  screen.value.camera.zoom(0.8);
  screen.value.renderWindow.render();
  createSVG();
  renderStl();
  lineTool();
  eventTool();
  if (isIOSBelow13()) annotated();
  renderRotate();
};

/**
 * 检测是否为鸿蒙OS 4
 * 鸿蒙4在渲染分辨率和更新频率上需要特殊降级处理
 */
const isHarmonyOS4 = () => {
  const ua = navigator.userAgent;
  const match = ua.match(/HarmonyOS/i);
  return match ? match[0] === 'HarmonyOS' : false;
};

/**
 * vtk 鼠标/触摸交互事件绑定
 * - 记录鼠标左键按下状态，用于区分拖拽和点击
 * - 鼠标移动结束后（松开后100ms）更新 SVG 标尺文字位置，确保文字跟随模型移动
 */
const eventTool = () => {
  screen.value.renderWindow.get().interactor.onLeftButtonPress(() => {
    mouseMoveFlag.value = true;
  });

  let time = null;
  screen.value.renderWindow.get().interactor.onMouseMove(() => {
    if (!time && mouseMoveFlag.value) {
      time = setTimeout(() => {
        updateSvgLabel();
        clearTimeout(time);
        time = null;
      }, 100);
    }
  });
  screen.value.renderWindow.get().interactor.onLeftButtonRelease(() => {
    mouseMoveFlag.value = false;
  });
};

/**
 * 在 viewer3D DOM 节点下动态创建 SVG 覆盖层
 * 用于在 3D 场景上叠加标尺、标签等 2D 矢量图形
 * viewBox 与渲染窗口像素尺寸对齐，保证 SVG 坐标与 vtk 坐标一致
 */
const createSVG = () => {
  const dom = document.querySelector('.viewer3D');
  const screenSize = screen.value.apiSpecificRenderWindow.getSize();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position: absolute; left: 0%; top: 0%; width: 100%; height: 100%;z-index:100;pointer-events: none;');
  svg.setAttribute('width', dom.offsetWidth);
  svg.setAttribute('height', dom.offsetHeight);
  svg.setAttribute('viewBox', `0 0 ${screenSize[0]} ${screenSize[1]}`);
  dom.appendChild(svg);
};

/**
 * 并行加载并渲染 urls 列表中的所有 STL/DRC 模型
 * 遍历 urls，实例化 Liver 对象加载模型，注入 actor、设置颜色
 * 更新进度条 progress，加载完成后隐藏 loading 状态
 */
const renderStl = () => {
  let completedFiles = 0;
  const totalFiles = urls.value.length;

  urls.value.forEach(async (ele, index) => {
    const stlData = await new Liver(screen.value).create(ele);
    urls.value[index].volume = stlData.volume + 'ml';
    initClip(stlData.imageData);
    stlDataArray.value.push(stlData);
    stlData.setColor(ele.color);
    ele.actor = stlData;
    completedFiles++;
    progress.value = parseInt((completedFiles / totalFiles) * 100);
    if (completedFiles === totalFiles) {
      progress.value = 100;
      isLoading.value = false;
    }
  });
};

/**
 * iOS 低版本专用：加载 Draco 方向指示器模型（人体轮廓）
 * 加载 Google Draco WASM 解码器，将模型旋转180度后作为方位指示器
 * 显示在视口左下角，用于提示模型朝向
 */
const annotated = () => {
  let reader = vtkDracoReader.newInstance();
  vtkResourceLoader
    .loadScript('https://www.gstatic.com/draco/v1/decoders/draco_wasm_wrapper.js')
    .then(() => {
      vtkDracoReader
        .setWasmBinary('https://www.gstatic.com/draco/v1/decoders/draco_decoder.wasm', 'draco_decoder.wasm')
        .then(() => {
          reader.setUrl('http://nameused.oss-cn-beijing.aliyuncs.com/3dai/lung/2025-4-21/19rzxjy908n/HumanAll.drc').then(() => {
            const data = reader.getOutputPort();
            const actor = vtkActor.newInstance();
            const transform = vtkTransform.newInstance();
            const matrix = vtkMatrixBuilder.buildFromDegree().rotateZ(180).getMatrix();
            transform.setMatrix(matrix);
            actor.setUserMatrix(transform.getMatrix());
            const mapper = vtkMapper.newInstance();
            actor.setMapper(mapper);
            mapper.setInputConnection(data);
            actor.getProperty().setColor(1, 1, 1);
            screen.value.orientationWidget = vtkOrientationMarkerWidget.newInstance({
              actor,
              interactor: screen.value.renderWindow.getInteractor(),
            });
            screen.value.orientationWidget.setEnabled(true);
            screen.value.orientationWidget.setViewportCorner(vtkOrientationMarkerWidget.Corners.BOTTOM_LEFT);
          });
        });
    });
};

/**
 * 更新指定模型的材质颜色和透明度
 * 从 rgba 字符串中提取 RGB 值和透明度，调用 actor.setColor 完成渲染更新
 */
const changeColoe = (item, index) => {
  const color = item.color || 'rgba(0,0,0,0)';
  item.actor.setColor(color);
};


const opacityNumber = (val) => {
  switch (val) {
    case 1: return '25';
    case 3: return '100';
    case 2: return '50';
    default: return '0';
  }
};

const opcaityPercent = (val) => {
  switch (val) {
    case 100: return 3;
    case 50: return 2;
    case 25: return 1;
    default: return 0;
  }
};


/**
 * 切换渲染窗口背景色
 * 循环：白 → 浅灰 → 中灰 → 深灰 → 黑 → 白
 * 同时更新页面背景色保持一致
 */
const setBg = () => {
  switch (bgFlag.value) {
    case 0:
      screen.value.renderer.setBackground(1, 1, 1, 0.0);
      backgroundPag.value = 'rgb(255,255,255)';
      bgFlag.value++;
      break;
    case 1:
      screen.value.renderer.setBackground(0.93, 0.93, 0.93, 0.93);
      backgroundPag.value = `rgb(${255 * 0.93},${255 * 0.93},${255 * 0.93})`;
      bgFlag.value++;
      break;
    case 2:
      screen.value.renderer.setBackground(0.5, 0.5, 0.5, 0.5);
      backgroundPag.value = `rgb(${255 * 0.5},${255 * 0.5},${255 * 0.5})`;
      bgFlag.value++;
      break;
    case 3:
      screen.value.renderer.setBackground(0.26, 0.26, 0.26, 0.26);
      backgroundPag.value = `rgb(${255 * 0.26},${255 * 0.26},${255 * 0.26})`;
      bgFlag.value++;
      break;
    case 4:
      screen.value.renderer.setBackground(0.0, 0.0, 0.0, 0);
      backgroundPag.value = 'rgb(0,0,0)';
      bgFlag.value = 0;
      break;
  }
  screen.value.renderWindow.render();
};

/**
 * 重置 3D 视图到初始状态
 * - 清除所有 actor 的位置偏移
 * - 清除所有标尺/标签（wordActorList）
 * - 隐藏所有工具类 actor（如标尺）
 * - 恢复相机位置和视角
 */
const reset = () => {
  stlDataArray.value.forEach(ele => {
    ele.actor.setPosition(0, 0, 0);
    screen.value.renderWindow.render();
  });
  toggleRotate(true);
  const lastItem = stlDataArray.value[stlDataArray.value.length - 1];
  if (lastItem?.position) {
    screen.value.camera.setPosition(lastItem.position.position[0], -lastItem.position.distance, lastItem.position.position[2]);
  }
  wordActorList.value.forEach(ele => {
    if (!ele.update) return;
    ele.remove();
  });
  screen.value.renderer.getActors().forEach(el => {
    if (!!el.get().toolType) {
      el.getProperty().setOpacity(0);
      screen.value.renderWindow.render();
    }
  });
  isRuler.value = false;
  wordActorList.value = [];
  screen.value.camera.setViewUp(0, 0, 1);
  screen.value.renderer.resetCamera();
  screen.value.renderer.resetCameraClippingRange();
  screen.value.renderWindow.render();
};

const rotate = () => {
  timer.value = !timer.value;
  renderRotate();
};

/**
 * 递归旋转动画：每帧使相机绕 Z 轴旋转 -1.5°
 * 通过 requestAnimationFrame 驱动，需配合 rotate() 切换 timer 状态来启动/停止
 */
const renderRotate = () => {
  if (timer.value) {
    screen.value.camera.azimuth(-1.5);
    screen.value.renderWindow.render();
    requestAnimationFrame(renderRotate);
  }
};

/**
 * 初始化裁剪平面的范围（X/Y/Z 三轴各有正负两个裁剪平面）
 * 默认范围为 [-2500, 2500]，对所有模型数据统一设置
 * 初始化完成后立即调用 clip() 对每个轴进行裁剪
 */
const initClip = (imageData) => {
  const max = 2500, min = -2500;
  axleArr.value[0].max = max;
  axleArr.value[0].min = min;
  axleArr.value[0].value = [min, max];
  axleArr.value[1].max = max;
  axleArr.value[1].min = min;
  axleArr.value[1].value = [min, max];
  axleArr.value[2].max = max;
  axleArr.value[2].min = min;
  axleArr.value[2].value = [min, max];
  axleArr.value.forEach((ele, index) => clip(index, ele.axle));
};

/**
 * 控制指定轴向的裁剪平面位置
 * index: 0=x, 1=y, 2=z
 * 根据 axleArr 中存储的 value [min, max] 调整正负两个平面的 origin
 * 正平面位于最小值侧，负平面位于最大值侧，两面之间为可见区域
 */
const clip = (index, axis) => {
  const value = axleArr.value[index].value;
  const arr = screen.value[axis + 'Plane'].getOrigin();
  const arrB = screen.value[axis + 'PlaneB'].getOrigin();
  if (axis === 'x') {
    arr[0] = value[0];
    arrB[0] = value[1];
  }
  if (axis === 'y') {
    arr[2] = value[1];
    arrB[2] = value[0];
  }
  if (axis === 'z') {
    arr[1] = value[0];
    arrB[1] = value[1];
  }
  screen.value[axis + 'Plane'].setOrigin(arr);
  screen.value[axis + 'PlaneB'].setOrigin(arrB);
  screen.value.renderWindow.render();
};

/**
 * 切换全部模型的显示/隐藏状态
 * 点击"全部隐藏"时隐藏所有模型；点击"全部显示"时恢复所有模型透明度
 */
const setAllShowList = () => {
  const next = !currentShowName.value;
  urls.value.forEach((ele, i) => {
    urls.value[i].isShow = next;
    const state = next ? urls.value[i].currentState : 0;
    const match = ele.color.slice(5, -1);
    const colorarr = match.split(',');
    urls.value[i].color = `rgba(${colorarr[0]},${colorarr[1]},${colorarr[2]},${opacityNumber(state) / 100})`;
    changeColoe(urls.value[i], i);
  });
};






/**
 * 将 hex 颜色值转换为 rgba 字符串
 * 若传入非 hex 格式（如已 rgb 字符串）则直接分割拼接
 * 无 hex 时使用 compColor() 随机生成一个默认颜色
 */
const hexToRgb = (hex, opacity) => {
  if (!hex) return compColor();
  if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
    const color = hex.indexOf('rgb') === 0 ? hex.slice(4, -1).split(',') : hex.split(',');
    return `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

const compColor = () => {
  const color = [
    'rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)', 'rgba(255,0,255,0.3)',
    'rgba(255,1,0,0.3)', 'rgba(0,100,0,0.3)', 'rgba(0,100,100,0.3)', 'rgba(10,10,90,0.3)',
    'rgba(20,200,2,0.3)', 'rgba(80,0,1,0.3)',
  ];
  return color[parseInt(Math.random() * 10)];
};

/**
 * 切换相机交互模式
 * flag=true: 恢复 TrackballCamera 交互（可旋转/缩放/平移）
 * flag=false: 禁用交互（进入自动旋转等特殊模式时锁定相机）
 */
const toggleRotate = (flag) => {
  if (flag) {
    const InteractorStyleTrackballCamera = vtkInteractorStyleTrackballCamera.newInstance();
    screen.value.renderWindow.getInteractor().setInteractorStyle(InteractorStyleTrackballCamera);
  } else {
    screen.value.renderWindow.getInteractor().setInteractorStyle(null);
  }
};

/**
 * 切换标尺工具开关状态
 * 由 UI 工具栏按钮触发，影响 lineTool() 中的点击行为
 */
const setLine = () => {
  isRuler.value = !isRuler.value;
};

/**
 * 标尺测量工具：点击模型两次测量空间直线距离
 * - 第一次点击：记录起点（pointList[0]）
 * - 第二次点击：记录终点（pointList[1]），绘制线段并在终点显示距离标签（单位 mm）
 * 依赖 cellPicker 将屏幕坐标转换为模型表面世界坐标
 */
const lineTool = () => {
  const getDomId = '.viewer3D svg';
  let flag = false;
  const pointList = new Array(2);
  let count = 0;
  const scene = screen.value;
  let line = null;

  scene.renderWindow.get().interactor.onLeftButtonPress(e => {
    if (!isRuler.value) return;
    const actors = getActors(e.position, scene, e.pokedRenderer.getActors());
    if (!flag && count === 0) {
      count = 1;
      pointList[0] = cellPicker(scene, e.position, actors);
      pointList[1] = cellPicker(scene, e.position, actors);
      flag = true;
    } else if (flag && count === 1) {
      count = 0;
      pointList[1] = cellPicker(scene, e.position, actors);
      scene.renderWindow.render();
      line = new svgRoi.Ruler(scene, new Date().valueOf() + parseInt(Math.random() * 10000), 1);
      line.create(pointList);
      wordActorList.value.push(line);
      const word = Math.sqrt(svgRoi.distance2BetweenPoints(pointList[0], pointList[1])).toFixed(2);
      if (word === '0.00') {
        flag = false;
        line.remove();
        return;
      }
      flag = false;
      const textLable = new svgRoi.labelWidget(pointList[1][0], pointList[1][1], pointList[1][2], scene, new Date().valueOf() + parseInt(Math.random() * 10000), getDomId);
      textLable.created(word + 'mm');
      wordActorList.value.push(textLable);
    }
  });
};

// 将当前的3D场景导出为PNG图片并触发下载
const stlToImage = () => {
  if (!screen.value?.renderWindow) return;
  screen.value.renderWindow.render();

  // 获取 vtk 渲染的原始 DOM canvas
  const glWindow = screen.value.apiSpecificRenderWindow;
  if (!glWindow) return;
  const glCanvas = glWindow.getCanvas();
  const w = glCanvas.width;
  const h = glCanvas.height;

  // 创建离屏 canvas，以 2x 分辨率导出保证清晰度
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(glCanvas, 0, 0, canvas.width, canvas.height);

  // 触发浏览器下载 PNG
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `stl-screenshot-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
window.stlToImage = stlToImage
// ========== Liver 辅助类 ==========
/**
 * Liver 类：封装单个 STL/DRC 模型的加载、渲染和属性管理
 * 每个模型实例持有一个 vtkActor + vtkMapper，负责自身的颜色、体积计算和裁剪平面
 */
class Liver {
  constructor(scene) {
    this.scene = scene;
    this.setColor = this._setColorFn.bind(this);
    this.actor = vtkActor.newInstance();
    this.mapper = vtkMapper.newInstance();
    this.actor.setMapper(this.mapper);
  }

  /**
   * URL 编码处理：将 URL 中的 + 号转义为 %2B（+ 在 URL 中表示空格）
   */
  _urlValues(url) {
    return url.replace('+', '%2B');
  }

  /**
   * 从 rgba 字符串中提取 RGBA 分量
   * vtk 要求颜色值为 [0,1] 范围的浮点数，透明度保持原值
   */
  _extractRgba(rgbaString) {
    const match = rgbaString.slice(5, -1).split(',');
    return [match[0] / 255, match[1] / 255, match[2] / 255, match[3]];
  }

  /**
   * 更新模型的渲染颜色和透明度
   * 颜色变更后需调用 render() 触发重新渲染
   */
  _setColorFn(color) {
    const colorArr = this._extractRgba(color);
    this.actor.getProperty().setColor(colorArr[0], colorArr[1], colorArr[2]);
    this.actor.getProperty().setOpacity(colorArr[3]);
    this.scene.renderWindow.render();
  }

  /**
   * 根据 PolyData 多边形网格数据计算模型体积（单位 ml）
   * 原理：累加所有四面体（有向三角形 + 原点）的有符号体积，取绝对值后除以 1000 转换单位
   */
  _compVolume(polyData) {
    console.log(polyData)
    const points = polyData.getPoints();
    const cells = polyData.getPolys();
    let volume = 0.0;
    for (let i = 0; i < cells.getData().length; i += 4) {
      const p1 = points.getPoint(cells.getData()[i + 1]);
      const p2 = points.getPoint(cells.getData()[i + 2]);
      const p3 = points.getPoint(cells.getData()[i + 3]);
      volume += (p1[0] * (p2[1] * p3[2] - p2[2] * p3[1]) +
                  p2[0] * (p3[1] * p1[2] - p3[2] * p1[1]) +
                  p3[0] * (p1[1] * p2[2] - p1[2] * p2[1])) / 6.0;
    }
    return Math.abs(volume / 1000).toFixed(2);
  }

  /**
   * 异步加载并渲染模型文件
   * - .drc 文件：使用 vtkDracoReader 加载压缩模型（iOS 低版本走中转接口）
   * - 其他格式（.stl 等）：直接使用 vtkSTLReader 读取
   * 加载完成后设置光照属性、注册裁剪平面、调整相机位置
   */
  async create(obj) {
    if (obj.url.indexOf('.drc') > 0) {
      if (isIOSBelow13()) {
        const reader = vtkSTLReader.newInstance();
        await reader.setUrl(`/nodeApi/convert?url=${this._urlValues(obj.url)}`, { binary: true });
        const data = reader.getOutputPort();
        this.volume = this._compVolume(reader.getOutputData());
        this.normals = vtkPolyDataNormals.newInstance();
        this.normals.setInputConnection(data);
        this.normals.update();
        this.mapper.setInputConnection(this.normals.getOutputPort());
        this.imageData = reader.getOutputData();
        this.actor.modified();
        this.actor.getProperty().setInterpolationToPhong();
        this.actor.getProperty().setSpecularPower(16);
        this.scene.renderer.addActor(this.actor);
        this.mapper.setScalarVisibility(false);
        this.mapper.addClippingPlane(this.scene.xPlane);
        this.mapper.addClippingPlane(this.scene.yPlane);
        this.mapper.addClippingPlane(this.scene.zPlane);
        this.mapper.addClippingPlane(this.scene.xPlaneB);
        this.mapper.addClippingPlane(this.scene.yPlaneB);
        this.mapper.addClippingPlane(this.scene.zPlaneB);
        this.scene.renderer.resetCamera();
        this.scene.camera.zoom(0.8);
        const position = this.scene.camera.get().position;
        this.position = { position: JSON.parse(JSON.stringify(position)), distance: this.scene.camera.get().distance };
        this.scene.camera.setPosition(this.position.position[0], -this.position.distance, this.position.position[2]);
        this.scene.renderer.resetCameraClippingRange();
        this.scene.renderer.setUseDepthPeeling(true);
        this.scene.camera.setViewUp(0, 0, 1);
        this.scene.renderWindow.render();
        return this;
      }

      const reader = vtkDracoReader.newInstance();
      await vtkResourceLoader.loadScript('https://www.gstatic.com/draco/v1/decoders/draco_wasm_wrapper.js');
      await vtkDracoReader.setWasmBinary('https://www.gstatic.com/draco/v1/decoders/draco_decoder.wasm', 'draco_decoder.wasm');
      try {
        await reader.setUrl(this._urlValues(obj.url));
        const data = reader.getOutputPort();
        this.volume = this._compVolume(reader.getOutputData());
        this.normals = vtkPolyDataNormals.newInstance();
        this.normals.setInputConnection(data);
        this.normals.update();
        this.mapper.setInputConnection(this.normals.getOutputPort());
        this.imageData = reader.getOutputData();
        this.actor.modified();
        this.actor.getProperty().setInterpolationToPhong();
        this.actor.getProperty().setSpecularPower(16);
        this.scene.renderer.addActor(this.actor);
        this.mapper.setScalarVisibility(false);
        this.mapper.addClippingPlane(this.scene.xPlane);
        this.mapper.addClippingPlane(this.scene.yPlane);
        this.mapper.addClippingPlane(this.scene.zPlane);
        this.mapper.addClippingPlane(this.scene.xPlaneB);
        this.mapper.addClippingPlane(this.scene.yPlaneB);
        this.mapper.addClippingPlane(this.scene.zPlaneB);
        this.scene.renderer.resetCamera();
        this.scene.camera.zoom(0.8);
        const position = this.scene.camera.get().position;
        this.position = { position: JSON.parse(JSON.stringify(position)), distance: this.scene.camera.get().distance };
        this.scene.camera.setPosition(this.position.position[0], -this.position.distance, this.position.position[2]);
        this.scene.renderer.resetCameraClippingRange();
        this.scene.renderer.setUseDepthPeeling(true);
        this.scene.camera.setViewUp(0, 0, 1);
        this.scene.renderWindow.render();
      } catch {
        this.imageData = { getBounds: () => [], get: () => ({ extent: [0, 99, 0, 99, 0, 0] }) };
        this.volume = '0.00';
      }
      return this;
    }

    // Direct STL reading path
    const reader = vtkSTLReader.newInstance();
    await reader.setUrl(obj.url, { binary: true });
    const data = reader.getOutputPort();
    console.log(reader)
    this.volume = this._compVolume(reader.getOutputData());
    this.normals = vtkPolyDataNormals.newInstance();
    this.normals.setInputConnection(data);
    this.normals.update();
    this.mapper.setInputConnection(this.normals.getOutputPort());
    this.imageData = reader.getOutputData();
    this.actor.modified();
    this.actor.getProperty().setInterpolationToPhong();
    this.actor.getProperty().setInterpolationToGouraud();
    this.actor.getProperty().setAmbient(0.2);
    this.actor.getProperty().setDiffuse(0.7);
    this.actor.getProperty().setSpecular(0.4);
    this.actor.getProperty().setSpecularPower(50);
    this.scene.renderer.addActor(this.actor);
    this.mapper.setScalarVisibility(false);
    this.mapper.addClippingPlane(this.scene.xPlane);
    this.mapper.addClippingPlane(this.scene.yPlane);
    this.mapper.addClippingPlane(this.scene.zPlane);
    this.mapper.addClippingPlane(this.scene.xPlaneB);
    this.mapper.addClippingPlane(this.scene.yPlaneB);
    this.mapper.addClippingPlane(this.scene.zPlaneB);
    this.scene.renderer.resetCamera();
    this.scene.camera.zoom(0.8);
    const position = this.scene.camera.get().position;
    this.position = { position: JSON.parse(JSON.stringify(position)), distance: this.scene.camera.get().distance };
    this.scene.camera.setPosition(this.position.position[0], -this.position.distance, this.position.position[2]);
    this.scene.renderer.resetCameraClippingRange();
    this.scene.renderer.setUseDepthPeeling(true);
    this.scene.camera.setViewUp(0, 0, 1);
    this.scene.renderWindow.render();
    return this;
  }
}


</script>

<style lang="scss" scoped>
.viewer3D {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .button1 {
    position: absolute;
    z-index: 10000;
    left: 0;
  }
  .button2 {
    position: absolute;
    left: 40px;
    z-index: 10000;
  }
}
.userName {
  position: absolute;
  z-index: 100;
  padding: 0 20px;
  text-align: left;
  line-height: 60px;
  font-size: 16px;
  color: #fff;
  text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
  -webkit-text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
}
.viewer {
  position: relative;
  width: 100%;
  height: 100%;
  .viewer-menu {
    position: absolute;
    overflow: hidden;
    width: 100%;
    bottom: 75px;
    color: #fff;
    z-index: 101;
    .viewer-menu-list {
      display: flex;
      width: 100%;
      flex-wrap: nowrap;
      overflow-x: auto;
      .viewer-menu-item {
        position: relative;
        margin-right: 10px;
        border-radius: 5px;
        box-sizing: border-box;
        min-width: 70px;
        color: #fff;
        padding: 5px;
        line-height: 15px;
        display: inline-block;
        cursor: pointer;
        text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
        -webkit-text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: 0.24rem;
          strong {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 0.53333rem;
            border-radius: 50%;
          }
          span {
            padding-right: 10px;
            font-size: 12px;
          }
          i {
            font-size: 0.22rem;
            font-style: normal;
            color: #fff;
          }
          b {
            display: block;
            width: 100%;
            text-align: right;
            font-weight: 400;
            font-size: 0.22rem;
          }
        }
        p {
          display: inline-block;
          width: 50px;
          height: 0.4rem;
          margin: 2px 0;
        }
      }
      .viewer-menu-item-one {
        min-width: 55px;
        text-align: center;
        line-height: 45px;
        font-size: 0.24rem;
        border: 1px solid #ccc;
        background: #fff;
      }
    }
  }
}
.btn-style {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 100;
}
.bgSelect {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 10px;
  width: 40px;
  height: 40px;
  background: #444;
  z-index: 10000;
  border-radius: 50%;
  font-size: 35px;
  svg.icon {
    fill: #fff !important;
  }
}
.dicom-view {
  color: #fff;
  font-size: 20px;
}
.volume-container {
  position: absolute;
  left: 100px;
  top: 20px;
  z-index: 100;
}
.tools-ul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 55px;
  flex-direction: column;
  z-index: 100;
  li {
    width: 40px;
    height: 40px;
    font-size: 24px;
    background: #444;
    z-index: 10000;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 3px;
    svg.icon {
      fill: #fff !important;
    }
    &.active svg.icon {
      fill: #39a6ec !important;
    }
    &.dis-active svg.icon {
      fill: #fff !important;
    }
  }
}
.block-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  .van-slider {
    margin-bottom: 20px;
  }
  input {
    margin-bottom: 20px;
  }
}
.stl-list {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 65px;
  padding: 0 5px;
  box-sizing: border-box;
  overflow: hidden;
  touch-action: none;
}
.stl-item {
  display: flex;
  align-items: center;
  overflow-x: auto;
  height: 65px;
  li {
    display: flex;
    flex-direction: column;
    img {
      width: 40px;
      height: 40px;
    }
  }
  .stl-item-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    -webkit-box-shadow: 2px 2px 2px 2px #eee;
    box-shadow: 2px 2px 2px 2px #eee;
    height: 60px;
    margin-right: 15px;
    margin-bottom: 5px;
    border-radius: 5px;
    min-width: 60px;
    color: #fff;
    padding: 7px;
    line-height: 15px;
    display: inline-block;
    cursor: pointer;
    text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
    -webkit-text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
  }
}
:deep(.text-container) {
  position: relative;
  z-index: 10000;
  background-color: #000000;
  border-radius: 10px;
  padding: 10px;
}
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.touch-actio {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}
::selection {
  background-color: transparent;
  color: inherit;
}
#vtkContainer3d, canvas {
  transform: translateZ(0);
  will-change: transform;
}
#video {
  position: absolute;
  left: 0;
  top: 0;
  widows: 100%;
  height: 100%;
}
</style>
