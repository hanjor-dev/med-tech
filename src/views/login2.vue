<template>
  <div class="login-page">
    <!-- 动态粒子背景 -->
    <div class="particle-field" ref="particleCanvas">
      <canvas ref="canvasRef"></canvas>
    </div>
    <div class="scanline-overlay"></div>

    <!-- 背景光晕 -->
    <div class="bg-glow">
      <div class="glow-blob blob-1"><div class="glow-blob-inner"></div></div>
      <div class="glow-blob blob-2"><div class="glow-blob-inner"></div></div>
      <div class="glow-blob blob-3"><div class="glow-blob-inner"></div></div>
    </div>

    <!-- 左侧品牌区 -->
    <div class="brand-panel">
      <div class="brand-content">
        <!-- Logo -->
        <div class="brand-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" fill="url(#logoBg)" opacity="0.9"/>
              <path d="M18 24h8v16h-8zM27 18h8v22h-8zM36 27h8v13h-8z" fill="white" opacity="0.95"/>
              <path d="M18 24l8-6 8 6v16l-8 6-8-6V24z" fill="white" opacity="0.25"/>
              <circle cx="30" cy="30" r="4" fill="white" opacity="0.8"/>
              <defs>
                <linearGradient id="logoBg" x1="0" y1="0" x2="60" y2="60">
                  <stop stop-color="#93C5FD"/>
                  <stop offset="0.5" stop-color="#3B82F6"/>
                  <stop offset="1" stop-color="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="logo-title">医工宝</h1>
            <p class="logo-subtitle">MedTech Buddy Platform</p>
          </div>
        </div>

        <!-- 标语 -->
        <div class="brand-slogan">
          <div class="slogan-badge">
            <span class="badge-dot"></span>
            智能医疗 3D 打印
          </div>
          <h2 class="slogan-main">
            数字化医疗<br/>
            <span class="slogan-highlight">让精准触手可及</span>
          </h2>
          <p class="slogan-desc">
            基于 3D 打印技术的个性化医疗器械服务平台<br/>
            连接医工供需，提升服务效能
          </p>
        </div>

        <!-- 装饰线 -->
        <div class="brand-divider">
          <span class="divider-line"></span>
          <span class="divider-text">核心能力</span>
          <span class="divider-line"></span>
        </div>

        <!-- 核心能力卡片 -->
        <div class="feature-grid">
          <div
            class="feature-card"
            v-for="(feature, index) in features"
            :key="index"
            :style="{ animationDelay: (0.9 + index * 0.12) + 's' }"
          >
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path :d="feature.icon" />
              </svg>
            </div>
            <div class="feature-body">
              <h4 class="feature-title">{{ feature.title }}</h4>
              <p class="feature-desc">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 3D 装饰球 -->
        <div class="deco-sphere">
          <div class="sphere-inner"></div>
        </div>

        <!-- 电路节点装饰 -->
        <div class="circuit-nodes" aria-hidden="true">
          <span class="circuit-node cn-1"></span>
          <span class="circuit-node cn-2"></span>
          <span class="circuit-node cn-3"></span>
          <span class="circuit-node cn-4"></span>
          <span class="circuit-line cl-1"></span>
          <span class="circuit-line cl-2"></span>
        </div>

        <!-- 科技数据角标 -->
        <div class="tech-badge" aria-hidden="true">
          <span class="tech-badge-line">SYS // ONLINE</span>
          <span class="tech-badge-line">v3.2.1</span>
          <span class="tech-badge-line blink-dot">■</span>
        </div>
      </div>

      <div class="brand-footer">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <span class="footer-sep">·</span>
          <a href="#">隐私政策</a>
          <span class="footer-sep">·</span>
          <a href="#">服务条款</a>
        </div>
        <p class="copyright">© 2024 医工宝 Medical-Tech Buddy. 保留所有权利.</p>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="login-panel">
      <!-- 右上角脉冲点 -->
      <span class="pulse-dot top-right"></span>
      <!-- 左下角脉冲点 -->
      <span class="pulse-dot bottom-left"></span>
      <!-- 电路纹理 -->
      <div class="circuit-trace right-trace"></div>

      <div class="login-card">
        <!-- 顶部科技渐变条 -->
        <div class="card-accent-bar"></div>
        <!-- 四角装饰 -->
        <span class="card-corner tl"></span>
        <span class="card-corner tr"></span>
        <span class="card-corner bl"></span>
        <span class="card-corner br"></span>

        <div class="card-inner">
          <div class="login-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
              </svg>
            </div>
            <h2 class="login-title">欢迎回来</h2>
            <p class="login-subtitle">登录您的账户以继续使用</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <!-- 用户名 -->
            <div class="form-group" :class="{ 'has-value': loginForm.username }">
              <label class="form-label-float">用户名</label>
              <div class="input-wrap" :class="{ focused: usernameFocus, error: errors.username }">
                <span class="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  v-model="loginForm.username"
                  @focus="usernameFocus = true"
                  @blur="usernameFocus = false"
                  autocomplete="username"
                />
                <button v-if="loginForm.username" type="button" class="input-suffix" @click="loginForm.username = ''">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
            </div>

            <!-- 密码 -->
            <div class="form-group" :class="{ 'has-value': loginForm.password }">
              <label class="form-label-float">密码</label>
              <div class="input-wrap" :class="{ focused: passwordFocus, error: errors.password }">
                <span class="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                </span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="loginForm.password"
                  @focus="passwordFocus = true"
                  @blur="passwordFocus = false"
                  autocomplete="current-password"
                />
                <button type="button" class="input-suffix toggle-pwd" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
            </div>

            <!-- 验证码 -->
            <div class="form-group code-group" :class="{ 'has-value': loginForm.code }">
              <label class="form-label-float">验证码</label>
              <div class="input-wrap" :class="{ focused: codeFocus }">
                <span class="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    <circle cx="12" cy="16" r="1"/>
                  </svg>
                </span>
                <input
                  type="text"
                  v-model="loginForm.code"
                  maxlength="4"
                  @focus="codeFocus = true"
                  @blur="codeFocus = false"
                  autocomplete="one-time-code"
                  placeholder=""
                />
                <div class="code-captcha" @click="refreshCode">
                  <span v-for="(c, i) in captchaDisplay" :key="i" :style="{ transform: `rotate(${c.rotate}deg)` }">{{ c.char }}</span>
                </div>
              </div>
            </div>

            <!-- 选项行 -->
            <div class="form-row">
              <label class="check-wrap">
                <input type="checkbox" v-model="loginForm.remember" />
                <span class="check-mark">
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="check-label">记住我</span>
              </label>
              <a href="#" class="link-forgot">忘记密码？</a>
            </div>

            <!-- 登录按钮 -->
            <button type="submit" class="btn-login" :class="{ loading: isLoading }" :disabled="isLoading">
              <span class="btn-content" v-if="!isLoading">
                <svg class="btn-content-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span class="btn-text">登录</span>
              </span>
              <span class="btn-loading" v-else>
                <span class="spinner"></span>
                登录中...
              </span>
            </button>
          </form>

          <div class="login-footer">
            <span>还没有账户？</span>
            <a href="#" class="link-register">联系管理员开通</a>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="panel-footer">
        <div class="security-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>SSL 加密传输</span>
        </div>
        <div class="version-tag">v2.4.1</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';

