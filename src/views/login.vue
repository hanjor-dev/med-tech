<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import { useUserInfo } from '@/stores/userInfo'
import { Local } from '@/utils/storage'

const router = useRouter()
const userInfoStore = useUserInfo()

/* ── Form ─────────────────────────────────────────────────── */

const isLoading = ref(false)
const isVisible = ref(false)
const formError = ref('')
const captchaToken = ref('')
const isCaptchaVerified = ref(false)
const pendingCaptchaAction = ref<'login' | 'sendSms' | null>(null)
const privacyAgreed = ref(false)
const privacyDialogVisible = ref(false)
const captchaTriggeredByUser = ref(false) // 用户是否主动点击了滑动验证按钮

const showPrivacyDialog = () => {
  privacyDialogVisible.value = true
}

const privacyText = `<p class="intro">欢迎用户（以下简称"您"）使用嘉一高科（湖北）有限公司（注册地址：湖北省赤壁市赤马港工业园嘉一科技园，以下简称"嘉一高科"或"我们"）运营的医工宝医工交互平台（以下简称"医工宝平台"）！</p>
<p class="intro">嘉一高科非常重视您的隐私和个人信息保护，并一直致力于依法保护用户的个人信息。鉴此，嘉一高科制定了《医工宝医工交互平台隐私政策》（以下简称"本政策"），旨在向您说明，您在使用医工宝平台如何收集、使用、保存、共享、转让您的相关个人信息，以及为您提供行使个人信息主体权利的途径和方法。</p>
<p class="intro">嘉一高科系：<br/>（1）与您具有劳动关系或劳务关系的公司主体，为便于您履行工作职能而为您开设账号；或<br/>（2）按照与您具有劳动关系或劳务关系的公司主体（简称"第三方"）要求，为满足第三方业务开展需要以及为便于您履行工作职能而为您开设账号。</p>
<p class="intro">请您在使用医工宝平台前，请您务必仔细阅读本政策。您确认，您在使用我们的产品和/或服务前已仔细阅读并确认您已经充分理解本政策所写明的内容，并让您可以按照本政策的指引做出您认为适当的选择。一旦勾选本隐私政策并开始使用医工宝平台，即表示您已充分理解本政策。如果您不同意本政策的内容，请您立即停止使用相关服务。</p>

<h3>一、我们如何收集和使用您的个人信息</h3>
<h4>（一）基于基本功能需要收集的相关信息</h4>
<h5>1. 注册、登录</h5>
<p>我们基于与您的劳动合同/劳务合同或与您的用人单位的合作协议，为了协助您履行工作职能收集您的员工编号、密码、姓名、手机号、所属公司、部门、职位、区域、角色，并为您开通账号，账号信息包括员工编号、密码。您可以使用账号信息登录医工宝平台。</p>
<h5>2. 订单管理</h5>
<p>您可以通过医工宝平台管理订单，包括添加、导出、编辑、删除有关订单。我们将收集您填入的患者订单信息，包括患者姓名、年龄、性别、所属医院、电话、所需重建的部位和详细数据，以及患者的影像数据、放射报告、STL三维数据、重建模型、重建报告。请您知悉，我们基于与医疗机构的委托处理关系而处理上述患者个人信息。</p>
<h5>3. 用户管理</h5>
<p>您可以通过用户管理板块查看您的个人信息，并修改您的手机号。</p>
<h4>（二）为了维护服务的正常运行</h4>
<p>当您使用我们的医工宝平台时，为维护我们服务的正常运行，改进及优化我们的服务体验、保障您的账号安全、开展身份验证、识别违规行为、保障运营质量及效率以及保护您或其他用户或公众的合法利益免受损失，当您使用本服务时，我们会自动收集您的以下信息，以便我们进行问题排查，保障服务稳定和网络安全。</p>
<h4>（三）其他处理活动</h4>
<p>当我们要将您的个人信息用于本政策未载明的其他用途，或将基于特定目的收集而来的个人信息用于其他目的时，会事先征求您的同意，但法律法规规定的例外情形除外。</p>

<h3>二、我们如何共享、转让、公开披露您的个人信息</h3>
<h4>（一）共享</h4>
<p>我们不会与嘉一高科以外的任何公司、组织和个人共享您的个人信息，但以下情况除外：</p>
<ul>
  <li>在获取您同意的情况下共享；</li>
  <li>在法定情形下的共享；</li>
  <li>与授权的合作伙伴共享，包括您的用人单位及第三方软硬件/系统服务提供商。</li>
</ul>
<h4>（二）转让</h4>
<p>我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：</p>
<ul>
  <li>事先获得您的明确同意；</li>
  <li>在法律法规、法律程序、诉讼或政府主管部门强制性要求的情况下；</li>
  <li>在涉及资产转让、收购、兼并、重组或破产清算时。</li>
</ul>
<h4>（三）公开披露</h4>
<p>我们不会将您的个人信息公开给任何公司、组织和个人，但以下情况除外：</p>
<ul>
  <li>获得您的明确同意；</li>
  <li>在法律法规、法律程序、诉讼或政府主管部门强制性要求的情况下。</li>
</ul>

<h3>三、我们如何存储您的个人信息</h3>
<p>我们在中华人民共和国境内收集和产生的个人信息将存储在中华人民共和国境内。存储期限：</p>
<ul>
  <li>与您的劳动合同/劳务合同有效期内；</li>
  <li>与您的用人单位的合作协议有效期内；</li>
  <li>本政策所述目的所需的最短保存期限内。</li>
</ul>

<h3>四、我们如何保护您的个人信息</h3>
<p>我们非常重视您的个人信息安全。会采取各种合理的物理、电子、技术和管理方面的安全措施来保护您的个人信息，并尽最大努力使您的个人信息不会被篡改、泄漏、毁损或者丢失。我们采用全站https传输协议，确保您的数据在传输过程中的机密性、完整性。</p>

<h3>五、您如何管理您的个人信息</h3>
<p>我们保障您对自己的个人信息行使以下权利：查阅权、复制权及可携带权、更正及补充权、删除权、注销权。</p>

<h3>六、隐私政策的更新</h3>
<p>我们可能适时修订本政策，一旦本政策内容发生变更，我们会于医工宝平台公布最新的隐私政策，并通过显著的方式通知您。</p>

<h3>七、如何联系我们</h3>
<p>如果您对本个人信息保护政策有任何疑问、意见或建议，请您通过【联系电话：<strong>027-88991133</strong>、邮箱：<strong>jygk@joye3d.com</strong>】方式与我们联系，我们将在十五个工作日内答复您。</p>`

