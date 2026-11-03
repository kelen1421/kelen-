export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const wrap = h => ((h % 360) + 360) % 360;
export function normalizeHex(value) {
  let hex = String(value).trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex)) hex = [...hex].map(x => x + x).join('');
  return /^[\da-f]{6}$/i.test(hex) ? '#' + hex.toUpperCase() : null;
}
export function hexToRgb(hex) {
  const n = parseInt(normalizeHex(hex).slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
export function hexToHsl(hex) {
  const [r,g,b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = wrap(h * 60);
  }
  return [h, s * 100, l * 100];
}
export function hslToRgb(h,s,l) {
  h = wrap(h); s = clamp(s,0,100)/100; l = clamp(l,0,100)/100;
  const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
  const values = h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return values.map(v => Math.round((v+m)*255));
}
export function hslToHex(h,s,l) {
  return '#' + hslToRgb(h,s,l).map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
}
export const FORMULAS = [
  {id:'complementary',name:'互补色',en:'Complementary',angles:[0,180],desc:'一冷一暖，让彼此更出彩。',rule:'H + 180°',usage:'适合醒目的视觉、海报和重点强调。让一个颜色主导，另一个作为点缀。'},
  {id:'analogous',name:'类似色',en:'Analogous',angles:[0,-30,30],desc:'相邻的色相，自然流动。',rule:'H − 30° · H + 30°',usage:'适合自然、柔和的品牌和空间。相邻色相能保持整体统一。'},
  {id:'triadic',name:'三角色',en:'Triadic',angles:[0,120,240],desc:'三个支点，平衡而鲜活。',rule:'H + 120° · H + 240°',usage:'适合活泼的品牌和插画。选一个主色，其余两色少量使用。'},
  {id:'split',name:'分裂互补',en:'Split complementary',angles:[0,150,210],desc:'保留对比，多一点柔和。',rule:'H + 150° · H + 210°',usage:'适合既需要层次又不想过于强烈的设计，比直接互补更灵活。'},
  {id:'tetradic',name:'矩形四色',en:'Tetradic',angles:[0,60,180,240],desc:'两组互补，层次更丰富。',rule:'H + 60° · H + 180° · H + 240°',usage:'适合多元素的插画与活动视觉。控制色彩比例，避免四色平均分配。'},
  {id:'monochromatic',name:'单色搭配',en:'Monochromatic',angles:[0,0,0,0,0],desc:'同一色相，不同深浅。',rule:'同色相 · 明度阶梯',usage:'适合简洁的界面与品牌。通过明暗变化建立层次，同时保持一致感。'}
];
export function makePalette(hex, id) {
  const [h,s,l] = hexToHsl(hex), formula = FORMULAS.find(f=>f.id===id) || FORMULAS[0];
  return formula.angles.map((a,i)=>({
    hex: i===0?normalizeHex(hex):hslToHex(h+a,s,id==='monochromatic'?[l,12+(l/100)*4,30+(l/100)*4,68+(l/100)*4,88+(l/100)*4][i]:l),
    label:i===0?'主色':id==='monochromatic'?['','深色','暗色','浅色','淡色'][i]:id==='complementary'?'互补色':`搭配色 ${i}`,
    angle:wrap(h+a)
  }));
}
export function luminance(hex) {
  const [r,g,b] = hexToRgb(hex).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+.055)/1.055)**2.4;});
  return .2126*r+.7152*g+.0722*b;
}
export const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
export const inkFor = hex => contrast(hex,'#191B1A')>=contrast(hex,'#FFFFFF')?'#191B1A':'#FFFFFF';
export const PRESETS = [
  {id:'olive',name:'橄榄与羊皮纸',en:'Olive & parchment',category:'低饱和',scene:'生活方式 · 包装',desc:'苔绿落在纸张上，安静而有温度。',colors:['#667052','#EAE6DA','#B9B6A6','#363C32','#C7A675']},
  {id:'burgundy',name:'勃艮第晚宴',en:'Burgundy evening',category:'浓郁',scene:'时尚 · 餐饮',desc:'酒红、暖白与金调，营造有分量的优雅。',colors:['#702B3A','#F1E9DE','#C7AB7B','#A78B83','#30262A']},
  {id:'mist',name:'雾蓝与银灰',en:'Blue hour',category:'低饱和',scene:'家居 · 品牌',desc:'冷静的灰蓝与银灰，保留轻盈的呼吸感。',colors:['#718796','#E7E9E7','#AEB8BC','#354957','#C4B9A9']},
  {id:'noir',name:'黑金序曲',en:'Noir & gold',category:'极简',scene:'精品 · 展览',desc:'克制的黑，少量的金，让质感落在细节。',colors:['#242522','#C4A66B','#F1EDE3','#797B70','#4A4B42']},
  {id:'earth',name:'大地留白',en:'Earth, quietly',category:'低饱和',scene:'建筑 · 美学',desc:'沙色、褐石与暖灰，来自自然材料的平衡。',colors:['#9D7F68','#EFE9DF','#C8BBAB','#63544B','#D8CFBF']},
  {id:'forest',name:'松林与奶白',en:'Forest ritual',category:'浓郁',scene:'香氛 · 空间',desc:'深松绿搭配柔和奶白，用浅棕色连接冷暖。',colors:['#244D43','#ECE8DD','#B8AD92','#799084','#28332D']},
  {id:'ink',name:'墨色与纸',en:'Ink on paper',category:'极简',scene:'编辑 · 字体',desc:'用黑白灰的细微层次，突出文字与构图。',colors:['#262827','#F2F0E9','#B5B6AF','#757971','#D7D7D0']},
  {id:'cobalt',name:'钴蓝画廊',en:'Cobalt gallery',category:'浓郁',scene:'艺术 · 文化',desc:'饱和的钴蓝与洁净底色，让视觉重心清晰。',colors:['#244EC2','#F1F0EB','#D3D7DB','#202D48','#A9B7CB']},
  {id:'rose',name:'烟粉与可可',en:'Rose & cocoa',category:'低饱和',scene:'美妆 · 生活',desc:'烟粉柔和，可可沉稳，温柔也可以有结构。',colors:['#B4868A','#F0E7E1','#745954','#D4B9AE','#382D2D']},
  {id:'navy',name:'海军蓝与驼色',en:'Tailored navy',category:'浓郁',scene:'服装 · 商务',desc:'深蓝的秩序感，被驼色与暖白柔化。',colors:['#283A4C','#C1A17A','#EEE9DE','#7C8A94','#544B43']},
  {id:'bauhaus',name:'现代主义',en:'Modern study',category:'浓郁',scene:'海报 · 平面',desc:'以明快的红、蓝、黄，建立清晰的视觉节奏。',colors:['#C9473F','#E7BC44','#325E9B','#F0ECE3','#282B2C']},
  {id:'sage',name:'鼠尾草日记',en:'Sage notes',category:'低饱和',scene:'文创 · 婚礼',desc:'浅鼠尾草绿与米灰，轻柔却不单薄。',colors:['#97A98F','#ECEBDD','#CDC7AF','#6A7766','#C5A89B']},
  {id:'bw-red',name:'黑白与朱红',en:'Black, white & vermilion',category:'黑白搭彩',scene:'海报 · 展览',desc:'用黑白建立秩序，少量朱红聚焦标题与重点。',colors:['#181818','#FFFFFF','#E9E9E6','#797979','#D9433D']},
  {id:'bw-blue',name:'黑白与钴蓝',en:'Black, white & cobalt',category:'黑白搭彩',scene:'品牌 · 数字界面',desc:'清晰的黑白骨架，配一抹冷静而醒目的钴蓝。',colors:['#17191C','#FFFFFF','#E7EBF2','#7B818B','#2456C8']},
  {id:'bw-yellow',name:'黑白与明黄',en:'Black, white & yellow',category:'黑白搭彩',scene:'导视 · 活动',desc:'明黄点亮黑白画面，适合少量强调与大字排版。',colors:['#1B1B18','#FFFFFF','#ECEBE4','#818075','#EDC43F']},
  {id:'bw-orange',name:'黑白与落日橙',en:'Black, white & orange',category:'黑白搭彩',scene:'运动 · 海报',desc:'黑白保持利落，暖橙为画面带来速度与活力。',colors:['#1B1917','#FFFFFF','#EDE8E2','#837B73','#E87932']},
  {id:'bw-green',name:'黑白与松绿',en:'Black, white & pine',category:'黑白搭彩',scene:'生活方式 · 包装',desc:'在简洁的黑白基底上，用松绿增加自然与安定感。',colors:['#181C19','#FFFFFF','#E5EBE6','#78847B','#448764']},
  {id:'bw-pink',name:'黑白与烟粉',en:'Black, white & rose',category:'黑白搭彩',scene:'时尚 · 美妆',desc:'黑白的干净线条，衬出烟粉的柔和与细腻。',colors:['#1C191B','#FFFFFF','#EFE7EA','#8A7B81','#D98FA5']},
  {id:'bw-purple',name:'黑白与雾紫',en:'Black, white & mauve',category:'黑白搭彩',scene:'艺术 · 文创',desc:'以雾紫作轻量点缀，让黑白多一点含蓄的个性。',colors:['#1B191F','#FFFFFF','#ECE8F1','#837B8C','#8E79B9']},
  {id:'bw-teal',name:'黑白与湖蓝',en:'Black, white & lagoon',category:'黑白搭彩',scene:'科技 · 编辑',desc:'黑白留白配湖蓝，呈现清爽、理性的视觉节奏。',colors:['#171C1D','#FFFFFF','#E4EEEF','#75878A','#3399A5']},
  {id:'bw-wine',name:'黑白与酒红',en:'Black, white & wine',category:'黑白搭彩',scene:'精品 · 餐饮',desc:'用黑白托住深酒红，突出成熟、克制的气质。',colors:['#1C1819','#FFFFFF','#EDE5E7','#87777B','#7B3041']},
  {id:'bw-khaki',name:'黑白与卡其',en:'Black, white & khaki',category:'黑白搭彩',scene:'服饰 · 家居',desc:'黑白搭配柔和卡其，让材质和细节成为主角。',colors:['#1B1A18','#FFFFFF','#ECE9E2','#827D73','#B29970']}
];
