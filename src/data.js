// 地球内部结构科普数据 —— 面向小朋友的版本
// 从内到外排序（内核 -> 地壳）

export const earthLayers = [
  {
    id: 'inner-core',
    name: '内核',
    en: 'Inner Core',
    emoji: '🔥',
    color: 0xffd700, // 内核：亮金黄（高温铁钴）
    radiusRatio: 0.19,
    depth: '距地表 5,150 – 6,371 km',
    temperature: '≈ 5,400°C（与太阳表面温度媲美）',
    material: '固态铁-镍合金（Fe-Ni）',
    state: '固态（高压下铁镍合金）',
    kidFriendly: '地球最中心是一个滚烫的实心金属球，主要由铁和镍组成。',
    description: '内核是地球的最深层，位于地球中心，直径约 2,440 km。尽管温度高达 5,400°C（接近太阳表面温度），但由于承受约 360 万个大气压的巨大压力，铁镍合金仍保持固态。内核正以每百万年约 1 mm 的速度缓慢凝固增长。',
    fact: '💡 内核的铁镍合金在高温高压下的密度约为 12.8–13.1 g/cm³，是地表水的 13 倍。地震波纵波（P波）可穿过内核，而横波（S波）不能，这证实了内核的固态性质。',
    density: '12.8 – 13.1 g/cm³',
    funCompare: '若将地球缩为苹果大小，内核直径仅约 1.9 cm，却占地球质量的 1.7%'
  },
  {
    id: 'outer-core',
    name: '外核',
    en: 'Outer Core',
    emoji: '🧲',
    color: 0xff7b2d, // 外核：亮橙（液态铁）
    radiusRatio: 0.55,
    depth: '距地表 2,900 – 5,150 km',
    temperature: '4,000 – 5,000°C',
    material: '液态铁、镍（含硫、氧等轻元素）',
    state: '液态（金属流体）',
    kidFriendly: '这里是一片滚烫的液态金属“海洋”，不断流动，为地球制造磁场。',
    description: '外核是一层厚约 2,260 km 的液态铁镍层。高温使金属保持液态，结合地球自转引发的对流运动，产生持续电流，通过“发电机效应”（Geodynamo）激发出地球磁场。这一磁场屏蔽了太阳风与宇宙射线，保护着地表生命。',
    fact: '🧲 地球磁场的存在由外核液态金属的对流维持。磁极每隔数十万年会发生一次“磁极倒转”，地质记录中已发现多次。',
    density: '9.9 – 12.2 g/cm³',
    funCompare: '外核的对流速度约为每年几毫米至几厘米，与地表板块运动速度相当'
  },
  {
    id: 'lower-mantle',
    name: '下地幔',
    en: 'Lower Mantle',
    emoji: '🌋',
    color: 0xe0512f, // 下地幔：深橙红
    radiusRatio: 0.83,
    depth: '距地表 660 – 2,900 km',
    temperature: '1,900 – 3,700°C',
    material: '固态硅酸盐矿物（钙钛矿结构）',
    state: '固态（地质时间尺度上可缓慢对流）',
    kidFriendly: '这是地球最厚的一层，占据地球体积的近一半，岩石像慢动作的蜂蜜般流动。',
    description: '下地幔从 660 km 深延伸至 2,900 km 的古登堡面（Gutenberg Discontinuity），是地球体积最大的一层。主要成分为钙钛矿结构的硅酸盐矿物。尽管呈固态，在数百万至数千万年的地质时间尺度上，可以像极其粘稠的流体一样对流，是板块运动的深层热力来源。',
    fact: '🌋 下地幔对流的热源部分来自地球形成早期残留的原始热，以及放射性元素（铀、钍、钾）衰变产生的热量。',
    density: '5.6 – 9.9 g/cm³',
    funCompare: '下地幔占据了地球总体积约 49%，是名副其实的“地球主体”'
  },
  {
    id: 'upper-mantle',
    name: '上地幔',
    en: 'Upper Mantle',
    emoji: '🛤️',
    color: 0xc9442e, // 上地幔：红棕
    radiusRatio: 0.94,
    depth: '距地表 35 – 660 km',
    temperature: '500 – 1,900°C',
    material: '橄榄岩，软流层（部分熔融）',
    state: '上部固态，下部部分熔融（1–10%）',
    kidFriendly: '这一层含软流层，岩石部分融化，地壳板块如同浮木般漂于其上。',
    description: '上地幔顶部以莫霍面（Moho）与地壳分界，向下延伸至 660 km 的不连续面。其中 100–350 km 深处为软流层（Asthenosphere），岩石部分熔融（1–10%），具塑性，是板块构造运动的关键层。地壳岩石圈板块即“漂浮”于软流层之上。',
    fact: '📍 1909 年，克罗地亚地震学家莫霍洛维奇发现地震波在约 35 km 深处速度突变，由此揭示地壳与地幔的分界面（莫霍面）。',
    density: '3.4 – 5.6 g/cm³',
    funCompare: '软流层的存在使板块能漂移，大陆以每年数厘米的速度“旅行”'
  },
  {
    id: 'crust',
    name: '地壳',
    en: 'Crust',
    emoji: '🏔️',
    color: 0x5b7a99, // 地壳：蓝灰（岩石）
    radiusRatio: 1.0,
    depth: '地表 0 – 35 km（大陆）；0 – 7 km（洋壳）',
    temperature: '地表 ≈ 15°C，地温梯度约 25–30°C/km',
    material: '大陆：花岗岩；海洋：玄武岩',
    state: '固态岩石（岩石圈）',
    kidFriendly: '我们脚下的地壳是地球最薄的岩层，却承载着全部生命与文明。',
    description: '地壳是地球最外层的固态岩层，仅占地球体积的约 1%。大陆地壳平均厚 35 km（最厚达 70 km），以花岗岩为主；海洋地壳仅约 7 km 厚，以玄武岩为主。地壳与上地幔顶部共同构成岩石圈，是地震、火山活动的发生层。',
    fact: '🥚 人类钻探的最深钻孔为俄罗斯科拉超深钻孔（12,262 m），仍远未穿透地壳，地壳之于地球比例薄于蛋壳之于鸡蛋。',
    density: '2.7 – 3.0 g/cm³',
    funCompare: '地球半径为 6,371 km，地壳平均厚度仅为其 0.5%，比蛋壳还要薄'
  }
];