// ── Login type tabs ────────────────────────────────────────────────────────────
const loginType = ref<'PASSWORD' | 'PHONE'>('PASSWORD')

const loginForm = reactive({
  principal: '',
  credential: '',
  remember: false,
})

// Phone login fields (independent of loginForm)
const phoneForm = reactive({
  principal: '',
  smsCode: '',
})
const smsCountdown = ref(0)
const smsCooldown = ref(60)
let smsTimer: ReturnType<typeof setInterval> | null = null

/* ── SMS cooldown config ───────────────────────────────────── */
const getCaptchaCooldown = async (): Promise<number> => {
  try {
    const res = await fetch('/yi/system/config/key?key=captcha.expire.seconds')
    const json = await res.json()
    const val = json?.data?.configValue
    return val ? parseInt(String(val), 10) : 60
  } catch {
    return 60
  }
}

/* ── Validation ───────────────────────────────────────────── */
const validatePasswordMode = (): string => {
  if (!loginForm.principal.trim()) {
    return '请输入账户名称'
  }
  if (!loginForm.credential) {
    return '请输入登录密码'
  }
  if (loginForm.credential.length < 6) {
    return '密码长度不能少于 6 位'
  }
  return ''
}

const validatePhoneMode = (): string => {
  if (!phoneForm.principal.trim()) {
    return '请输入手机号'
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.principal.trim())) {
    return '请输入正确的手机号'
  }
  if (!phoneForm.smsCode.trim()) {
    return '请输入短信验证码'
  }
  if (phoneForm.smsCode.length !== 6) {
    return '短信验证码为 6 位'
  }
  return ''
}

/* ── Send SMS code ─────────────────────────────────────────── */
const triggerSendSms = () => {
  if (!phoneForm.principal.trim()) {
    formError.value = '请先输入手机号'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.principal.trim())) {
    formError.value = '请输入正确的手机号'
    return
  }
  formError.value = ''
  doSendSms()
}

const doSendSms = async () => {
  try {
    const cooldown = await getCaptchaCooldown()
    smsCooldown.value = cooldown
    await fetch('/yi/system/auth/captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captchaType: 'PHONE', target: phoneForm.principal.trim() }),
    })
    ElMessage.success('验证码已发送')
    smsCountdown.value = cooldown
    smsTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        smsCountdown.value = 0
        if (smsTimer) clearInterval(smsTimer)
      }
    }, 1000)
  } catch {
    ElMessage.error('发送失败，请稍后重试')
  }
}

// ── Captcha ─────────────────────────────────────────────────────────────────────
const captchaTrigger = (action: 'login' | 'sendSms') => {
  pendingCaptchaAction.value = action
  nextTick(() => {
    initCaptcha()
  })
}

const initCaptcha = () => {
  const captchaConfig = {
    requestCaptchaDataUrl: '/yi/image-captch/genCaptcha',
    validCaptchaUrl: '/yi/image-captch/check',
    bindEl: '#captcha-div',
    validSuccess: (res: any, _c: any, t: any) => {
      t.destroyWindow()
      captchaToken.value = res.data.id
      isCaptchaVerified.value = true
      ElMessage.success('验证成功')
      const action = pendingCaptchaAction.value
      pendingCaptchaAction.value = null
      if (action === 'sendSms') {
        doSendSms()
      } else if (action === 'login') {
        // 只有先点登录按钮触发的验证才自动登录
        if (!captchaTriggeredByUser.value) {
          performLogin()
        }
        captchaTriggeredByUser.value = false
      }
    },
  }
    ; (window as any).initTAC!('static/tac', captchaConfig).then((tac: any) => {
      tac.init()
    })
}

