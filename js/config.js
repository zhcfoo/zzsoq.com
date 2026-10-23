/* ============================================================
 *  这里是整个网站唯一需要你改的文件（文字 + 照片 + 音乐）
 *  改完直接刷新页面即可，不需要任何构建步骤。
 * ============================================================ */

window.SITE = {
  herName: '桢桢',             // 她的名字 / 昵称（第一页 “For 桢桢”）
  bdayCall: '老婆',            // 生日页那句 “老婆，23岁生日快乐” 里的称呼（留空就用 herName）
  myName: '爱你的老公',         // 落款
  birthday: '2003-10-15',      // 她的生日（不用改）
  togetherSince: '2024-10-08', // 你们在一起的日期，用来算“在一起第 N 天”

  // 《不可思议》专辑封面：把封面图片存成 photos/album.jpg 就会自动显示在“那一天”那一章（没有就显示设计好的封套）
  albumCover: 'photos/album.jpg',

  // 照片和插画（成长、回忆两处通用）：
  //   photo: 'photos/xxx.jpg'  放照片（图片放进 photos/ 文件夹；拍立得是正方形，回忆卡片是 4:5 竖图，会自动居中裁切）
  //   art: '名字'              没有照片时用手绘插画，可选：
  //       baby 襁褓婴儿 · sea 海边 · exam 试卷与嫩芽 · ginkgo 两片银杏 ·
  //       call 一通电话 · confess 表白信 · days73 七十三天 · kiss 亲亲 · everyday 日常
  //   两个都不写就显示一张素雅的占位卡

  // 成长：滑动时年份从 2003 滚到今年，每到一个年份飞入一张“拍立得”（year 从小到大）
  growth: [
    { year: 2003, text: '哭声很响，眼睛很亮', art: 'baby' },
    { year: 2006, text: '在海边追着浪花跑', art: 'sea' },
    { year: 2010, text: '背上小书包，认识世界', photo: 'photos/g2010.jpg' },
    { year: 2015, text: '有了喜欢的歌和小秘密', photo: 'photos/g2015.jpg' },
    { year: 2018, text: '在很多张试卷里悄悄长大', art: 'exam' },
    { year: 2021, text: '走出小岛，去看更大的世界', photo: 'photos/g2021.jpg' },
    { year: 2024, text: '然后，在秋天遇见了我', art: 'ginkgo' },
  ],

  // 我们：横向滑动的回忆卡片（title 可以不写）
  memories: [
    { date: '2024.10.08', title: '连接我们的一通电话', text: '那天你向我询问考研，平静语气下是辛酸，和让人心疼的坚韧。', art: 'call' },
    { date: '2024.10.22', title: '重逢第 15 天，你的生日', text: '送的第一个生日礼物，是一枚文昌节。那天我就想，以后每一个生日都要在你身边。', photo: 'photos/m02.jpg' },
    { date: '2024.12.3', text: '收到，一只熊，给我的生日礼物。此后每天睡觉，都要和我一起，不管在哪里。', photo: 'photos/m03.jpg' },
    { date: '2024.12.22', text: '祝贺沈也桢同学顺利完成全国研究生招生考试！所以我来闪现来送个饭和姜饼人以资鼓励。', photo: 'photos/m04.jpg' },
    { date: '2024.12.29', text: '表白。', art: 'confess' },
    { date: '2025.3.12', text: '第一次听到喜欢我。据我说喜欢你过了73天。7天后我们开始叫老公老婆~', art: 'days73' },
    { date: '2025.4.28', text: '软磨硬泡终于去海岛找到我的老婆，拍下第一张合照。这天雷暴，航班转降三亚。好不容易，见到你。', photo: 'photos/m07.jpg' },
    { date: '2025.4.29', text: '第一次，拉手、抱抱、亲亲。是谁全世界最最最美丽又诱人。', art: 'kiss' },
    { date: '2025.6.30', text: '欻一下，就陪我的老婆毕了业。但就剩我一个人了，每次经过满是回忆的地点，就鼻酸呢。', photo: 'photos/m09.jpg' },
    { date: '2025.8.21', text: '再去海岛。短短时间，吃了好多饭，还有我们的首个小旅行去了文昌铜鼓岭。女巫的毒药之超大波罗蜜，想哭我的小宝宝。', photo: 'photos/m10.jpg' },
    { date: '2025.10.10', text: '老婆备考压力好大，心情不好和爸爸有点争执，老公打视频老婆不接。真的好担心，遂买了12日的机票，再再去海岛，我们一起学习！', photo: 'photos/m11.jpg' },
    { date: '2025.11.9', text: '在一起老婆的第二个生日。以一种不热烈的庆祝，老公看了会很心疼。我就想，一定一定以后生日都要在老婆身边。', photo: 'photos/m12.jpg' },
    { date: '2025.12.21', text: '祝贺沈也桢同学顺利完成全国研究生招生考试！我又闪现来海岛啦。我们一起，过圣诞、生日、元旦，和无数觉得不可思议的日子~', photo: 'photos/m13.jpg' },
    { date: '2026.1.31', text: '短暂回去干活，老公又来海岛亲亲我的老婆啦~和老婆第一次去赶海~', photo: 'photos/m14.jpg' },
    { date: '2026.3.27', text: '老婆来哈尔滨复试，超级领先上岸哦~小宝宝焦虑哭哭，老公担心疼疼~', photo: 'photos/m15.jpg' },
    { date: '2026.4.29', text: '超级巧，25年今天，老公也是去海岛找老婆~老公很抱歉，去红树林那天发了那么大脾气。这趟我们拍了好多好多美照~', photo: 'photos/m16.jpg' },
    { date: '2026.6.1', text: '我的小宝宝儿童节快乐！这是老公和老婆第一次真正意义上的远程旅行~我们以后再去北京~', photo: 'photos/m17.jpg' },
    { date: '2026.7.24', text: '老公又来海岛啦，不管什么形式，老公一直都每月至少见老婆一回哦~我们去了琼海，再加一块地理拼图~', photo: 'photos/m18.jpg' },
    { date: '2026.8.22', text: '老公履行承诺来送我的老婆去上学校~和我老婆一起上课，规划宿舍空间~', photo: 'photos/m19.jpg' },
    { date: 'Everyday', title: '很普通的日子', text: '一起吃饭、散步、说晚安。普通，但闪闪发光。这是半年后的日常，我坚信。', art: 'everyday' },
  ],

  // 争吵：一句句出现
  quarrel: [
    '我们也吵过架。',
    '都是我的坏脾气，',
    '让你老受委屈，',
    '急躁，大吼，冷暴力。',
  ],
  // 雨停了
  resolve: [
    '可是每一次，',
    '我们都选择了，走回彼此身边。',
  ],

  // 相爱：围绕爱心出现的句子
  love: [
    '在每一句晚安里',
    '在每一次牵手里',
    '在吵完架后，先伸过来的那个拥抱里',
    '在我想起你就会笑的每一个瞬间里',
  ],

  // 最后的信，一段一个元素
  letter: [
    '生日快乐，我的女孩。',
    '谢谢你在 2003 年那个不可思议的秋天来到这个世界，也谢谢你后来走进我的世界。',
    '我们会吵架，会闹别扭，但我从来没有想过放开你的手。',
    '愿你新的一岁，被世界温柔以待。而我，会一直在。',
  ],
};