const usernameFocus = ref(false);
const passwordFocus = ref(false);
const codeFocus = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId = 0;

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  remember: false,
});

const errors = reactive({
  username: '',
  password: '',
});

const captchaChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const captchaDisplay = ref<{ char: string; rotate: number }[]>([]);

const generateCaptcha = () => {
  captchaDisplay.value = Array.from({ length: 4 }, () => ({
    char: captchaChars[Math.floor(Math.random() * captchaChars.length)],
    rotate: (Math.random() - 0.5) * 40,
  }));
};

const refreshCode = () => {
  generateCaptcha();
};

const features = [
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    title: '全流程订单管理',
    desc: '从提单到交付的完整闭环',
  },
  {
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96 12 12.01l8.73-5.05 M12 22.08V12',
    title: '3D 设计可视化',
    desc: '实时预览与交互编辑',
  },
  {
    icon: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
    title: '智能生产追踪',
    desc: '扫码全链路状态追溯',
  },
  {
    icon: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',
    title: '多维数据分析',
    desc: '经营决策数据支撑',
  },
];

const handleLogin = () => {
  errors.username = '';
  errors.password = '';

  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名';
    return;
  }
  if (!loginForm.password) {
    errors.password = '请输入密码';
    return;
  }

  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    console.log('登录信息:', loginForm);
  }, 1800);
};

