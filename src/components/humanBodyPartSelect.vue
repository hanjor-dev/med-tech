<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="onClosed"
  >
    <div class="part-picker">
      <!-- 左侧：部位列表 -->
      <div class="list-section">
        <div class="section-title">部位列表</div>
        <div class="part-list" v-if="parts.length">
          <div
            v-for="part in parts"
            :key="part.id"
            class="part-item"
            :class="{ 'part-item--selected': selectedId === part.id }"
            @click="selectPart(part)"
          >
            <div class="part-info">
              <span class="part-name">{{ part.name }}</span>
              <span class="part-code">{{ part.code }}</span>
            </div>
            <div class="part-preview">
              <img :src="getSvgSrc(part.code)" :alt="part.name" class="preview-icon" />
            </div>
          </div>
        </div>
        <el-empty v-else-if="!loading" description="暂无可选部位" :image-size="60" />
      </div>

      <!-- 右侧：人体图区域 -->
      <div class="body-section">
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
              v-for="part in parts"
              :key="part.id"
              :src="getSvgSrc(part.code)"
              :alt="part.name"
              class="part-svg"
              :class="{ 'is-selected': selectedId === part.id }"
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
            @load="onImageLoad"
          />

          <!-- 已选部位标签 -->
          <div
            v-if="selectedPart"
            class="selected-part-label"
            :style="getHoverLabelStyle(selectedPart.code)"
          >
            {{ selectedPart.name }}
          </div>
        </div>
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
import { ref, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { bodyPartList, type BodyPartVO } from '@/api/bodyPart';

// 人体图原始尺寸
const BODY_IMAGE_WIDTH = 1122;
const BODY_IMAGE_HEIGHT = 1402;

// 人体图显示高度（固定值，宽度等比缩放）
const BODY_DISPLAY_HEIGHT = 550;

// 部位图片映射
const PART_SVG_MAP: Record<string, string> = {
  HEAD: '/static/image/buwei/head.svg',
  NECK: '/static/image/buwei/neck.svg',
  LEFT_ARM: '/static/image/buwei/leftArm.svg',
  RIGHT_ARM: '/static/image/buwei/rightArm.svg',
  ABDOMEN: '/static/image/buwei/abdomen.svg',
  LEFT_PALM: '/static/image/buwei/leftPalm.svg',
  RIGHT_PALM: '/static/image/buwei/rightPalm.svg',
  LEFT_LEG: '/static/image/buwei/leftLeg.svg',
  RIGHT_LEG: '/static/image/buwei/rightLeg.svg',
  LEFT_FOOT: '/static/image/buwei/leftFoot.svg',
  RIGHT_FOOT: '/static/image/buwei/rightFoot.svg',
  PELVIS: '/static/image/buwei/pelvis.svg',
  SPINE: '/static/image/buwei/spine.svg',
};

// 部位配置列表（坐标基于左上角原点，原始像素值）
const bodyPartConfigs: Array<{
  code: string;
  name: string;
  position: { x: number; y: number; w: number; h: number };
}> = [
  { code: 'HEAD', name: '头部', position: { x: 463.5, y: 18, w: 114.5, h: 160.5 } },
  { code: 'NECK', name: '头颈', position: { x: 453.5, y: 150.5, w: 129.5, h: 81.5 } },
  { code: 'LEFT_ARM', name: '左上肢', position: { x: 240, y: 257.5, w: 160.6, h: 375.5 } },
  { code: 'RIGHT_ARM', name: '右上肢', position: { x: 640.5, y: 253, w: 160, h: 383.5 } },
  { code: 'ABDOMEN', name: '腹部', position: { x: 415.5, y: 429, w: 211.5, h: 122.5 } },
  { code: 'LEFT_PALM', name: '左手掌', position: { x: 180, y: 603, w: 102, h: 137 } },
  { code: 'RIGHT_PALM', name: '右手掌', position: { x: 760, y: 610, w: 100.5, h: 131 } },
  { code: 'PELVIS', name: '盆骨', position: { x: 415.5, y: 515, w: 200.5, h: 154 } },
  { code: 'SPINE', name: '脊柱', position: { x: 490, y: 240, w: 65, h: 324 } },
  { code: 'LEFT_LEG', name: '左腿', position: { x: 380, y: 550, w: 126.5, h: 616 } },
  { code: 'RIGHT_LEG', name: '右腿', position: { x: 520, y: 540, w: 132, h: 626 } },
  { code: 'LEFT_FOOT', name: '左脚', position: { x: 360, y: 1160, w: 88, h: 98 } },
  { code: 'RIGHT_FOOT', name: '右脚', position: { x: 580, y: 1160, w: 89.5, h: 105 } }
];

export interface SelectedPart {
  id: number;
  code: string;
  name: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    bodyImageSrc?: string;
    initialId?: number | null;
    title?: string;
  }>(),
  {
    modelValue: false,
    bodyImageSrc: '/static/image/buwei/humanbody.png',
    initialId: null,
    title: '选择部位',
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

const loading = ref(false);
const parts = ref<BodyPartVO[]>([]);
const imgRef = ref<HTMLImageElement | null>(null);
const imageLoaded = ref(false);
const selectedId = ref<number | null>(null);

watch(dialogVisible, async (visible) => {
  if (visible) {
    selectedId.value = null;
    imageLoaded.value = false;
    imageDisplaySize.value = { width: 0, height: 0 };

    // 加载部位列表
    try {
      loading.value = true;
      const data = await bodyPartList();
      parts.value = data;
    } finally {
      loading.value = false;
    }

    // 如果有初始选中值
    if (props.initialId) {
      selectedId.value = props.initialId;
    }
  }
});

// 图片实际显示尺寸（用于热力图定位）
const imageDisplaySize = ref({ width: 0, height: 0 });

const selectedPart = computed(() => parts.value.find(p => p.id === selectedId.value) ?? null);

function getSvgSrc(code: string): string {
  return PART_SVG_MAP[code?.toUpperCase() || ''] || '/static/image/buwei/head.svg';
}

function getPartPosition(code: string): { x: number; y: number; w: number; h: number } | null {
  const config = bodyPartConfigs.find(c => c.code === code?.toUpperCase());
  return config?.position ?? null;
}

function getSvgStyle(part: BodyPartVO): Record<string, string> {
  const position = getPartPosition(part.code);
  if (!position) return { display: 'none' };

  const isSelected = selectedId.value !== null && part.id === selectedId.value;
  const opacity = isSelected ? 0.75 : 0.45;

  const scaleX = imageDisplaySize.value.width / BODY_IMAGE_WIDTH;
  const scaleY = imageDisplaySize.value.height / BODY_IMAGE_HEIGHT;

  const left = (position.x * scaleX + 16) + 'px';
  const top = (position.y * scaleY + 16) + 'px';
  const width = (position.w * scaleX) + 'px';
  const height = (position.h * scaleY) + 'px';

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
  const position = getPartPosition(code);
  if (!position) return { display: 'none' };

  const scaleX = imageDisplaySize.value.width / BODY_IMAGE_WIDTH;
  const scaleY = imageDisplaySize.value.height / BODY_IMAGE_HEIGHT;

  const left = ((position.x + position.w / 2) * scaleX + 16) + 'px';
  const top = ((position.y + position.h / 2) * scaleY + 16) + 'px';

  return {
    left,
    top,
    transform: 'translate(-50%, -50%)',
  };
}

function onPartClick(part: BodyPartVO) {
  selectedId.value = part.id;
}

function selectPart(part: BodyPartVO) {
  selectedId.value = part.id;
}

function onImageLoad() {
  const scale = BODY_DISPLAY_HEIGHT / BODY_IMAGE_HEIGHT;
  imageDisplaySize.value = {
    width: BODY_IMAGE_WIDTH * scale,
    height: BODY_DISPLAY_HEIGHT
  };
  imageLoaded.value = true;
}

function onClosed() {
  selectedId.value = null;
}

function confirmSelection() {
  if (selectedPart.value) {
    emit('confirm', {
      id: selectedPart.value.id,
      code: selectedPart.value.code,
      name: selectedPart.value.name,
    });
    dialogVisible.value = false;
  }
}
</script>

<style lang="scss" scoped>
.part-picker {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.list-section {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
}

.body-section {
  flex: 1;
  background: linear-gradient(180deg, #f0f9ff 0%, #e8f4fd 100%);
  border-radius: 12px;
  padding: 16px;
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

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #52c41a, #73d13d);
    border-radius: 2px;
  }
}

.part-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.part-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #fafafa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f9ff;
    border-color: #52c41a50;
  }

  &--selected {
    background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);
  }

  .part-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .part-name {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }

  .part-code {
    font-size: 11px;
    color: #8c8c8c;
  }

  .part-preview {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

    .preview-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }
}
</style>
