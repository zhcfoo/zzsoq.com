/* ============================================================
 *  这里是整个网站唯一需要你改的文件（文字 + 照片 + 音乐）
 *  改完直接刷新页面即可，不需要任何构建步骤。
 * ============================================================ */

window.SITE = {
  herName: '宝贝',             // 她的名字 / 昵称
  myName: '爱你的我',           // 落款
  birthday: '2003-10-15',      // 她的生日（不用改）
  togetherSince: '2024-10-08', // 你们在一起的日期，用来算“在一起第 N 天”

  // 《不可思议》专辑封面：把封面图片存成 photos/album.jpg 就会自动显示在“那一天”那一章（没有就显示设计好的封套）
  albumCover: 'photos/album.jpg',

  // 成长：滑动时年份从 2003 滚到今年，每到一个年份飞入一张“拍立得”
  // photo 可留空（会显示精致的占位卡）；放照片：把图片放进 photos/ 文件夹，写 'photos/xxx.jpg'
  // 【改】换成她真实的小故事会更动人（year 从小到大）
  growth: [
    { year: 2003, text: '哭声很响，眼睛很亮', photo: '' },
    { year: 2006, text: '在海边追着浪花跑', photo: '' },
    { year: 2010, text: '背上小书包，认识世界', photo: '' },
    { year: 2015, text: '有了喜欢的歌和小秘密', photo: '' },
    { year: 2018, text: '在很多张试卷里悄悄长大', photo: '' },
    { year: 2021, text: '走出小岛，去看更大的世界', photo: '' },
    { year: 2024, text: '然后，在秋天遇见了我', photo: '' },
  ],

  // 我们：横向滑动的回忆卡片
  memories: [
    { date: '2024.10.08', title: '我们在一起了', text: '那天我紧张到说错话，你笑了，我就知道是你。', photo: '' },
    { date: '2024.10.15', title: '在一起第 8 天，你的生日', text: '刚在一起一个星期，就陪你过了生日。那天我就想，以后每一个生日都要在你身边。', photo: '' },
    { date: '2025', title: '第一次旅行', text: '走了很多路，拍了很多照片，最喜欢你笑的那张。', photo: '' },
    { date: 'Everyday', title: '很普通的日子', text: '一起吃饭、散步、说晚安。普通，但闪闪发光。', photo: '' },
  ],

  // 争吵：一句句出现
  quarrel: [
    '我们也吵过架。',
    '为了一句话，冷战一整晚。',
    '谁也不肯先说“对不起”，',
    '把手机翻过去，又偷偷翻回来。',
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