// 粒子动画
interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; color: string;
}

let particles: Particle[] = [];
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const initParticles = () => {
  canvas = canvasRef.value!;
  if (!canvas) return;
  ctx = canvas.getContext('2d')!;
  resizeCanvas();

  const colors = ['59, 130, 246', '99, 102, 241', '147, 197, 253', '6, 182, 212', '99, 102, 241'];
  particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 3 + 1.5,
    opacity: Math.random() * 0.6 + 0.15,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  animateParticles();
};

const resizeCanvas = () => {
  if (!canvas) return;
  canvas.width = canvas.parentElement!.offsetWidth;
  canvas.height = canvas.parentElement!.offsetHeight;
};

const animateParticles = () => {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // 连线（科技感加粗发光）
    particles.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.strokeStyle = `rgb(${p.color.split(',')[0]}, ${p.color.split(',')[1]}, ${p.color.split(',')[2]})`;
        ctx.globalAlpha = (1 - dist / 140) * 0.22;
        ctx.lineWidth = 0.8;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // 发光光晕
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
    grd.addColorStop(0, `rgba(${p.color}, ${p.opacity * 0.6})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.globalAlpha = 1;
    ctx.fill();

    // 粒子点
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${p.color})`;
    ctx.globalAlpha = p.opacity + 0.25;
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  animationId = requestAnimationFrame(animateParticles);
};

let resizeTimer: ReturnType<typeof setTimeout>;
const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 200);
};

onMounted(() => {
  generateCaptcha();
  initParticles();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
});
</script>

<style lang="scss" scoped>
/* =============================================
   TOKENS（挂在 .login-page：scoped 下 :root 不会匹配，变量会全部失效）
   ============================================= */
.login-page {
  --blue-50:  #dbeafe;
  --blue-100: #bfdbfe;
  --blue-200: #93c5fd;
  --blue-300: #60a5fa;
  --blue-400: #3b82f6;
  --blue-500: #2563eb;
  --blue-600: #1d4ed8;
  --blue-700: #1e40af;
  --blue-800: #1e3a8a;
  --blue-900: #1e3a5f;

  --white:     #f8fafc;
  --gray-50:  #0f172a;
  --gray-100: #1e293b;
  --gray-200: #334155;
  --gray-300: #475569;
  --gray-400: #64748b;
  --gray-500: #94a3b8;
  --gray-600: #cbd5e1;
  --gray-700: #e2e8f0;
  --gray-800: #f1f5f9;
  --gray-900: #ffffff;

  --red-400: #f87171;
  --red-500: #ef4444;
  --red-600: #dc2626;

  color: #e2e8f0;

  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 90% 70% at 100% 0%, rgb(59 130 246 / 0.12), transparent 55%),
    radial-gradient(ellipse 70% 55% at 0% 100%, rgb(30 58 138 / 0.15), transparent 50%),
    radial-gradient(ellipse 50% 40% at 70% 60%, rgb(37 99 235 / 0.1), transparent 45%),
    linear-gradient(168deg, #030712 0%, #0f172a 28%, #0c1530 55%, #050d1a 100%);
}

