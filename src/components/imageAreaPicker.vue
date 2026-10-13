<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="min(520px, 94vw)"
    top="6vh"
    class="part-picker-dialog"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @closed="onClosed"
  >
    <div class="part-picker-scale-wrap" :style="wrapStyle">
      <div
        class="part-picker"
        ref="pickerRef"
        :style="{ transform: `scale(${pickerScale})` }"
      >
      <!-- 右侧：人体图区域 -->
      <div class="body-section">
        <!-- 加载状态 -->
        <div v-if="loading" class="body-loading">
          <el-icon class="is-loading" size="32"><Loading /></el-icon>
          <span>加载部位数据中...</span>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadError" class="body-error">
          <el-icon size="24"><WarningFilled /></el-icon>
          <span>{{ loadError }}</span>
          <el-button size="small" type="primary" plain @click="loadBodyParts">重试</el-button>
        </div>

        <!-- 人体图 -->
        <template v-else>
          <div class="body-wrap" ref="wrapRef">
            <!-- SVG 高亮覆盖层 -->
            <div
              class="heatmap-layer"
              :style="{
                width: imageDisplaySize.width + 'px',
                height: imageDisplaySize.height + 'px'
              }"
            >
              <img
                v-for="part in bodyPartConfigs"
                :key="part.code"
                :src="part.svg"
                :alt="part.bodyName"
                class="part-svg"
                :class="{ 'is-selected': selectedCode === part.code }"
                :style="getSvgStyle(part)"
                @click="onPartClick(part)"
              />
            </div>

            <!-- 基础人体图 -->
            <img
              ref="imgRef"
              :src="bodyImageSrc"
              alt="人体图"
              draggable="false"
              class="body-image"
            />

            <!-- 已选部位标签 -->
            <div
              v-if="selectedPart"
              class="selected-part-label"
              :style="getHoverLabelStyle(selectedPart.code)"
            >
              {{ selectedPart.bodyName }}
            </div>
          </div>
        </template>
      </div>

      <!-- 底部：部位标签 -->
      <!-- <div class="tags-section" v-if="bodyPartConfigs.length">
        <div
          v-for="part in bodyPartConfigs"
          :key="part.code"
          class="part-tag"
          :class="{ 'part-tag--selected': selectedCode === part.code }"
          @click="selectPart(part)"
        >
          {{ part.bodyName }}
        </div>
      </div> -->
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="!selectedPart">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Loading, WarningFilled } from '@element-plus/icons-vue';
import { bodyPartOptions } from '@/api/bodyPart';
import type { BodyPartOptionVO } from '@/api/bodyPart';

// 人体图原始尺寸
const BODY_IMAGE_WIDTH = 1122;
const BODY_IMAGE_HEIGHT = 1402;

// 人体图设计显示高度（小屏通过 transform 整体等比缩放）
const DESIGN_DISPLAY_HEIGHT = 550;