// ── Password toggle ────────────────────────────────────────────────────────────
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// ── Login ─────────────────────────────────────────────────────────────────────
const performLogin = async () => {
  isLoading.value = true
  try {
    const isPassword = loginType.value === 'PASSWORD'
    const params: Record<string, string> = {
      principal: isPassword ? loginForm.principal.trim() : phoneForm.principal.trim(),
      credential: isPassword ? loginForm.credential : phoneForm.smsCode.trim(),
      loginType: loginType.value,
    }
    if (isPassword && captchaToken.value) {
      params.captchaToken = captchaToken.value
    }
    await userInfoStore.login(params as any)
    await userInfoStore.getUserInfo()
    if (userInfoStore.menus.length > 0) {
      const { registerDynamicRoutes } = await import('@/router')
      registerDynamicRoutes(userInfoStore.menus)
      const { useRoutes } = await import('@/stores/routes')
      const pinia = (await import('@/stores/index')).default
      const routesStore = useRoutes(pinia)

      // 递归查找第一个叶子路由（有 component 的实际页面路由）
      const findFirstLeaf = (routes: any[]): string | undefined => {
        for (const r of routes) {
          if (r.children?.length) {
            const leaf = findFirstLeaf(r.children)
            if (leaf) return leaf
          }
          if (r.component && r.path) return r.path
        }
      }

      const targetPath = findFirstLeaf(routesStore.menuRoutes) ?? '/home'
      console.log('targetPath', targetPath)
      router.replace(targetPath)
    } else {
      router.replace('/home')
    }
    ElMessage.success('登录成功，欢迎回来!')
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message
    if (msg && !msg.includes(' ')) {
      formError.value = msg
    }
  } finally {
    isLoading.value = false
  }
}

/* ── Login ─────────────────────────────────────────────────────────────────── */
const handleLogin = async () => {
  formError.value = ''
  if (!privacyAgreed.value) {
    formError.value = '请先阅读并同意隐私条款'
    return
  }
  if (loginType.value === 'PASSWORD') {
    const msg = validatePasswordMode()
    if (msg) { formError.value = msg; return }
    if (!isCaptchaVerified.value) {
      if (!pendingCaptchaAction.value) {
        captchaTrigger('login')
      }
      return
    }
    performLogin()
  } else {
    const msg = validatePhoneMode()
    if (msg) { formError.value = msg; return }
    performLogin()
  }
}

/* ── Password toggle ──────────────────────────────────────── */

// ── Rich Canvas Particle System ──────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let tick = 0

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number          // radius
  opacity: number
  opacitySpeed: number
  hue: number        // 180=cyan, 200=blue, 160=teal
  type: 'dot' | 'ring' | 'dash'
  ringPhase: number  // for ring type
  ringSpeed: number
  dashLen: number
}

let particles: Particle[] = []
let mouse = { x: -9999, y: -9999 }

// Particle palettes
const hues = [210, 215, 220, 205, 225]