/* =============================================
   PARTICLE CANVAS
   ============================================= */
.particle-field {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}

/* 扫描线 */
.scanline-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 10, 40, 0.02) 3px,
    rgba(0, 10, 40, 0.02) 4px
  );

  // 水平扫描光
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.06), transparent);
    animation: scanLine 8s linear infinite;
    pointer-events: none;
  }
}

@keyframes scanLine {
  0%   { top: -2px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100vh; opacity: 0; }
}

/* =============================================
   GLOW BLOBS
   ============================================= */
.bg-glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  will-change: transform;
}

.glow-blob-inner {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.5);
  animation: pulseCore 4s ease-in-out infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.blob-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.15) 45%, transparent 72%);
  top: -200px;
  left: -150px;
  animation: blobFloat1 25s ease-in-out infinite;

  .glow-blob-inner { width: 320px; height: 320px; animation-delay: 0s; }
}

.blob-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 72%);
  bottom: -200px;
  right: -100px;
  animation: blobFloat2 30s ease-in-out infinite;

  .glow-blob-inner { width: 260px; height: 260px; animation-delay: -1.5s; }
}

.blob-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(96, 165, 250, 0.15) 50%, transparent 70%);
  top: 40%;
  left: 35%;
  animation: blobFloat3 20s ease-in-out infinite;

  .glow-blob-inner { width: 180px; height: 180px; animation-delay: -3s; }
}

@keyframes blobFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(60px, -40px) scale(1.08); }
  66%       { transform: translate(-30px, 50px) scale(0.95); }
}

@keyframes blobFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40%       { transform: translate(-50px, 60px) scale(1.05); }
  70%       { transform: translate(40px, -30px) scale(0.9); }
}

@keyframes blobFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(40px, -40px) scale(1.1); }
}

@keyframes pulseCore {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.85); }
  50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
}

/* =============================================
   BRAND PANEL
   ============================================= */
.brand-panel {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 64px;
  position: relative;
  z-index: 1;
  color: rgba(226, 232, 240, 0.96);
  background: linear-gradient(
    148deg,
    var(--blue-900) 0%,
    var(--blue-800) 35%,
    var(--blue-700) 65%,
    var(--blue-900) 100%
  );
  overflow: hidden;

  // 纹理叠加
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(147, 197, 253, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%);
    pointer-events: none;
  }

  // 网格纹理
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Logo */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 52px;
  animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.logo-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  filter: drop-shadow(0 8px 20px rgba(59, 130, 246, 0.4));

  svg {
    width: 60px;
    height: 60px;
  }
}

.logo-text {
  .logo-title {
    font-size: 30px;
    font-weight: 800;
    color: var(--white);
    margin: 0 0 4px;
    letter-spacing: 3px;
    text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .logo-subtitle {
    font-size: 11px;
    color: var(--blue-300);
    margin: 0;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.9;
  }
}

/* Slogan */
.brand-slogan {
  margin-bottom: 36px;
  animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.slogan-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #dbeafe;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(147, 197, 253, 0.28);
  border-radius: 20px;
  padding: 5px 14px;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue-400);
  animation: badgePulse 2s ease infinite;
}

@keyframes badgePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.3); }
}

.slogan-main {
  font-size: 42px;
  font-weight: 800;
  color: var(--white);
  margin: 0 0 18px;
  line-height: 1.25;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

.slogan-highlight {
  background: linear-gradient(90deg, var(--blue-300), var(--blue-100));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slogan-desc {
  font-size: 15px;
  color: #bfdbfe;
  margin: 0;
  line-height: 1.7;
  opacity: 0.95;
}

/* Divider */
.brand-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(147, 197, 253, 0.3), transparent);
}