// 部位配置类型（组件内部用）
export interface BodyPartConfig {
  bodyName: string;
  name: string;
  code: string;
  svg: string;
  id: number;
  remark?: string | null;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// API name → SVG 文件名映射（按指定顺序排列）
const NAME_TO_SVG: Record<string, string> = {
  '头部': 'head.svg',
  '颈部': 'neck.svg',
  '胸部': 'chest.svg',
  '腹部': 'abdomen.svg',
  '脊柱': 'spine.svg',
  '右上肢': 'leftArm.svg',
  '左上肢': 'rightArm.svg',
  '右下肢': 'leftLeg.svg',
  '左下肢': 'rightLeg.svg',
  '左手': 'rightPalm.svg',
  '右手': 'leftPalm.svg',
  '左足': 'rightFoot.svg',
  '右足': 'leftFoot.svg',
  '盆腔': 'pelvis.svg',
  '支辅具/夹板': 'jb.png',
};

// 部位坐标配置（按指定顺序排列，基于人体图左上角原点）
const POSITION_MAP: Record<string, { x: number; y: number; w: number; h: number }> = {
  '头部':   { x: 463.5, y: 18,    w: 114.5, h: 160.5 },
  '颈部':   { x: 453.5, y: 150.5, w: 129.5, h: 81.5  },
  '胸部':   { x: 445.5, y: 230,   w: 155,   h: 180   },
  '腹部':   { x: 415.5, y: 429,   w: 211.5, h: 122.5 },
  '脊柱':   { x: 490,   y: 240,   w: 65,    h: 324   },
  '右上肢': { x: 240,   y: 257.5, w: 160.6, h: 375.5 },
  '左上肢': { x: 640.5, y: 253,   w: 160,   h: 383.5 },
  '右下肢': { x: 380,   y: 550,   w: 126.5, h: 616   },
  '左下肢': { x: 520,   y: 540,   w: 132,   h: 626   },
  '右手':   { x: 180,   y: 603,   w: 102,   h: 137   },
  '左手':   { x: 760,   y: 610,   w: 100.5, h: 131   },
  '右足':   { x: 360,   y: 1160,  w: 88,    h: 98    },
  '左足':   { x: 580,   y: 1160,  w: 89.5,  h: 105   },
  '盆腔':   { x: 415.5, y: 515,   w: 200.5, h: 154   },
  // 支辅具/夹板不属于人体区域，放在人体图左上角空白处
  '支辅具/夹板': { x: 60, y: 30, w: 190, h: 190 },
};

export interface SelectedPart {
  id: number;
  name: string;
  code: string;
  svg: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    bodyImageSrc?: string;
    initialCode?: string | null;
    title?: string;
  }>(),
  {
    modelValue: false,
    bodyImageSrc: '/static/image/buwei/humanbody.png',
    initialCode: null,
    title: '选择扫描部位',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'confirm', part: SelectedPart): void;
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const dialogTitle = computed(() => props.title);

const imgRef = ref<HTMLImageElement | null>(null);
const selectedCode = ref<string | null>(null);

// 动态部位列表
const bodyPartConfigs = ref<BodyPartConfig[]>([]);
const loading = ref(false);
const loadError = ref('');

// 部位顺序定义（按指定顺序排列）
const BODY_PART_ORDER = [
  '头部', '颈部', '胸部', '腹部',
  '左上肢', '右上肢', '左下肢', '右下肢',
  '左手', '右手', '左足', '右足','脊柱', '盆腔', '支辅具/夹板'
];

// 根据 API 数据构建配置列表（按指定顺序排列）
function buildBodyPartConfigs(apiList: BodyPartOptionVO[]): BodyPartConfig[] {
  // 创建 API 数据映射
  const apiMap = new Map(apiList.map(item => [item.name, item]));

  // 按指定顺序构建配置列表
  return BODY_PART_ORDER
    .filter(name => NAME_TO_SVG[name] && apiMap.has(name))
    .map(name => {
      const item = apiMap.get(name)!;
      return {
        id: item.id,
        bodyName: item.name,
        name: item.name,
        code: item.code,
        svg: `/static/image/buwei/${NAME_TO_SVG[name]}`,
        remark: item.remark,
        position: POSITION_MAP[name] || { x: 0, y: 0, w: 100, h: 100 },
      };
    });
}

// 加载部位列表
async function loadBodyParts() {
  loading.value = true;
  loadError.value = '';
  try {
    const list = await bodyPartOptions();
    bodyPartConfigs.value = buildBodyPartConfigs(list);
  } catch (err: any) {
    loadError.value = err?.message || '加载部位列表失败';
  } finally {
    loading.value = false;
  }
}

// 监听弹窗打开，加载数据并设置初始选中部位
watch(dialogVisible, (visible) => {
  if (visible) {
    selectedCode.value = null;

    if (bodyPartConfigs.value.length === 0) {
      loadBodyParts();
    }

    if (props.initialCode) {
      selectedCode.value = props.initialCode;
    }
  }
});

// 视口尺寸（用于自适应计算）
const viewportWidth = ref(window.innerWidth);
const viewportHeight = ref(window.innerHeight);

function updateViewport() {
  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;
}

onMounted(() => {
  window.addEventListener('resize', updateViewport);
  resizeObserver = new ResizeObserver(() => {
    if (pickerRef.value) {
      pickerSize.value = {
        width: pickerRef.value.offsetWidth,
        height: pickerRef.value.offsetHeight,
      };
    }
  });
});
onUnmounted(() => {
  window.removeEventListener('resize', updateViewport);
  resizeObserver?.disconnect();
});

// 图片实际显示尺寸（固定设计尺寸，热区定位随整体 transform 缩放）
const imageDisplaySize = computed(() => {
  const scale = DESIGN_DISPLAY_HEIGHT / BODY_IMAGE_HEIGHT;
  return {
    width: BODY_IMAGE_WIDTH * scale,
    height: DESIGN_DISPLAY_HEIGHT,
  };
});

// 实际内容尺寸（未缩放时的设计尺寸）
const pickerRef = ref<HTMLElement | null>(null);
const pickerSize = ref({ width: 0, height: 0 });

let resizeObserver: ResizeObserver | null = null;

watch(pickerRef, (el) => {
  resizeObserver?.disconnect();
  if (el) {
    resizeObserver?.observe(el);
    pickerSize.value = { width: el.offsetWidth, height: el.offsetHeight };
  }
});

// 小屏时对整个选择器做等比缩放，避免溢出
const pickerScale = computed(() => {
  const { width, height } = pickerSize.value;
  if (!width || !height) return 1;
  // 顶部边距 6vh，弹窗头部/底部/内边距约 150px
  const availH = viewportHeight.value * 0.94 - 150;
  const availW = Math.min(520, viewportWidth.value * 0.94) - 24;
  return Math.min(1, availW / width, availH / height);
});

// 缩放后占位尺寸（transform 不影响布局，需手动占位）
const wrapStyle = computed(() => {
  const { width, height } = pickerSize.value;
  if (!width || !height) return {};
  return {
    width: width * pickerScale.value + 'px',
    height: height * pickerScale.value + 'px',
  };
});

const selectedPart = computed(() =>
  bodyPartConfigs.value.find(p => p.code === selectedCode.value) ?? null
);

function getSvgStyle(part: BodyPartConfig): Record<string, string> {
  const isSelected = selectedCode.value !== null && part.code === selectedCode.value;
  const opacity = isSelected ? 0.75 : 0.45;

  const scaleX = imageDisplaySize.value.width / BODY_IMAGE_WIDTH;
  const scaleY = imageDisplaySize.value.height / BODY_IMAGE_HEIGHT;

  const left = (part.position.x * scaleX + 16) + 'px';
  const top = (part.position.y * scaleY + 16) + 'px';
  const width = (part.position.w * scaleX) + 'px';
  const height = (part.position.h * scaleY) + 'px';

  return {
    position: 'absolute',
    left,
    top,
    width,
    height,
    opacity: String(opacity),
    transition: 'opacity 0.2s, filter 0.2s',
    cursor: 'pointer',
  };
}

function getHoverLabelStyle(code: string): Record<string, string> {
  const part = bodyPartConfigs.value.find(p => p.code === code);
  if (!part) return { display: 'none' };

  const scaleX = imageDisplaySize.value.width / BODY_IMAGE_WIDTH;
  const scaleY = imageDisplaySize.value.height / BODY_IMAGE_HEIGHT;

  const left = ((part.position.x + part.position.w / 2) * scaleX + 16) + 'px';
  const top = ((part.position.y + part.position.h / 2) * scaleY + 16) + 'px';

  return {
    left,
    top,
    transform: 'translate(-50%, -50%)',
  };
}

function onPartClick(part: BodyPartConfig) {
  selectedCode.value = part.code;
}

function selectPart(part: BodyPartConfig) {
  selectedCode.value = part.code;
}

function onClosed() {
  selectedCode.value = null;
}

function confirmSelection() {
  if (selectedPart.value) {
    emit('confirm', {
      id: selectedPart.value.id,
      name: selectedPart.value.name,
      code: selectedPart.value.code,
      svg: selectedPart.value.svg,
    });
    dialogVisible.value = false;
  }
}
</script>

<style lang="scss" scoped>
.part-picker-scale-wrap {
  margin: 0 auto;
}

.part-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
  width: fit-content;
  transform-origin: top left;
}