/* ============================================================
 *  背景音乐：每一章一段，滑到新的一章会交叉淡入淡出地切换
 *
 *  现在没放音乐文件，每章会播网页实时合成的一首曲子（八音盒 / 钢琴 / 铃音），风格各不相同。
 *  放音乐：把文件放进 music/ 文件夹，文件名和下面 src 一致即可，放了哪章就哪章换成真歌。
 *    start = 从第几秒开始（跳过前奏，直接进副歌）；end = 播到第几秒回到 start 循环（null = 播到结尾）
 *    同一首歌可以给好几章用（src 相同、start 相同时会接着放，不会重头开始）；
 *    也可以给同一首歌设不同的 start，让不同章节播这首歌的不同段落。
 *  不知道秒数？打开  网址?tune  有调节面板。
 * ============================================================ */
window.MUSIC = {
  volume: 0.9,
  sfxVolume: 0.8,   // 音效音量（0 = 关掉音效）
  crossfade: 2.4,   // 切歌时交叉淡入淡出的秒数
  loopFade: 1.2,    // 循环回到起点时的淡出淡入秒数

  scenes: {
    prologue: { title: '此刻你心里想起谁', artist: '王力宏', src: 'music/xinli.mp3',    start: 0, end: null, synth: 'dream' },
    day:      { title: '不可思议',         artist: '王力宏', src: 'music/bukesiyi.mp3', start: 0, end: null, synth: 'bright' },
    days:     { title: '（自选）',         artist: '',       src: 'music/days.mp3',     start: 0, end: null, synth: 'tender' },
    grow:     { title: '（自选）',         artist: '',       src: 'music/grow.mp3',     start: 0, end: null, synth: 'waltz' },
    us:       { title: '（自选）',         artist: '',       src: 'music/us.mp3',       start: 0, end: null, synth: 'sweet' },
    storm:    { title: '你不在',           artist: '王力宏', src: 'music/nibuzai.mp3',  start: 0, end: null, synth: 'blue' },
    love:     { title: '爱无所不在',       artist: '王力宏', src: 'music/love.mp3',     start: 0, end: null, synth: 'warm' },
    bday:     { title: '（自选）',         artist: '',       src: 'music/bday.mp3',     start: 0, end: null, synth: 'celebrate' },
  },

  // “处理版本”：每个段落对音乐做不同的实时处理
  // cutoff = 低通滤波（越小越闷、越像隔着一堵墙）；reverb = 混响量；level = 音量
  fx: {
    haze:    { cutoff: 2400,  reverb: 0.45, level: 0.80 }, // 朦胧、像回忆
    clear:   { cutoff: 20000, reverb: 0.12, level: 1.00 }, // 原声
    warm:    { cutoff: 7000,  reverb: 0.22, level: 0.92 }, // 暖一点、柔一点
    distant: { cutoff: 800,   reverb: 0.60, level: 0.72 }, // 吵架：遥远、压抑
  },
};