.divider-line:last-child {
  background: linear-gradient(270deg, rgba(147, 197, 253, 0.3), transparent);
}

.divider-text {
  font-size: 11px;
  font-weight: 600;
  color: #93c5fd;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.92;
}

/* Feature grid */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 40px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(147, 197, 253, 0.22);
  border-radius: 14px;
  box-shadow:
    0 4px 20px rgb(0 0 0 / 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  position: relative;
  overflow: hidden;

  // 左侧蓝色发光指示条
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    background: linear-gradient(180deg, transparent, var(--blue-400), transparent);
    border-radius: 0 2px 2px 0;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    background: rgba(30, 58, 138, 0.45);
    border-color: rgba(147, 197, 253, 0.4);
    transform: translateY(-2px);
    box-shadow:
      0 8px 28px rgb(0 0 0 / 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(14px);

    &::before { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}

.feature-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--blue-500), rgba(99, 102, 241, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
  position: relative;

  // 图标内微光
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 4px;
    right: 4px;
    height: 1px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--white);
    position: relative;
    z-index: 1;
  }
}

.feature-body {
  .feature-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--white);
    margin: 0 0 4px;
  }

  .feature-desc {
    font-size: 11px;
    color: #dbeafe;
    margin: 0;
    line-height: 1.5;
    opacity: 1;
    font-weight: 500;
  }
}

/* 装饰球 */
.deco-sphere {
  position: absolute;
  right: -80px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 300px;
  opacity: 0.06;
  pointer-events: none;

  .sphere-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, var(--blue-400), var(--blue-800));
    box-shadow:
      inset -30px -30px 60px rgba(0, 0, 0, 0.3),
      inset 20px 20px 40px rgba(255, 255, 255, 0.1);
  }
}

/* 电路节点装饰 */
.circuit-nodes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.circuit-node {
  position: absolute;
  border-radius: 50%;
  background: var(--blue-400);
  box-shadow: 0 0 8px var(--blue-400), 0 0 16px rgba(59, 130, 246, 0.5);
  animation: nodeGlow 3s ease-in-out infinite;

  &.cn-1 { width: 8px; height: 8px; top: 12%; right: 8%; animation-delay: 0s; }
  &.cn-2 { width: 6px; height: 6px; top: 28%; right: 14%; animation-delay: -1s; }
  &.cn-3 { width: 10px; height: 10px; bottom: 22%; right: 5%; animation-delay: -2s; }
  &.cn-4 { width: 5px; height: 5px; bottom: 40%; right: 18%; animation-delay: -0.5s; }
}

.circuit-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
  animation: lineFlow 4s linear infinite;

  &.cl-1 { height: 1px; width: 80px; top: 14%; right: 0; animation-duration: 5s; }
  &.cl-2 { height: 1px; width: 60px; bottom: 24%; right: 0; animation-duration: 7s; animation-direction: reverse; }
}

@keyframes nodeGlow {
  0%, 100% { opacity: 0.5; transform: scale(0.9); }
  50%       { opacity: 1; transform: scale(1.2); }
}

@keyframes lineFlow {
  0%   { opacity: 0; transform: scaleX(0); transform-origin: right; }
  20%  { opacity: 1; }
  80%  { opacity: 1; transform: scaleX(1); transform-origin: right; }
  100% { opacity: 0; transform: scaleX(0); transform-origin: left; }
}

/* 科技数据角标 */
.tech-badge {
  position: absolute;
  bottom: 12%;
  right: 8%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
}

.tech-badge-line {
  font-size: 9px;
  font-family: 'Courier New', 'SF Mono', monospace;
  color: var(--blue-300);
  opacity: 0.45;
  letter-spacing: 1px;
  line-height: 1.6;

  &.blink-dot {
    color: #06b6d4;
    animation: blink 2s step-end infinite;
  }
}

@keyframes blink {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0; }
}