.body-section {
  position: relative;
  background: linear-gradient(180deg, #f0f9ff 0%, #e8f4fd 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.body-loading,
.body-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  color: #595959;
  font-size: 14px;
}

.body-error {
  color: #dc2626;
  gap: 10px;
}

.body-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  user-select: none;
}

.body-image {
  display: block;
  height: 550px;
  width: auto;
  border-radius: 8px;
}

.heatmap-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .part-svg {
    position: absolute;
    pointer-events: auto;
    border-radius: 6px;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    object-fit: contain;

    &.is-selected {
      filter: drop-shadow(0 0 12px rgba(82, 196, 26, 0.8)) brightness(1.1);
      transform: scale(1.02);
    }
  }
}

.selected-part-label {
  position: absolute;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;

}

.list-loading,
.list-error,
.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 16px;
  color: #8c8c8c;
  font-size: 13px;
}

// 底部部位标签
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 10px;
  justify-content: center;
}

.part-tag {
  padding: 6px 14px;
  background: #fff;
  border: 1.5px solid #e8e8e8;
  border-radius: 16px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background: #f0f9ff;
    border-color: #52c41a50;
    color: #52c41a;
  }

  &--selected {
    background: linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%);
    border-color: #91d5ff;
    color: #1890ff;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
  }
}
</style>

<style lang="scss">
// 弹窗内容超出视口时滚动兜底（append-to-body，需全局样式）
.part-picker-dialog {
  .el-dialog__body {
    max-height: calc(94vh - 140px);
    overflow-y: auto;
  }
}
</style>