// 太阳系行星数据（用于场景展示）
// 加入真实轨道参数：倾角 inclination（度）、偏心率 eccentricity、公转周期（相对地球=1）
// realDiameter：真实直径（相对地球=1），用于"真实比例"切换
export const planets = [
  { name: '水星', en: 'Mercury', color: 0xaaaaaa, size: 0.5, distance: 7, orbitSpeed: 4.15, rotationSpeed: 0.01, inclination: 7.0, eccentricity: 0.206, period: 0.24, realDiameter: 0.38, fact: '水星是离太阳最近、跑得最快的行星！' },
  { name: '金星', en: 'Venus', color: 0xe6c200, size: 0.8, distance: 10, orbitSpeed: 1.62, rotationSpeed: 0.008, inclination: 3.4, eccentricity: 0.007, period: 0.62, realDiameter: 0.95, fact: '金星是最亮的行星，温度高达 460°C！' },
  { name: '地球', en: 'Earth', color: 0x2288cc, size: 0.85, distance: 13, orbitSpeed: 1.0, rotationSpeed: 0.02, inclination: 0.0, eccentricity: 0.017, period: 1.0, realDiameter: 1.0, isEarth: true, fact: '点击我，看看我的肚子里藏着什么！' },
  { name: '火星', en: 'Mars', color: 0xcc4422, size: 0.55, distance: 16, orbitSpeed: 0.53, rotationSpeed: 0.018, inclination: 1.85, eccentricity: 0.093, period: 1.88, realDiameter: 0.53, fact: '火星是红色的，人们正在研究能不能去那里住。' },
  { name: '木星', en: 'Jupiter', color: 0xd8a86a, size: 2.4, distance: 22, orbitSpeed: 0.084, rotationSpeed: 0.04, inclination: 1.3, eccentricity: 0.049, period: 11.86, realDiameter: 11.2, fact: '木星是太阳系最大的行星，能装下 1300 个地球！' },
  { name: '土星', en: 'Saturn', color: 0xe0c080, size: 2.0, distance: 28, orbitSpeed: 0.034, rotationSpeed: 0.038, inclination: 2.5, eccentricity: 0.057, period: 29.46, realDiameter: 9.45, hasRing: true, fact: '土星有漂亮的光环，而且能漂在水面上（如果有个大水池）！' },
  { name: '天王星', en: 'Uranus', color: 0x88ccdd, size: 1.3, distance: 34, orbitSpeed: 0.012, rotationSpeed: 0.03, inclination: 0.77, eccentricity: 0.046, period: 84.01, realDiameter: 4.0, fact: '天王星是"躺着"转的，像在打滚！' },
  { name: '海王星', en: 'Neptune', color: 0x3366cc, size: 1.25, distance: 40, orbitSpeed: 0.006, rotationSpeed: 0.032, inclination: 1.77, eccentricity: 0.010, period: 164.8, realDiameter: 3.88, fact: '海王星上的风超级大，是太阳系最快的风！' }
];