/* Footer */
.brand-footer {
  position: relative;
  z-index: 1;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  a {
    font-size: 12px;
    color: #93c5fd;
    text-decoration: none;
    opacity: 0.88;
    transition: opacity 0.2s, color 0.2s;

    &:hover {
      opacity: 1;
      color: #bfdbfe;
    }
  }

  .footer-sep {
    color: #60a5fa;
    opacity: 0.55;
    font-size: 12px;
  }
}

.copyright {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  opacity: 0.9;
}

/* =============================================
   LOGIN PANEL
   ============================================= */
.login-panel {
  width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  // 与左侧 brand-panel 同系蓝渐变，避免近黑底；叠加柔光与网格
  background:
    radial-gradient(ellipse 90% 70% at 100% 20%, rgba(147, 197, 253, 0.14) 0%, transparent 52%),
    radial-gradient(ellipse 70% 55% at 0% 85%, rgba(99, 102, 241, 0.12) 0%, transparent 48%),
    linear-gradient(
      148deg,
      var(--blue-900) 0%,
      var(--blue-800) 32%,
      var(--blue-700) 58%,
      var(--blue-900) 100%
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 38px,
      rgba(255, 255, 255, 0.04) 38px,
      rgba(255, 255, 255, 0.04) 39px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 38px,
      rgba(255, 255, 255, 0.04) 38px,
      rgba(255, 255, 255, 0.04) 39px
    );
  border-left: 1px solid rgba(147, 197, 253, 0.22);

  // 顶部蓝色光条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--blue-400), transparent);
    border-radius: 0 0 2px 2px;
  }

  // 底部脉冲光晕（与左侧光感一致）
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 240px;
    height: 140px;
    background: radial-gradient(ellipse, rgba(147, 197, 253, 0.2) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 72%);
    animation: panelPulse 4s ease-in-out infinite;
    pointer-events: none;
  }
}

@keyframes panelPulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50%       { opacity: 1;   transform: translateX(-50%) scale(1.15); }
}

/* 脉冲点 */
.pulse-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--blue-400);
  z-index: 5;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid rgba(59, 130, 246, 0.5);
    animation: dotRipple 2s ease-out infinite;
  }

  &.top-right {
    top: 28px;
    right: 24px;
  }

  &.bottom-left {
    bottom: 32px;
    left: 20px;
    background: rgba(6, 182, 212, 0.7);

    &::before { border-color: rgba(6, 182, 212, 0.35); }
  }
}

@keyframes dotRipple {
  0%   { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* 电路纹理 */
.circuit-trace {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;

  &.right-trace {
    top: 80px;
    right: 12px;
    width: 48px;
    height: 120px;
    border-right: 1.5px solid rgba(59, 130, 246, 0.5);
    border-top: 1.5px solid rgba(59, 130, 246, 0.5);
    border-bottom: 1.5px solid rgba(59, 130, 246, 0.5);
    border-radius: 0 6px 6px 0;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--blue-400);
      animation: nodeBlink 3s ease-in-out infinite;
    }

    &::before { top: -3px; right: -3px; animation-delay: 0s; }
    &::after  { bottom: -3px; right: -3px; animation-delay: 1.5s; }
  }
}

@keyframes nodeBlink {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

/* Card */
.login-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(191, 219, 254, 0.08) 45%,
    rgba(255, 255, 255, 0.06) 100%
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  box-shadow:
    0 0 0 1px rgba(147, 197, 253, 0.28),
    0 8px 32px rgba(15, 23, 42, 0.18),
    0 24px 48px rgba(30, 58, 138, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 0 48px rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(191, 219, 254, 0.35);
  overflow: visible;
  animation: cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  position: relative;

  // 顶部科技渐变条
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--blue-300), var(--blue-400), var(--blue-300), transparent);
    border-radius: 0 0 4px 4px;
    animation: shimmer 3.5s ease infinite;
  }

  // 边框脉冲光晕
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.15));
    opacity: 0;
    z-index: -1;
    animation: cardGlow 4s ease-in-out infinite;
  }
}