const makeParticle = (): Particle => {
  const types: Particle['type'][] = ['dot', 'dot', 'dot', 'ring', 'dash']
  const type = types[Math.floor(Math.random() * types.length)]
  const hue = hues[Math.floor(Math.random() * hues.length)]
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    r: type === 'ring' ? Math.random() * 4 + 2 : Math.random() * 2.5 + 0.6,
    opacity: Math.random() * 0.5 + 0.1,
    opacitySpeed: (Math.random() * 0.006 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
    hue,
    type,
    ringPhase: Math.random() * Math.PI * 2,
    ringSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
    dashLen: Math.random() * 24 + 8
  }
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resizeCanvas()
  particles = Array.from({ length: 130 }, makeParticle)
  // Stagger initial positions so not all start at top-left
  particles.forEach(p => {
    p.x = Math.random() * canvas.width
    p.y = Math.random() * canvas.height
  })
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const drawDot = (p: Particle) => {
  if (!ctx) return
  ctx.save()
  ctx.globalAlpha = p.opacity
  ctx.shadowBlur = 12
  ctx.shadowColor = `hsl(${p.hue}, 90%, 68%)`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = `hsl(${p.hue}, 85%, 72%)`
  ctx.fill()

  // bright core
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r * 0.45, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${p.hue}, 60%, 96%, ${p.opacity * 0.9})`
  ctx.fill()
  ctx.restore()
}

const drawRing = (p: Particle) => {
  if (!ctx) return
  ctx.save()
  ctx.globalAlpha = p.opacity * 0.7
  ctx.shadowBlur = 10
  ctx.shadowColor = `hsl(${p.hue}, 90%, 68%)`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r + Math.sin(p.ringPhase) * 1.2, 0, Math.PI * 2)
  ctx.strokeStyle = `hsl(${p.hue}, 80%, 68%)`
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

const drawDash = (p: Particle) => {
  if (!ctx) return
  const angle = Math.atan2(p.vy, p.vx)
  const len = p.dashLen
  const alpha = p.opacity * 0.55
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 6
  ctx.shadowColor = `hsl(${p.hue}, 90%, 68%)`
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len)
  ctx.strokeStyle = `hsl(${p.hue}, 80%, 70%)`
  ctx.lineWidth = p.r * 0.8
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

// Constellation: connect particles within threshold
const drawConstellation = () => {
  if (!ctx || !particles.length) return
  const threshold = 140
  ctx.save()
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < threshold) {
        const alpha = (1 - dist / threshold) * 0.1
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `hsl(212, 80%, 72%)`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}

// Mouse aura — particles within 120px of cursor get a glow line
const drawMouseAura = () => {
  if (!ctx || mouse.x < 0) return
  const range = 120
  particles.forEach(p => {
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < range) {
      const alpha = (1 - dist / range) * 0.22
      ctx!.save()
      ctx!.globalAlpha = alpha
      ctx!.beginPath()
      ctx!.moveTo(mouse.x, mouse.y)
      ctx!.lineTo(p.x, p.y)
      ctx!.strokeStyle = `hsl(212, 100%, 75%)`
      ctx!.lineWidth = 0.8
      ctx!.stroke()
      ctx!.restore()
    }
  })
}

// Shooting stars (very occasional)
interface Shot {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  hue: number
}

let shots: Shot[] = []
const maybeShoot = () => {
  if (Math.random() < 0.008 && shots.length < 2) {
    const speed = Math.random() * 3 + 2
    const angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.1
    shots.push({
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      hue: 212 + Math.random() * 20 - 10
    })
  }
}

const updateShots = () => {
  shots = shots.filter(s => {
    s.x += s.vx
    s.y += s.vy
    s.life -= 0.018
    return s.life > 0
  })
}

const drawShots = () => {
  if (!ctx) return
  shots.forEach(s => {
    const alpha = s.life / s.maxLife
    ctx!.save()
    ctx!.globalAlpha = alpha * 0.85
    ctx!.shadowBlur = 14
    ctx!.shadowColor = `hsl(${s.hue}, 100%, 75%)`
    ctx!.beginPath()
    ctx!.arc(s.x, s.y, 1.5, 0, Math.PI * 2)
    ctx!.fillStyle = `hsl(${s.hue}, 100%, 90%)`
    ctx!.fill()
    // trail
    const trailLen = 40 * alpha
    ctx!.beginPath()
    ctx!.moveTo(s.x, s.y)
    ctx!.lineTo(s.x - s.vx * trailLen * 0.3, s.y - s.vy * trailLen * 0.3)
    ctx!.strokeStyle = `hsla(${s.hue}, 100%, 80%, ${alpha * 0.5})`
    ctx!.lineWidth = 1
    ctx!.stroke()
    ctx!.restore()
  })
}

const update = () => {
  const W = window.innerWidth
  const H = window.innerHeight
  tick++

  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.opacity += p.opacitySpeed
    if (p.opacity > 0.65) { p.opacity = 0.65; p.opacitySpeed *= -1 }
    if (p.opacity < 0.04) { p.opacity = 0.04; p.opacitySpeed *= -1 }
    if (p.type === 'ring') p.ringPhase += p.ringSpeed
    // wrap
    if (p.x < -20) p.x = W + 20
    if (p.x > W + 20) p.x = -20
    if (p.y < -20) p.y = H + 20
    if (p.y > H + 20) p.y = -20
  })

  maybeShoot()
  updateShots()
}

const draw = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  // Fade trail effect (ghostly persistence)
  ctx.fillStyle = 'rgba(13, 27, 62, 0.18)'
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

  drawConstellation()

  particles.forEach(p => {
    if (p.type === 'dot') drawDot(p)
    else if (p.type === 'ring') drawRing(p)
    else drawDash(p)
  })

  drawMouseAura()
  drawShots()
}

const loop = () => {
  update()
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(async () => {
  nextTick(async () => {
    // 恢复记住的账户名
    const remembered = Local.get('rememberedUsername')
    if (remembered) {
      loginForm.principal = remembered
      loginForm.remember = true
    }
    // 预获取验证码倒计时配置
    smsCooldown.value = await getCaptchaCooldown()
    initCanvas()
    loop()
    setTimeout(() => { isVisible.value = true }, 80)
  })
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="login-page">
    <!-- Scene layers -->
    <div class="scene-bg" aria-hidden="true" />
    <canvas ref="canvasRef" class="scene-canvas" aria-hidden="true" />

    <!-- Glowing orbs -->
    <div class="orb orb-a" aria-hidden="true" />
    <div class="orb orb-b" aria-hidden="true" />
    <div class="orb orb-c" aria-hidden="true" />

    <!-- Hex grid overlay -->
    <div class="hex-layer" aria-hidden="true" />

    <!-- Scanning line -->
    <div class="scan-line" aria-hidden="true" />

    <!-- Main card -->
    <div class="login-card" :class="{ visible: isVisible }">

      <!-- Left brand panel -->
      <div class="panel-brand">
        <div class="brand-inner">
          <div class="brand-identity">
            <div class="brand-system-name">CTSS</div>
            <div class="ctss-rule"></div>
            <div class="brand-fullname">
              <span class="brand-fullname-cn">个性化诊疗辅助系统</span>
              <span class="brand-fullname-en">Customized Treatment Support System</span>
            </div>

          </div>
          <img src="@/assets/logo.png" alt="logo" width="100">
          <div class="brand-divider" aria-hidden="true">
            <span class="divider-line" />
            <span class="divider-dot" />
            <span class="divider-line" />
          </div>
          <div class="brand-platform">
            <span>医工交互平台</span>
            <span>www.yigongbao.com</span>
          </div>
          <div class="taglines">
            <div class="brand-tagline-cn">数据工程赋能临床诊疗 &middot; 医工交叉实现多维导引</div>
            <div class="brand-tagline-en">Data engineering empowers clinical diagnosis &amp;
              treatment<br>Medical-engineering fusion achieves multi-dimensional guidance</div>
          </div>

        </div>
      </div>

      <!-- Right form panel -->
      <div class="panel-form">
        <div class="form-wrapper">
          <div class="form-head">
            <div class="form-head-tag">
              <span class="dot-live" />
              <span>SYSTEM ACCESS</span>
            </div>
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-sub">请登录账户以继续使用系统</p>
          </div>

          <!-- Login type tabs -->
          <div class="login-tabs">
            <button type="button" class="login-tab" :class="{ active: loginType === 'PASSWORD' }"
              @click="loginType = 'PASSWORD'; formError = ''">
              密码登录
            </button>
            <button type="button" class="login-tab" :class="{ active: loginType === 'PHONE' }"
              @click="loginType = 'PHONE'; formError = ''">
              手机验证码登录
            </button>
          </div>

          <form class="login-form" @submit.prevent="handleLogin" novalidate>
            <!-- 表单错误提示 -->
            <transition name="err-fade">
              <div v-if="formError" class="form-error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ formError }}
              </div>
            </transition>

            <!-- Principal field — password mode (username/email) or phone mode -->
            <div class="field">
              <label class="field-lbl" for="login-user">
                {{ loginType === 'PASSWORD' ? '账户名称' : '手机号' }}
              </label>
              <div class="field-row">
                <span class="field-ico">
                  <svg v-if="loginType === 'PASSWORD'" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.6">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.6">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.73-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input id="login-user" v-if="loginType === 'PASSWORD'" v-model="loginForm.principal" class="field-input"
                  type="text" placeholder="用户名 / 邮箱" autocomplete="username" @input="formError = ''" />
                <input id="login-phone" v-else v-model="phoneForm.principal" class="field-input" type="tel"
                  placeholder="请输入手机号" maxlength="11" @input="formError = ''" />
              </div>
            </div>

            <!-- Credential field — password or SMS code -->
            <div class="field">
              <label class="field-lbl" for="login-pass">
                {{ loginType === 'PASSWORD' ? '登录密码' : '短信验证码' }}
              </label>
              <div class="field-row">
                <span class="field-ico">
                  <svg v-if="loginType === 'PASSWORD'" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.6">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.6">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.73-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input v-if="loginType === 'PASSWORD'" id="login-pass" v-model="loginForm.credential"
                  class="field-input" :type="showPassword ? 'text' : 'password'" placeholder="请输入登录密码"
                  autocomplete="current-password" @input="formError = ''" />
                <input v-else id="login-sms" v-model="phoneForm.smsCode" class="field-input" type="text"
                  placeholder="请输入短信验证码" maxlength="6" autocomplete="one-time-code" @input="formError = ''" />
                <!-- Password toggle (password mode only) -->
                <button v-if="loginType === 'PASSWORD'" type="button" class="pwd-toggle"
                  :title="showPassword ? '隐藏密码' : '显示密码'" @click="togglePassword">
                  <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.6">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.6">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
                <!-- Send SMS code button (phone mode only) -->
                <button v-else type="button" class="send-code-btn" :disabled="smsCountdown > 0" @click="triggerSendSms">
                  {{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
                </button>
              </div>
            </div>

            <!-- <div v-if="loginType === 'PASSWORD'" class="form-ops">
              <label class="check-wrap">
                <input v-model="loginForm.remember" type="checkbox" class="check-input" />
                <span class="check-box">
                  <svg v-if="loginForm.remember" width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#60a5fa" stroke-width="1.8" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="check-label">记住账户</span>
              </label>
              <a href="#" class="link-forgot" @click.prevent>忘记密码？</a>
            </div> -->

            <div v-if="loginType === 'PASSWORD'" class="captcha-wrap">
              <!-- <button type="button" class="captcha-trigger" :class="{ verified: isCaptchaVerified }"
                @click="!isCaptchaVerified && (captchaTriggeredByUser = true, captchaTrigger('login'))">
                <span class="ct-text">{{ isCaptchaVerified ? '已通过安全验证' : '点击进行滑动验证' }}</span>
              </button> -->
              <div id="captcha-div" class="captcha-active" />
            </div>

            <!-- 隐私条款勾选 -->
            <label class="privacy-check">
              <input type="checkbox" v-model="privacyAgreed" @change="formError = ''" />
              <span class="check-box">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span class="check-label">
                我已阅读并同意
                <a href="#" class="privacy-link" @click.prevent="showPrivacyDialog">《隐私条款》</a>
              </span>
            </label>

            <button type="submit" class="btn-login" :class="{ loading: isLoading }" :disabled="isLoading">
              <span class="btn-text">登 录 系 统</span>
              <span class="btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              <span class="btn-glow" aria-hidden="true" />
              <span v-if="isLoading" class="btn-ring" aria-hidden="true" />
            </button>
            <div class="form-footer">
              <span>还没有账户？</span>
              <a href="#" class="link-new" @click.prevent>联系管理员开通</a>
            </div>
          </form>


        </div>
        <p class="ver-tag">MED-TECH v2.0 · BUILD-2026</p>
      </div>
    </div>
  </div>
  <!-- 隐私政策弹窗 -->
  <dialog-modal v-model="privacyDialogVisible" title="隐私政策" width="680px" :is-show-cancel-btn="false"
    :is-show-confirm-btn="false" :show-footer="false" @modal-close="privacyDialogVisible = false">
    <div class="dialog-shell">
      <div class="privacy-content">
        <div class="privacy-meta">
          <span>发布日期：2025年7月25日</span>
          <span>生效日期：2025年7月25日</span>
        </div>
        <div class="privacy-body" v-html="privacyText" />
      </div>

    </div>
  </dialog-modal>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.login-page {
  /* === Token — 白色简洁主题 === */
  --c-bg: #f8fafc;
  --c-surface: #ffffff;
  --c-panel: #ffffff;
  --c-form-bg: #f1f5f9;
  --c-primary: #0073AC;
  --c-primary-light: #3396cc;
  --c-primary-dark: #005a85;
  --c-accent: #B8893A;
  --navy: #2F3D5C;
  --navy-mid: #4A5878;
  --c-text: #1e293b;
  --c-text-dim: #64748b;
  --c-text-mute: #94a3b8;
  --c-border: #e2e8f0;
  --c-border-hi: #cbd5e1;
  --c-shadow: rgba(0, 0, 0, 0.08);
  --c-shadow-hover: rgba(0, 0, 0, 0.12);
  --font-d: 'Rajdhani', 'Noto Sans SC', sans-serif;
  --font-b: 'Noto Sans SC', system-ui, sans-serif;
  --blue: #0073AC;
  --navy: #2F3D5C;

  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  font-family: var(--font-b);
  background: var(--c-bg);
  color: var(--c-text);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* === Scene background === */
.scene-bg {
  position: fixed;
  inset: 0;
  background-color: #0d1b3e;
  background-image: url('@/assets/image/login_bg2.jpeg');
  background-size: cover;
  background-position: center;
  pointer-events: none;
}

/* Subtle dot pattern overlay */
.scene-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}

.scene-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

/* Orbs */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: orbFloat 16s ease-in-out infinite;
}

.orb-a {
  width: 560px;
  height: 560px;
  top: -200px;
  right: -140px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 68%);
  animation-delay: 0s;
}

.orb-b {
  width: 440px;
  height: 440px;
  bottom: -140px;
  left: -100px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 68%);
  animation-delay: -6s;
}

.orb-c {
  width: 320px;
  height: 320px;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 72%);
  animation-delay: -12s;
}

@keyframes orbFloat {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(28px, -18px) scale(1.04);
  }

  66% {
    transform: translate(-22px, 24px) scale(0.96);
  }
}

.orb-c {
  animation: none;
}

/* Hex grid */
.hex-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.065;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-48L4 20v24l24 14 24-14V20L28 18z' fill='none' stroke='%2360a5fa' stroke-width='.6'/%3E%3C/svg%3E");
  background-size: 56px 60px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 20%, transparent 80%);
}

/* Scanning line */
.scan-line {
  position: fixed;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--c-primary-light), transparent);
  opacity: 0.45;
  animation: scanDown 7s linear infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes scanDown {
  0% {
    top: -1px;
    opacity: 0.4;
  }

  8% {
    opacity: 0.12;
  }

  100% {
    top: 100vh;
    opacity: 0;
  }
}

/* === Card === */
.login-card {
  position: relative;
  z-index: 10;
  display: flex;
  width: min(1120px, calc(100vw - 48px));
  height: 615px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--c-panel);
  box-shadow:
    0 4px 6px -1px var(--c-shadow),
    0 10px 15px -3px var(--c-shadow),
    0 20px 25px -5px var(--c-shadow);
  opacity: 0;
  transform: translateY(20px) scale(0.99);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.login-card.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* === Brand panel === */
.panel-brand {
  position: relative;
  width: 36%;
  min-width: 300px;
  padding: 52px 40px;
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid var(--c-border);
  overflow: hidden;
}

/* .panel-brand::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--c-primary), var(--c-accent));
} */

/* .brand-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
  opacity: 0.3;
}

.brand-corner.tl {
  top: 14px;
  left: 14px;
  border-top: 1px solid var(--c-primary);
  border-left: 1px solid var(--c-primary);
}

.brand-corner.br {
  bottom: 14px;
  right: 14px;
  border-bottom: 1px solid var(--c-primary);
  border-right: 1px solid var(--c-primary);
} */

.brand-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-crest {
  width: 68px;
  margin-bottom: 40px;
  opacity: 0.92;
}

.logo-icon {
  margin-bottom: 22px;
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.25));
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {

  0%,
  100% {
    filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2));
  }

  50% {
    filter: drop-shadow(0 4px 20px rgba(59, 130, 246, 0.35));
  }
}

.brand-title {
  font-family: var(--font-d);
  font-size: clamp(32px, 4.2vw, 42px);
  font-weight: 700;
  letter-spacing: 0.18em;
  margin: 0 0 6px;
  color: var(--c-text);
  text-shadow: none;
}

.brand-sub {
  margin: 18px 0;
  font-family: var(--font-d);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.38em;
  color: var(--c-primary);
  opacity: 0.8;
}

.brand-desc {
  margin: 0 0 36px;
  font-size: 13px;
  line-height: 1.8;
  letter-spacing: 0.06em;
  color: var(--c-text-dim);
}

.brand-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0 28px;
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-family: var(--font-d);
  font-size: 22px;
  font-weight: 700;
  color: var(--c-primary);
  letter-spacing: 0.06em;
}

.stat-lbl {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--c-text-dim);
}

.stat-sep {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, transparent, var(--c-border), transparent);
}

/* Brand identity block */
.brand-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

/* Logo ↔ identity divider */
.brand-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80%;
  margin-top: 25px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--c-border), transparent);
}

.divider-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-primary-light);
}

.brand-system-name {
  color: #2F3D5C;
  font-family: 'Times New Roman', 'Cambria', serif;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 6px;
  margin-top: 18px;
  margin-bottom: 4px;
}

.ctss-rule {
  width: 28px;
  height: 2px;
  background: #B8893A;
  margin: 0 auto 10px;
}

.brand-fullname {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.brand-fullname-cn {
  font-size: 14px;
  color: #4A5878;
  letter-spacing: 3px;
}

.brand-fullname-en {
  font-size: 10px;
  color: #8A8A8A;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.brand-platform{
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  color: #2e86c4;
  letter-spacing: 1px;
  margin-top: 25px;
}

.taglines {
  margin-top: 50px;
  padding-top: 24px;
  border-top: 1px solid #E5E9EE;
}

.brand-tagline-cn {
  font-size: 12px;
  color: #5A5A5A;
  letter-spacing: 1px;
  margin-bottom: 6px;
  text-align: center;
}

.brand-tagline-en {
  text-align: center;
  line-height: 1.8;
  font-size: 9.5px;
  color: #8A8A8A;
  letter-spacing: 0.5px;
  line-height: 2.5;
}

/* === Form panel === */
.panel-form {
  flex: 1;
  position: relative;
  padding: 56px 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.form-wrapper {
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
}

.form-head {
  position: absolute;
  top: 20px;
}

.form-head-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--blue);
  margin-bottom: 14px;
}

.dot-live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue);
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--navy);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.form-sub {
  letter-spacing: 0.03em;
  font-size: 13px;
  color: #8A8A8A;
  margin-bottom: 32px;
}

.login-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #F7F8FA;
  border-radius: 4px;
  padding: 4px;
  position: absolute;
  top: 145px;
  width: 61%;
}

.login-tab {
  padding: 10px;
  text-align: center;
  font-size: 13px;
  color: #8A8A8A;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
  letter-spacing: 1px;
  border: none;
  background: transparent;
}

.login-tab.active {
  background: #FFFFFF;
  color: var(--navy);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(47, 61, 92, 0.08);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  top: 210px;
  width: 61%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-lbl {
  display: block;
  font-size: 12px;
  color: #5A5A5A;
  /* margin-bottom: 8px; */
  letter-spacing: 0.5px;
}

.field-row {
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: 1px solid var(--c-border);
  overflow: hidden;
}

.field-row:focus-within {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  color: var(--c-text-mute);
  flex-shrink: 0;
  transition: color 0.25s;
}

.field-row:focus-within .field-ico {
  color: var(--c-primary);
}

.field-input {
  flex: 1;
  height: 42px;
  padding: 0 14px 0 0;
  border: none;
  background: transparent;
  font-family: var(--font-b);
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text);
  outline: none;
  caret-color: var(--c-primary);
}

.field-input::placeholder {
  color: var(--c-text-mute);
  font-weight: 400;
}

/* Chrome autofill white background override */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus,
.field-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px var(--c-surface) inset !important;
  -webkit-text-fill-color: var(--c-text) !important;
  background-color: var(--c-surface) !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Cursor blink */
.field-cursor {
  width: 1px;
  height: 18px;
  background: var(--c-primary);
  margin-right: 14px;
  opacity: 0;
  animation: none;
  flex-shrink: 0;
}

.field-row:focus-within .field-cursor {
  animation: cursorBlink 1.1s step-end infinite;
}

@keyframes cursorBlink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

/* Form ops row */
.form-ops {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.check-wrap {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.check-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.check-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--c-text-mute);
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.check-input:checked+.check-box {
  border-color: var(--c-primary);
  background: rgba(59, 130, 246, 0.12);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.28);
}

.check-input:focus-visible+.check-box {
  outline: 2px solid rgba(59, 130, 246, 0.2);
  outline-offset: 2px;
}

.check-label {
  font-size: 12px;
  color: var(--c-text-dim);
  margin: 7px 0;
}

.link-forgot {
  font-size: 12px;
  color: var(--c-text-mute);
  text-decoration: none;
  transition: color 0.2s;
}

.link-forgot:hover {
  color: var(--c-primary);
}

.captcha-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px dashed var(--c-border);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  font-family: var(--font-d);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--c-text-dim);
  transition: border-color 0.25s, background 0.25s, color 0.25s, box-shadow 0.25s;
  user-select: none;
}

.captcha-trigger:hover {
  border-color: rgba(0, 115, 172, 0.5);
  background: rgba(0, 115, 172, 0.06);
  color: var(--c-primary);
}

.captcha-trigger.verified {
  border-style: solid;
  border-color: rgba(0, 115, 172, 0.4);
  background: rgba(0, 115, 172, 0.06);
  color: var(--c-primary);
  cursor: default;
}

.captcha-trigger.verified:hover {
  border-color: rgba(0, 115, 172, 0.4);
  background: rgba(0, 115, 172, 0.06);
  color: var(--c-primary);
}

.captcha-wrap {
  position: relative;
}

.ct-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ct-text {
  flex: 1;
}

.ct-badge {
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid currentColor;
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.captcha-active {
  position: absolute;
  top: -318px;
  left: 0;
  z-index: 100;
  min-height: 50px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Form error */
.form-error-msg {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 8px;
  font-size: 13px;
  color: #fca5a5;
}

.err-fade-enter-active,
.err-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.err-fade-enter-from,
.err-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Password toggle */
.pwd-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border: none;
  background: none;
  color: var(--c-text-mute);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.pwd-toggle:hover {
  color: var(--c-text-dim);
}

.send-code-btn {
  height: 32px;
  padding: 0 12px;
  margin-right: 4px;
  border: 1px solid var(--c-primary);
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
  font-family: var(--font-d);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--c-primary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.15);
}

.send-code-btn:disabled {
  border-color: var(--c-text-mute);
  color: var(--c-text-mute);
  background: transparent;
  cursor: not-allowed;
}

/* === Privacy checkbox === */
.privacy-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 4px;

  input[type="checkbox"] {
    display: none;
  }

  .check-box {
    width: 16px;
    height: 16px;
    border: 1.5px solid var(--c-text-mute);
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    background: #fff;

    svg {
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.15s ease;
      color: #fff;
    }
  }

  input:checked+.check-box {
    background: var(--c-primary);
    border-color: var(--c-primary);

    svg {
      opacity: 1;
      transform: scale(1);
    }
  }

  .check-label {
    font-size: 12.5px;
    color: var(--c-text-dim);
    line-height: 1.4;
  }

  .privacy-link {
    color: var(--c-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* === Primary button === */
.btn-login {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  overflow: hidden;
  height: 48px;
  width: 100%;
  border: none !important;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-d);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #ffffff;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.18s;
}

.btn-login::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.06);
  opacity: 0;
  transition: opacity 0.2s;
}

.btn-login:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-login:hover:not(:disabled) {
  background: var(--navy-mid);
}

.btn-login:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-arrow {
  position: relative;
  z-index: 1;
  display: flex;
  transition: transform 0.2s;
}

.btn-login:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-glow {
  display: none;
}

.btn-ring {
  position: absolute;
  inset: -1px;
  border-radius: 4px;
  border: 1px solid var(--navy);
  opacity: 0;
  animation: ringPulse 1s ease-out infinite;
}

@keyframes ringPulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.08);
  }
}

/* Footer */
.form-footer {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--c-text-mute);
  width: 100%;
}

.link-new {
  margin-left: 5px;
  color: var(--c-primary);
  font-weight: 500;
  text-decoration: none;
}

.link-new:hover {
  opacity: 1;
}

.privacy-content {
  max-height: 560px;
  overflow-y: auto;
}

/* === Privacy dialog === */
.privacy-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  color: var(--c-text-dim);
  font-weight: 500;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--c-border);
}

.privacy-body {
  font-size: 13px;
  color: #4b5563;
  line-height: 2.2;

  p {
    margin: 0 0 10px;
  }

  .intro {
    color: #374151;
    font-weight: 500;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--c-text);
    margin: 20px 0 8px;
    padding: 8px 0 0;
    border-top: 1px solid var(--c-border);
    line-height: 1.5;

    &:first-child {
      border-top: none;
      padding-top: 0;
      margin-top: 4px;
    }
  }

  h4 {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin: 12px 0 6px;
  }

  h5 {
    font-size: 13px;
    font-weight: 500;
    color: #4b5563;
    margin: 8px 0 4px;
  }

  ul {
    margin: 4px 0 10px;
    padding-left: 20px;

    li {
      margin-bottom: 4px;
      list-style: disc;
    }
  }

  strong {
    font-weight: 600;
    color: var(--c-text);
  }
}

.ver-tag {
  position: absolute;
  bottom: 16px;
  right: 22px;
  font-family: var(--font-d);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--c-text-mute);
  opacity: 0.45;
}

/* === Responsive === */
@media (max-width: 900px) {
  .login-card {
    flex-direction: column;
    height: unset;
  }

  .panel-brand {
    width: 100%;
    min-width: unset;
    padding: 32px 28px 24px;
    border-right: none;
    border-bottom: 1px solid var(--c-border);
  }

  .brand-stats {
    display: none;
  }

  .brand-barcode {
    display: none;
  }

  .panel-form {
    padding: 32px 28px 44px;
  }

  .ver-tag {
    position: static;
    text-align: center;
    margin-top: 16px;
  }
}

@media (max-width: 520px) {
  .login-page {
    padding: 12px;
  }

  .login-card {
    border-radius: 12px;
  }

  .panel-brand {
    padding: 28px 24px 22px;
  }

  .panel-form {
    padding: 28px 20px 36px;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