// 月球数据（地球的卫星，绕地球运行）
export const moon = {
  name: '月球',
  en: 'Moon',
  color: 0xcccccc,
  size: 0.25,
  distance: 2.0, // 绕地球的轨道半径
  orbitSpeed: 13.0, // 绕地球公转（约是地球绕太阳的 13 倍速度）
  rotationSpeed: 0.01,
  fact: '月球是地球唯一的天然卫星，它让地球有潮汐！'
};

// 地球的趣味小知识（随机展示）
export const earthFunFacts = [
  '🌍 地球是太阳系里唯一已知有生命的地方！',
  '💧 地球表面 71% 都被水覆盖，所以从太空看是蓝色的。',
  '🌡️ 地球内部越往下越热，地下 1 公里就比地面热约 25°C。',
  '🧲 地球是一块超级大磁铁，指南针就是靠它工作的。',
  '🌋 全世界大约有 1500 座活火山，大部分在海底。',
  '🐘 如果把地球缩小到乒乓球那么大，地壳比一张纸还薄！'
];

// 火星内部结构科普数据（从内到外）
export const marsLayers = [
  {
    id: 'mars-core',
    name: '火星核',
    en: 'Mars Core',
    emoji: '🌡️',
    color: 0xcc8844,
    radiusRatio: 0.4,
    depth: '距表面约 1,700 – 3,390 km',
    temperature: '约 1,500°C',
    material: '铁-镍-硫（可能含少量氧）',
    state: '部分熔融（液态外核 + 固态内核）',
    kidFriendly: '火星中心有个大大的金属核，但比地球的小很多。',
    description: '火星的核半径约 1,700 km（约占火星半径一半），主要成分是铁、镍和硫。与地球不同，火星核已基本冷却凝固，因此火星的磁场极其微弱（曾有过强磁场，约 40 亿年前消失）。',
    fact: '🧭 火星磁场几乎消失，导致太阳风直接剥蚀大气——这是火星从温暖湿润变成寒冷干燥的重要原因。',
    density: '约 6–8 g/cm³',
    funCompare: '火星核相对火星体积比地球核相对地球更大，但已"熄火"'
  },
  {
    id: 'mars-mantle',
    name: '火星地幔',
    en: 'Mars Mantle',
    emoji: '🪨',
    color: 0xaa6644,
    radiusRatio: 0.93,
    depth: '距表面约 50 – 1,700 km',
    temperature: '500 – 1,500°C',
    material: '硅酸盐岩石（橄榄石、辉石）',
    state: '固态',
    kidFriendly: '火星中间一大层都是石头，比地球的地幔安静多了。',
    description: '火星地幔由硅酸盐岩石组成，厚度约 1,650 km。火星地幔对流活动远弱于地球，因此火星上已很久没有活跃的板块运动。火星上巨大的盾状火山（如奥林帕斯山，高 21.9 km）就是地幔热点曾经的产物。',
    fact: '🌋 火星的奥林帕斯山是太阳系最高火山（21.9 km），是珠穆朗玛峰的 2.5 倍高！',
    density: '约 3.5–6 g/cm³',
    funCompare: '火星地幔几乎"冻结"，不像地球地幔那样活跃流动'
  },
  {
    id: 'mars-crust',
    name: '火星地壳',
    en: 'Mars Crust',
    emoji: '🏜️',
    color: 0xcc7755,
    radiusRatio: 1.0,
    depth: '表面 0 – 约 50 km',
    temperature: '地表平均约 -60°C',
    material: '玄武岩（富含铁氧化物，故呈红色）',
    state: '固态岩石',
    kidFriendly: '火星的地壳锈迹斑斑，像生锈的铁，所以火星是红色的！',
    description: '火星地壳平均厚约 50 km（比地球地壳厚得多），富含铁氧化物（赤铁矿、磁铁矿），这是火星呈现红色的原因。火星地壳承载着太阳系最大的峡谷——水手号峡谷（长 4,000 km）。',
    fact: '🔴 火星的红色来自地壳中的氧化铁（铁锈），就像生锈的铁钉。',
    density: '约 2.7–3.0 g/cm³',
    funCompare: '火星地壳厚度约是地球地壳的 1.5 倍，但火星半径只有地球一半'
  }
];