@keyframes cardGlow {
  0%, 100% { opacity: 0; }
  50%       { opacity: 1; }
}

@keyframes iconBreath {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
  }
  50% {
    box-shadow: 0 4px 24px rgba(59, 130, 246, 0.45), 0 0 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.18);
    border-color: rgba(59, 130, 246, 0.55);
  }
}

/* 卡片四角装饰 */
.card-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: var(--blue-400);
    border-radius: 1px;
  }

  &::before { width: 100%; height: 2px; }
  &::after  { width: 2px; height: 100%; }

  &.tl { top: 8px; left: 8px; }
  &.tr { top: 8px; right: 8px; transform: scaleX(-1); }
  &.bl { bottom: 8px; left: 8px; transform: scaleY(-1); }
  &.br { bottom: 8px; right: 8px; transform: scale(-1); }
}

@keyframes cardAppear {
  from { opacity: 0; transform: scale(0.96) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.card-accent-bar {
  height: 4px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--blue-400) 20%,
    var(--blue-500) 40%,
    #06b6d4 60%,
    var(--blue-500) 80%,
    transparent 100%
  );
  background-size: 300% 100%;
  animation: shimmer 3.5s ease infinite;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.55), 0 0 24px rgba(59, 130, 246, 0.2);
  border-radius: 24px 24px 0 0;
}

@keyframes shimmer {
  0%   { background-position: 300% 0; }
  100% { background-position: -300% 0; }
}

.card-inner {
  padding: 36px 40px 40px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(99, 102, 241, 0.25));
  border: 1px solid rgba(59, 130, 246, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  animation: iconBreath 3s ease-in-out infinite;

  svg {
    width: 24px;
    height: 24px;
    color: var(--blue-300);
  }
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}

.login-subtitle {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0;
}

/* =============================================
   FORM
   ============================================= */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;

  // 浮动标签
  .form-label-float {
    position: absolute;
    top: 16px;
    left: 46px;
    font-size: 14px;
    font-weight: 500;
    color: #94a3b8;
    pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    background: transparent;
  }

  &.has-value .form-label-float,
  .input-wrap.focused ~ .form-label-float,
  .input-wrap.focused + .form-label-float {
    top: -8px;
    left: 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--blue-400);
    background: rgba(30, 64, 175, 0.55);
    padding: 0 6px;
    letter-spacing: 0.3px;
  }

  .input-wrap.focused ~ .form-label-float {
    color: var(--blue-300);
  }

  &.has-value .form-label-float {
    top: -8px;
    left: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    background: rgba(30, 64, 175, 0.55);
    padding: 0 6px;
  }
}

.input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(191, 219, 254, 0.28);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: linear-gradient(180deg, var(--blue-300), var(--blue-500));
    border-radius: 0 2px 2px 0;
    transition: height 0.3s ease;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  }

  &:hover {
    border-color: rgba(191, 219, 254, 0.45);
    background: rgba(255, 255, 255, 0.16);

    &::before { height: 30%; }
  }

  &.focused {
    border-color: rgba(147, 197, 253, 0.65);
    background: rgba(255, 255, 255, 0.18);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14), 0 0 24px rgba(59, 130, 246, 0.12);

    &::before { height: 70%; }
  }

  &.error {
    border-color: var(--red-500);
    background: rgba(239, 68, 68, 0.08);

    &.focused {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
    }
  }

  input {
    flex: 1;
    height: 52px;
    padding: 0 14px;
    font-size: 14px;
    font-family: inherit;
    color: #f1f5f9;
    background: transparent;
    border: none;
    outline: none;

    &::placeholder { color: transparent; }
  }
}

.input-prefix-icon {
  width: 44px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 17px;
    height: 17px;
    color: #94a3b8;
    transition: color 0.2s;
  }
}

.input-wrap.focused .input-prefix-icon svg {
  color: var(--blue-400);
}

.input-suffix {
  width: 36px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
    color: #94a3b8;
    transition: color 0.2s;
  }

  &:hover svg { color: #cbd5e1; }
}

.toggle-pwd svg { width: 17px; height: 17px; }

.field-error {
  display: block;
  font-size: 12px;
  color: var(--red-500);
  font-weight: 500;
  margin-top: 6px;
  padding-left: 46px;
  animation: errorShake 0.3s ease;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

/* 验证码 */
.code-group {
  .input-wrap {
    input { letter-spacing: 6px; font-size: 16px; font-weight: 600; color: #ffffff; }
  }
}

.code-captcha {
  display: flex;
  gap: 4px;
  padding: 0 14px 0 0;
  cursor: pointer;

  span {
    font-size: 18px;
    font-weight: 700;
    color: var(--blue-300);
    font-family: 'SF Mono', 'Fira Code', monospace;
    letter-spacing: 2px;
    display: inline-block;
    transition: transform 0.2s;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);

    &:hover { transform: scale(1.05) !important; }
  }
}

/* 选项行 */
.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] { display: none; }

  .check-mark {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(148, 163, 184, 0.4);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.12);

    svg { width: 10px; height: 10px; color: var(--white); opacity: 0; transition: opacity 0.2s; }
  }

  input:checked + .check-mark {
    background: var(--blue-500);
    border-color: var(--blue-500);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
    svg { opacity: 1; }
  }

  .check-label {
    font-size: 13px;
    color: #94a3b8;
  }
}

.link-forgot {
  font-size: 13px;
  color: var(--blue-400);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover { color: var(--blue-300); }
}

/* 登录按钮 */
.btn-login {
  height: 54px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%);
  color: var(--white);
  border: none;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow:
    0 4px 16px rgba(59, 130, 246, 0.45),
    0 1px 3px rgba(59, 130, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  position: relative;
  overflow: hidden;

  // 扫描光
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
    transition: left 0.5s ease;
  }

  // 能量波纹
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 13px;
    background: radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.3), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 40%, #60a5fa 70%, #93c5fd 100%);
    box-shadow:
      0 12px 32px rgba(59, 130, 246, 0.55),
      0 3px 10px rgba(59, 130, 246, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    letter-spacing: 0.08em;

    &::before { left: 100%; }
    &::after  { opacity: 1; }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow:
      0 6px 20px rgba(59, 130, 246, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  &.loading {
    pointer-events: none;
    opacity: 0.88;
  }
}

.btn-content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--white);
}

.btn-content-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-text {
  letter-spacing: 0.35em;
  padding-left: 0.35em;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 2px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.25);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
}

/* 登录页脚 */
.login-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(191, 219, 254, 0.22);
  font-size: 13px;
  color: var(--blue-200);
}

.link-register {
  color: var(--blue-400);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: color 0.2s;

  &:hover { color: var(--blue-300); }
}

/* 面板底部 */
.panel-footer {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 420px;
  padding: 0 4px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;

  svg {
    width: 13px;
    height: 13px;
    color: var(--blue-400);
  }
}

.version-tag {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'SF Mono', monospace;
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 1024px) {
  .login-page { flex-direction: column; }

  .brand-panel {
    flex: none;
    padding: 36px 32px 28px;

    .brand-slogan { display: none; }
    .brand-divider, .feature-grid, .deco-sphere { display: none; }

    .brand-logo { margin-bottom: 0; }
  }

  .login-panel {


    width: 100%;
    padding: 32px 24px 40px;
    justify-content: flex-start;
  }

  .card-inner { padding: 28px 24px 32px; }
}

@media (max-width: 480px) {
  .login-card { border-radius: 20px; }
  .feature-grid { grid-template-columns: 1fr; }
}
</style>

