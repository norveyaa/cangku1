/* ============================================================
   伴读智汇 · 数据层（原型）
   本地 mock 数据 + localStorage 持久化 + 认证/路由守卫
   所有页面通过 Store 读写，保证多页状态一致
   ============================================================ */
(function (global) {
  'use strict';

  var DB_KEY = 'bzdh_db_v1';

  /* ---------- 书籍封面生成（SVG data URI） ---------- */
  var COVER_PALETTES = [
    ['#1F3A5F', '#3A5A8C'], ['#8C5A2E', '#B07B3F'], ['#2E5C46', '#4C7A5E'],
    ['#5C3A66', '#7C548A'], ['#8A3A34', '#B05A50'], ['#2E5A66', '#4C7A88'],
    ['#4A4A66', '#6A6A88'], ['#66562E', '#88784C']
  ];
  function coverSvg(title, author, pi) {
    var p = COVER_PALETTES[pi % COVER_PALETTES.length];
    var fs = title.length >= 7 ? 30 : title.length >= 4 ? 34 : 40;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="252" viewBox="0 0 180 252">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs>' +
      '<rect width="180" height="252" fill="url(#g)"/>' +
      '<rect x="14" y="10" width="152" height="232" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>' +
      '<rect x="22" y="18" width="136" height="216" fill="none" stroke="rgba(255,255,255,0.18)"/>' +
      '<text x="90" y="150" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-weight="700" font-size="' + fs + '" letter-spacing="6">' + title + '</text>' +
      '<line x1="56" y1="172" x2="124" y2="172" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>' +
      '<text x="90" y="196" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="sans-serif" font-size="12" letter-spacing="3">' + author + ' 著</text>' +
      '<text x="90" y="226" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="serif" font-size="10" letter-spacing="4">伴读智汇</text>' +
      '</svg>');
  }

  /* ---------- 章节文本 ---------- */
  // 仅收录公有领域作品的短节选（合理引用），非公版书目使用原创梗概，标注清楚
  var TEXT = {
    luotuoxiangzi: {
      excerpt: {
        0: [
          '我们所要介绍的是祥子，不是骆驼，因为“骆驼”只是个外号；那么，我们就先说祥子，随手儿把骆驼与祥子那点关系说过去，也就算了。',
          '北平的洋车夫有许多派：年轻力壮，腿脚灵利的，讲究赁漂亮的车，拉“整天儿”，爱什么时候出车与收车都有自由；拉出车来，在固定的“车口”或宅门一放，专等坐快车的主儿。',
          '他没有什么模样，使他可爱的是脸上的精神。头不很大，圆眼，肉鼻子，两条眉很短很粗，头上永远剃得发亮。腮上没有多余的肉，脖子可是几乎与头一边儿粗；脸上永远红扑扑的，特别亮的是颧骨与右耳之间一块不小的疤。'
        ],
        1: [
          '他决定去拉包月，也许拉上几站，就把车买过来。他晓得自己有力气，只要肯卖力气，没有成不了的事。他想象着，一辆属于自己的新车，跑起来风响，像一只小兽，浑身是劲。',
          '战争的消息与谣言几乎每年随着春麦一块儿往起长，麦穗与刺刀可以算作北方人的希望与忧惧的象征。祥子晓得危险，可是那点钱，那辆车，像个小火苗似的在心里头烧着。'
        ],
        2: [
          '祥子只休息了一天，便又出车了。他忘不了那辆车，也忘不了那三匹骆驼。车是他的命，骆驼是个笑话，可是笑话里有他的血汗。',
          '他想去打听打听车子的下落，可是不敢。他怕听见那个结果。低着头，他慢慢往前走，像一条丧家之犬。'
        ]
      },
      synopsis: [
        '本章为演示节选。祥子在城里的生活继续推进：他起早贪黑，拉车攒钱，盘算着再买一辆属于自己的车。本章梗概：祥子租了车，在新一轮的奔波里尝尽甜酸。',
        '本章为演示节选。情节梗概：祥子遭遇了生活中的一次转折，人物关系发生变化，他的心境也在希望与失望之间摇摆。阅读时可注意作者对人物动作与心理的刻画。'
      ]
    },
    zhaohuaxishi: {
      excerpt: {
        5: [
          '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱文公的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。',
          '不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上，轻捷的叫天子忽然从草间直窜向云霄里去了。单是周围的短短的泥墙根一带，就有无限趣味。',
          '长妈妈曾经讲给我一个故事听：先前，有一个读书人住在古庙里用功，晚间，在院子里纳凉的时候，突然听到有人在叫他。'
        ]
      },
      synopsis: [
        '本篇为演示节选。作者回忆童年与青年时期的故人与旧事，于平实的叙述中寄寓深情。阅读时注意“小引”中关于写作缘起的自述。',
        '本篇为演示节选。散文中的人与事，隔着岁月回望，笔墨间有温情也有叹息。可留意作者白描式的笔法与言外之意。'
      ]
    },
    xiyouji: {
      excerpt: {
        0: [
          '感盘古开辟，三皇治世，五帝定伦，世界之间，遂分为四大部洲：曰东胜神洲，曰西牛贺洲，曰南赡部洲，曰北俱芦洲。这部书单表东胜神洲。',
          '海外有一国土，名曰傲来国。国近大海，海中有一座名山，唤为花果山。此山乃十洲之祖脉，三岛之来龙，自开清浊而立，鸿蒙判后而成。',
          '那座山正当顶上，有一块仙石。其石有三丈六尺五寸高，有二丈四尺围圆。盖自开辟以来，每受天真地秀，日精月华，感之既久，遂有灵通之意。'
        ]
      },
      synopsis: [
        '本回为演示节选。梗概：师徒一行继续西行，路遇新的磨难，悟空与八戒各有表现。阅读时注意章回体“诗曰”“正是”等套语的功能。',
        '本回为演示节选。梗概：取经队伍渡过一难，情节在此处埋下后文伏笔。可留意作者如何在一难接一难的结构中写出变化。'
      ]
    },
    hongloumeng: {
      excerpt: {
        0: [
          '此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借“通灵”之说，撰此《石头记》一书也。故曰“甄士隐”云云。',
          '列位看官：你道此书从何而来？说起根由虽近荒唐，细按则深有趣味。待在下将此来历注明，方使阅者了然不惑。'
        ]
      },
      synopsis: [
        '本回为演示节选。梗概：荣宁二府中的日常生活徐徐展开，人物渐次登场。阅读时注意作者“草蛇灰线，伏脉千里”的笔法。',
        '本回为演示节选。梗概：大观园中又起一段风波，人物的性情在细节中显露。可留意对话中的机锋与礼数。'
      ]
    },
    sanguo: {
      excerpt: {
        0: [
          '话说天下大势，分久必合，合久必分。周末七国分争，并入于秦。及秦灭之后，楚、汉分争，又并入于汉。',
          '汉朝自高祖斩白蛇而起义，一统天下，后来光武中兴，传至献帝，遂分为三国。推其致乱之由，殆始于桓、灵二帝。'
        ]
      },
      synopsis: [
        '本回为演示节选。梗概：群雄逐鹿，一场大战在即，谋士运筹，武将争锋。阅读时注意战前铺排与战时节奏的对比。',
        '本回为演示节选。梗概：局势再变，联盟与猜忌交织。可留意人物抉择背后的性格逻辑。'
      ]
    },
    xiaowangzi: {
      excerpt: {
        0: [
          '六岁那年，我在一本描写原始森林的书里，看到一幅精彩的插图：一条蟒蛇正在吞食一头野兽。书上说，蟒蛇把猎物整个吞下，不咀嚼，然后一动也不能动，睡上六个月来消化。',
          '于是我对丛林里的奇遇产生了无穷的遐想。我用彩色铅笔，画成了我的第一幅画。我把我的杰作拿给大人们看，问他们是不是害怕。他们回答说：“一顶帽子有什么可怕的？”'
        ]
      },
      synopsis: [
        '本章为演示节选。梗概：小王子游历到一颗新的星球，遇见一位奇怪的大人。阅读时注意那些“大人”身上的讽刺意味。',
        '本章为演示节选。梗概：狐狸说出了那个著名的秘密：重要的东西用眼睛是看不见的。'
      ]
    },
    antusheng: {
      excerpt: {
        0: [
          '乡下真是非常美丽。这正是夏天！小麦是金黄的，燕麦是绿油油的。干草在绿色的牧场上堆成垛，鹳鸟用它又长又红的腿子在散着步，啰嗦地讲着埃及话。',
          '太阳光正照着一幢老式的房子，它的四周流着几条很深的小溪。从墙角那儿一直到水里，全盖满了牛蒡的大叶子。最大的叶子长得非常高，小孩子简直可以直着腰站在下面。'
        ]
      },
      synopsis: [
        '本篇为演示节选。梗概：故事的主人公经历磨难，最终获得了幸福。阅读时注意童话中反复出现的“善良—磨难—幸福”结构。'
      ]
    },
    yisuo: {
      excerpt: {
        0: [
          '一只口渴的乌鸦找到一个水罐，罐里的水很少，它的嘴够不到水面。乌鸦想把罐子推倒，可是罐子太重。于是它叼来许多小石子，一颗一颗投进罐里。水面慢慢升高，乌鸦终于喝到了水。',
          '需要是发明之母，办法总比困难多。'
        ]
      },
      synopsis: [
        '本篇为演示节选。寓言短小精悍，结尾常有一句点题的教训。阅读时想一想：这则寓言的道理在今天还成立吗？'
      ]
    },
    haidiliangwanli: {
      excerpt: {
        0: [
          '一八六六年发生了一件离奇的事：海洋中出现了一个大家伙，不少船只在海上与它相遇，人们议论纷纷，说法不一。',
          '它比鲸鱼大得多，行动起来快得惊人，而且还会发出磷光。各国的报纸都报道了这件事，越传越神。'
        ]
      },
      synopsis: [
        '本章为演示节选。梗概：“鹦鹉螺号”继续海底航行，读者随尼摩船长见识了奇异的海底世界。阅读时注意科学与幻想的结合。',
        '本章为演示节选。梗概：海底的奇景之下，也藏着危险。可留意尼摩船长这个人物身上的谜团。'
      ]
    },
    gangtie: {
      excerpt: {
        0: [
          '人最宝贵的是生命。生命对人来说只有一次。人的一生应当这样度过：当他回首往事的时候，不会因为碌碌无为、虚度年华而悔恨，也不会因为为人卑劣、生活庸俗而愧疚。',
          '这样，在临终的时候，他就能够说：“我已把自己整个的生命和全部的精力献给了世界上最壮丽的事业——为人类的解放而斗争。”'
        ]
      },
      synopsis: [
        '本章为演示节选。梗概：保尔在艰苦的环境中坚持工作与学习。阅读时注意理想主义与具体生活细节的交织。'
      ]
    },
    jianai: {
      excerpt: {
        0: [
          '那一天不可能出去散步了。虽然早上我们还在光秃秃的灌木丛间闲逛了一个钟头，但是从午饭时起，凛冽的寒风就送来了乌云和冷雨，深冬的天气笼罩了一切。',
          '我倒是高兴不能出门了。我从来不喜欢长途散步，尤其是寒风凛冽的下午。'
        ]
      },
      synopsis: [
        '本章为演示节选。梗概：简·爱在桑菲尔德的生活出现了新的波澜。阅读时注意第一人称叙述带来的代入感。'
      ]
    },
    xiangtu: {
      excerpt: {},
      synopsis: [
        '本章为演示梗概（原作节选请购买正版）。费孝通先生提出“差序格局”的概念：中国人的社会关系像石头投入水中泛起的一圈圈波纹，以“己”为中心向外推展。',
        '本章为演示梗概。作者讨论“礼治秩序”：乡土社会的秩序主要依靠传统与教化，而非法律条文。阅读时可结合身边的例子理解。'
      ]
    },
    fanxing: {
      excerpt: {},
      synopsis: [
        '本篇为演示梗概（原作节选请购买正版）。冰心的小诗多以三言两语捕捉瞬间的感悟，主题围绕母爱、童心与自然。阅读时试着朗读，体会节奏。',
        '本篇为演示梗概。小诗如“繁星闪烁着——深蓝的太空，何曾听得见它们对语？”寥寥数语，意境悠远。'
      ]
    },
    kunchongji: {
      excerpt: {
        0: [
          '我想，没有一个昆虫学家是不爱惜自己的观察对象的。法布尔把荒石园当作实验室，把昆虫当作邻居与朋友。'
        ]
      },
      synopsis: [
        '本章为演示节选。梗概：作者以细致的观察与生动的笔触，记录了昆虫的习性与本能。阅读时注意科学与文学的结合。'
      ]
    }
  };

  /* ---------- 书目数据 ---------- */
  function chapters(n, named) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({
        title: named && named[i] ? named[i] : '第' + numCn(i + 1) + '章',
        words: 2600 + ((i * 137) % 900)
      });
    }
    return arr;
  }
  function numCn(n) {
    var d = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    if (n < 10) return d[n];
    if (n === 10) return '十';
    if (n < 20) return '十' + (n % 10 ? d[n % 10] : '');
    return d[Math.floor(n / 10)] + '十' + (n % 10 ? d[n % 10] : '');
  }

  var BOOKS = [
    {
      id: 'luotuoxiangzi', title: '骆驼祥子', author: '老舍', era: '现代', nation: '中国',
      stage: '初中', genre: '小说', words: '18万', minutes: '540', difficulty: '基础',
      themes: ['社会', '命运', '奋斗'], coverPi: 0, isFigmaCover: true, figmaCover: 'assets/img/cover-luotuoxiangzi.png',
      intro: '讲述北平人力车夫祥子三起三落的命运故事，展现旧时代底层劳动者的挣扎与希望。',
      coreThemes: ['个人奋斗与时代命运', '城市底层生存图景', '希望的三次起落'],
      thinkDir: '祥子的堕落是性格使然还是环境所致？结合文本证据谈一谈。',
      chapterNames: chapters(24, ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章', '第七章', '第八章', '第九章', '第十章', '第十一章', '第十二章', '第十三章', '第十四章', '第十五章', '第十六章', '第十七章', '第十八章', '第十九章', '第二十章', '第二十一章', '第二十二章', '第二十三章', '第二十四章']).map(function (c, i) { return c.title; })
    },
    {
      id: 'zhaohuaxishi', title: '朝花夕拾', author: '鲁迅', era: '现代', nation: '中国',
      stage: '初中', genre: '散文', words: '8万', minutes: '240', difficulty: '基础',
      themes: ['回忆', '成长', '温情'], coverPi: 1, isFigmaCover: true, figmaCover: 'assets/img/cover-zhaohuaxishi.png',
      intro: '鲁迅唯一的回忆性散文集，十篇文字追怀童年往事与故人，温情与锋芒并存。',
      coreThemes: ['童年记忆与故乡', '人情世态的观察', '温情背后的批判'],
      thinkDir: '鲁迅的回忆为何总在温情里藏着叹息？请以《从百草园到三味书屋》为例说明。',
      chapterNames: ['小引', '狗·猫·鼠', '阿长与《山海经》', '二十四孝图', '五猖会', '无常', '从百草园到三味书屋', '父亲的病', '琐记', '藤野先生', '范爱农', '后记']
    },
    {
      id: 'xiyouji', title: '西游记', author: '吴承恩', era: '明代', nation: '中国',
      stage: '初中', genre: '小说', words: '86万', minutes: '1560', difficulty: '进阶',
      themes: ['神话', '成长', '团队'], coverPi: 2,
      intro: '唐僧师徒四人西天取经，历经九九八十一难的神魔小说，中国古典四大名著之一。',
      coreThemes: ['取经路上的修行', '神魔世界的讽刺', '师徒关系的磨合'],
      thinkDir: '孙悟空的紧箍咒是束缚还是保护？结合具体情节说明你的看法。',
      chapterNames: chapters(20, ['第一回 灵根育孕源流出', '第二回 悟彻菩提真妙理', '第三回 四海千山皆拱伏', '第四回 官封弼马心何足', '第五回 乱蟠桃大圣偷丹', '第六回 观音赴会问原因', '第七回 八卦炉中逃大圣', '第八回 我佛造经传极乐', '第九回 陈光蕊赴任逢灾', '第十回 老龙王拙计犯天条']).map(function (c) { return c.title; })
    },
    {
      id: 'haidiliangwanli', title: '海底两万里', author: '儒勒·凡尔纳', era: '19世纪', nation: '法国',
      stage: '初中', genre: '科幻', words: '31万', minutes: '620', difficulty: '基础',
      themes: ['科幻', '探险', '海洋'], coverPi: 3,
      intro: '跟随尼摩船长与“鹦鹉螺号”漫游海底世界，科学与想象交织的科幻经典。',
      coreThemes: ['海洋探险与科学幻想', '尼摩船长的秘密', '人与自然的边界'],
      thinkDir: '尼摩船长是英雄还是复仇者？用小说中的证据支持你的观点。',
      chapterNames: chapters(18).map(function (c) { return c.title; })
    },
    {
      id: 'xiangtu', title: '乡土中国', author: '费孝通', era: '现代', nation: '中国',
      stage: '高中', genre: '社科', words: '7万', minutes: '300', difficulty: '进阶',
      themes: ['社会', '文化', '学术'], coverPi: 4,
      intro: '理解中国乡土社会的经典之作，以十四篇短文阐释差序格局、礼治秩序等概念。',
      coreThemes: ['差序格局', '礼治秩序与法治', '乡土社会的变迁'],
      thinkDir: '"差序格局"在今天的社会关系中还有体现吗？举出身边的例子。',
      chapterNames: ['乡土本色', '文字下乡', '再论文字下乡', '差序格局', '系维着私人的道德', '家族', '男女有别', '礼治秩序', '无讼', '无为政治', '长老统治', '血缘和地缘', '名实的分离', '从欲望到需要']
    },
    {
      id: 'xiaowangzi', title: '小王子', author: '圣埃克苏佩里', era: '20世纪', nation: '法国',
      stage: '小学', genre: '童话', words: '5万', minutes: '150', difficulty: '基础',
      themes: ['童话', '成长', '友谊'], coverPi: 5,
      intro: '小王子离开自己的星球，拜访一个个奇怪的大人，最终明白什么是爱与责任。',
      coreThemes: ['驯养与责任', '大人世界的荒诞', '重要的东西眼睛看不见'],
      thinkDir: '狐狸说"重要的东西用眼睛是看不见的"，你同意吗？',
      chapterNames: chapters(27).map(function (c) { return c.title; })
    },
    {
      id: 'antusheng', title: '安徒生童话', author: '安徒生', era: '19世纪', nation: '丹麦',
      stage: '小学', genre: '童话', words: '22万', minutes: '400', difficulty: '基础',
      themes: ['童话', '善良', '想象'], coverPi: 6,
      intro: '丑小鸭、海的女儿、卖火柴的小女孩……百读不厌的经典童话。',
      coreThemes: ['善良与坚韧', '苦难中的希望', '想象的世界'],
      thinkDir: '丑小鸭的故事告诉我们：坚持做自己，还是努力变成"别人期待的样子"？',
      chapterNames: ['丑小鸭', '海的女儿', '卖火柴的小女孩', '皇帝的新装', '拇指姑娘', '坚定的锡兵', '野天鹅', '夜莺', '冰雪女王', '打火匣']
    },
    {
      id: 'yisuo', title: '伊索寓言', author: '伊索', era: '古希腊', nation: '希腊',
      stage: '小学', genre: '寓言', words: '12万', minutes: '200', difficulty: '基础',
      themes: ['寓言', '智慧', '生活'], coverPi: 7,
      intro: '乌鸦喝水、龟兔赛跑……短小的故事里藏着历久弥新的生活智慧。',
      coreThemes: ['寓言的教训', '动物形象的寓意', '智慧与愚昧'],
      thinkDir: '龟兔赛跑里乌龟赢了，是因为它坚持，还是因为兔子大意？',
      chapterNames: ['乌鸦喝水', '龟兔赛跑', '狐狸与葡萄', '农夫与蛇', '狼来了', '北风与太阳', '狮子和老鼠', '蚊子和狮子', '牧童和狼', '蚂蚁与蚱蜢']
    },
    {
      id: 'fanxing', title: '繁星·春水', author: '冰心', era: '现代', nation: '中国',
      stage: '初中', genre: '诗歌', words: '3万', minutes: '90', difficulty: '基础',
      themes: ['诗歌', '母爱', '自然'], coverPi: 0,
      intro: '冰心小诗集，以繁星、春水为题，歌咏母爱、童真与自然。',
      coreThemes: ['母爱与童心', '自然的诗意', '小诗的形式之美'],
      thinkDir: '短小的诗为什么也能打动人？选择一首谈谈你的感受。',
      chapterNames: ['繁星（一）', '繁星（二）', '繁星（三）', '繁星（四）', '繁星（五）', '春水（一）', '春水（二）', '春水（三）', '春水（四）', '春水（五）']
    },
    {
      id: 'kunchongji', title: '昆虫记', author: '法布尔', era: '19世纪', nation: '法国',
      stage: '小学', genre: '科普', words: '26万', minutes: '500', difficulty: '进阶',
      themes: ['自然', '科学', '观察'], coverPi: 2,
      intro: '一部昆虫的史诗。法布尔用毕生观察，把荒石园写成生动的自然课堂。',
      coreThemes: ['细致观察的精神', '科学与文学的融合', '生命的尊严'],
      thinkDir: '法布尔为什么把昆虫当作朋友而不是实验品？这给我们什么启发？',
      chapterNames: ['蝉', '螳螂', '蟋蟀', '蜘蛛', '萤火虫', '粪金龟', '松毛虫', '天牛', '菜青虫', '蝎子']
    },
    {
      id: 'hongloumeng', title: '红楼梦', author: '曹雪芹', era: '清代', nation: '中国',
      stage: '高中', genre: '小说', words: '96万', minutes: '1800', difficulty: '挑战',
      themes: ['家族', '爱情', '命运'], coverPi: 4,
      intro: '以贾、史、王、薛四大家族兴衰为背景的古典小说巅峰之作。',
      coreThemes: ['家族兴衰的隐喻', '宝黛钗的情感纠葛', '封建礼教的批判'],
      thinkDir: '"千红一窟（哭），万艳同杯（悲）"，作者为谁而哭？',
      chapterNames: chapters(24, '第').map(function (c) { return c.title; })
    },
    {
      id: 'gangtie', title: '钢铁是怎样炼成的', author: '奥斯特洛夫斯基', era: '20世纪', nation: '苏联',
      stage: '初中', genre: '小说', words: '28万', minutes: '560', difficulty: '进阶',
      themes: ['理想', '意志', '奋斗'], coverPi: 3,
      intro: '保尔·柯察金在战火与病痛中锻造意志，影响几代人的励志经典。',
      coreThemes: ['理想主义的青春', '意志的锻造', '生命的价值'],
      thinkDir: '保尔式的奋斗在今天还有意义吗？结合你的生活谈谈。',
      chapterNames: chapters(18).map(function (c) { return c.title; })
    },
    {
      id: 'jianai', title: '简·爱', author: '夏洛蒂·勃朗特', era: '19世纪', nation: '英国',
      stage: '高中', genre: '小说', words: '42万', minutes: '780', difficulty: '进阶',
      themes: ['女性', '尊严', '爱情'], coverPi: 6,
      intro: '孤女简·爱追求独立与尊严，最终获得平等的爱情。',
      coreThemes: ['独立人格的养成', '平等之爱', '女性意识的觉醒'],
      thinkDir: '简·爱说"我们是平等的"，这句话在小说中有几层含义？',
      chapterNames: chapters(16).map(function (c) { return c.title; })
    },
    {
      id: 'sanguo', title: '三国演义', author: '罗贯中', era: '元末明初', nation: '中国',
      stage: '高中', genre: '小说', words: '64万', minutes: '1200', difficulty: '挑战',
      themes: ['历史', '谋略', '英雄'], coverPi: 5,
      intro: '汉末群雄逐鹿，魏蜀吴三分天下，一部英雄与谋略的史诗。',
      coreThemes: ['乱世中的英雄', '谋略与人心', '正统与忠义'],
      thinkDir: '曹操是"奸雄"还是"英雄"？请引用书中情节说明。',
      chapterNames: chapters(20).map(function (c) { return c.title; })
    }
  ];

  /* ---------- 题目 ---------- */
  var QUIZ = {
    luotuoxiangzi: {
      0: [
        { q: '祥子刚进城时的职业理想是什么？', opts: ['开一家车行', '买一辆属于自己的车', '当巡警', '做买卖'], a: 1, exp: '祥子"他的志愿是买一辆车，一辆属于自己的车"。' },
        { q: '小说开头，祥子脸上的疤在什么位置？', opts: ['额头上', '左手上', '颧骨与右耳之间', '下巴上'], a: 2, exp: '原文："特别亮的是颧骨与右耳之间一块不小的疤。"' },
        { q: '祥子的外号"骆驼"与哪件事有关？', opts: ['他长得像骆驼', '他养过骆驼', '他顺手牵走三匹骆驼', '他说话慢'], a: 2, exp: '祥子被抓壮丁后逃出，顺手牵走了三匹骆驼换钱，因此得了"骆驼"的外号。' }
      ],
      1: [
        { q: '祥子第一次买车后不久遭遇了什么？', opts: ['车被偷了', '车被大兵抢走', '车摔坏了', '把车卖了'], a: 1, exp: '祥子连人带车被乱兵抓去，车也丢了。' },
        { q: '祥子用骆驼换了多少钱？', opts: ['三十五块', '五十块', '一百块', '八十块'], a: 0, exp: '三匹骆驼卖了三十五块钱，成了祥子二次买车的本钱。' },
        { q: '祥子再次攒钱的动力来自哪里？', opts: ['家人的期望', '对车的执念', '朋友的鼓励', '躲避债务'], a: 1, exp: '买车的念头在祥子心里"像个小火苗"，是他的精神支柱。' }
      ],
      2: [
        { q: '祥子卖掉骆驼后回到了哪里？', opts: ['乡下老家', '北平城里', '天津', '西山'], a: 1, exp: '祥子回到北平，重新开始拉车攒钱。' },
        { q: '下列哪一项最能概括祥子早期的性格？', opts: ['精明算计', '老实肯干、要强', '软弱怕事', '暴躁冲动'], a: 1, exp: '早期的祥子"有自己的力气"，老实要强，一心凭本事买车。' },
        { q: '"像一条丧家之犬"的比喻写出了祥子怎样的心情？', opts: ['愤怒', '得意', '失落沮丧', '轻松'], a: 2, exp: '丢了车又不敢打听，祥子陷入深深的沮丧。' }
      ]
    }
  };

  var THINK = [
    {
      id: 'think-1', bookId: 'luotuoxiangzi', chapter: 2, type: '观点辨析', diff: '进阶',
      title: '祥子的第一次买车，是"梦想成真"还是"悲剧开场"？',
      guide: '结合第一章祥子的期待与第三章丢车的结局，谈你的判断。',
      evidence: '回答中请至少引用一处原文（可直接复制你划线的内容）。',
      hints: { light: '想一想：作者写祥子买车时的喜悦用了什么笔法？', mid: '提示：注意"风响""小兽"这两个比喻的情绪色彩，再联系后文。', full: '参考思路：喜悦越具体，失落越沉重——作者以希望之"起"铺垫命运之"落"，这正是"三起三落"结构的开始。' },
      ref: '“他想象着，一辆属于自己的新车，跑起来风响，像一只小兽，浑身是劲。”'
    },
    {
      id: 'think-2', bookId: 'luotuoxiangzi', chapter: 2, type: '因果分析', diff: '基础',
      title: '祥子明知道出城有危险，为什么还要去？',
      guide: '找出文中描写他心理活动的句子，分析他的动机。',
      evidence: '请引用心理描写的原文作为证据。',
      hints: { light: '重读关于"两块钱"的那段描写。', mid: '提示：危险与机会是同一件事的两面，祥子心里在算一笔什么账？', full: '参考思路：高车费带来的诱惑、对运气的侥幸心理，加上底层生存的压力，共同推着他冒险。' },
      ref: '“战争的消息与谣言几乎每年随着春麦一块儿往起长。”'
    },
    {
      id: 'think-3', bookId: 'luotuoxiangzi', chapter: 3, type: '人物评价', diff: '挑战',
      title: '卖掉骆驼换来的钱，是祥子的"救命稻草"还是"新的执念"？',
      guide: '从祥子对这笔钱的态度入手，评价他此时的精神状态。',
      evidence: '引用原文中对祥子心理或动作的描写。',
      hints: { light: '注意祥子数钱、藏钱的动作细节。', mid: '提示：钱带给他的不安全感与希望感，哪个更多？', full: '参考思路：骆驼钱既是物质依托，也强化了"买车"的执念，为后文的再度破灭埋下伏笔。' },
      ref: '“车是他的命，骆驼是个笑话，可是笑话里有他的血汗。”'
    },
    {
      id: 'think-4', bookId: 'luotuoxiangzi', chapter: 5, type: '现实迁移', diff: '进阶',
      title: '祥子"埋头苦干就能改变命运"的信念，在今天还成立吗？',
      guide: '结合祥子的遭遇与今天的社会环境，谈谈你的看法。',
      evidence: '请用小说情节与现实事例各一支撑观点。',
      hints: { light: '先概括祥子努力与结果的关系。', mid: '提示：个人努力与时代环境、机会的关系，可以分开讨论。', full: '参考思路：努力是必要条件而非充分条件——祥子的悲剧提醒我们关注个人奋斗之外的结构性因素。' },
      ref: ''
    },
    {
      id: 'think-5', bookId: 'zhaohuaxishi', chapter: 6, type: '观点辨析', diff: '基础',
      title: '百草园是"乐园"，三味书屋是"苦地"吗？',
      guide: '重读《从百草园到三味书屋》中两个场景的描写。',
      evidence: '分别引用一处百草园与三味书屋的原文。',
      hints: { light: '注意作者写三味书屋时的语气，是纯然的厌恶吗？', mid: '提示："先生"这个形象里有几分可爱？', full: '参考思路：三味书屋虽有约束，也有"捉苍蝇喂蚂蚁"的趣味与先生的方正可爱——童年之乐从未中断。' },
      ref: '“不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹。”'
    },
    {
      id: 'think-6', bookId: 'zhaohuaxishi', chapter: 2, type: '人物评价', diff: '进阶',
      title: '长妈妈"踩死隐鼠""买来《山海经》"——她究竟是怎样的一个人？',
      guide: '梳理长妈妈做的事，再谈作者对她的情感。',
      evidence: '引用一处最能体现作者情感变化的句子。',
      hints: { light: '注意"伟大的神力"这个说法。', mid: '提示：作者的情感经历了从厌烦到敬意、到怀念的变化。', full: '参考思路：长妈妈粗俗中有质朴的关爱，"别人不肯做，或不能做的事，她却能够做成功"——这是鲁迅笔下最温暖的人物之一。' },
      ref: ''
    }
  ];

  var EXTEND = [
    { id: 'ex-1', bookId: 'luotuoxiangzi', title: '老舍《我这一辈子》：另一个北平小人物的自述', kind: '同作者', words: '3.2万', link: '' },
    { id: 'ex-2', bookId: 'luotuoxiangzi', title: '论文《<骆驼祥子>的城市空间与人物命运》', kind: '学术入门', words: '0.8万', link: '' },
    { id: 'ex-3', bookId: 'luotuoxiangzi', title: '纪录片《北平以北》片段：老北京人力车夫的日常', kind: '影视片段', words: '18分钟', link: '' },
    { id: 'ex-4', bookId: 'zhaohuaxishi', title: '鲁迅《呐喊·自序》：理解"回忆"的钥匙', kind: '同作者', words: '0.4万', link: '' },
    { id: 'ex-5', bookId: 'zhaohuaxishi', title: '散文《阿长与〈山海经〉》名家朗读音频', kind: '音频', words: '12分钟', link: '' },
    { id: 'ex-6', bookId: 'xiyouji', title: '论文《大闹天宫叙事中的反抗与收编》', kind: '学术入门', words: '0.9万', link: '' }
  ];

  /* ---------- 教师端数据 ---------- */
  var STU_NAMES = ['林知夏', '周子墨', '陈雨桐', '王浩然', '刘思远', '赵婉清', '孙嘉树', '郑可欣', '吴一凡', '徐梦琪', '何俊杰', '高语桐'];
  var CLASSES = [{
    id: 'class-1', name: '七年级（3）班', grade: '七年级', inviteCode: 'Q3-2026',
    bookId: 'luotuoxiangzi', total: 42,
    students: STU_NAMES.map(function (n, i) {
      return {
        name: n,
        completion: [100, 92, 88, 83, 79, 75, 71, 67, 63, 58, 54, 50][i],
        score: [92, 88, 85, 84, 82, 81, 80, 78, 76, 75, 73, 72][i],
        active: [14, 12, 11, 10, 10, 9, 8, 8, 7, 6, 6, 5][i],
        weak: ['思辨力', '文本证据', '情节理解', '思辨力', '文本证据', '情节理解', '思辨力', '文本证据', '思辨力', '情节理解', '文本证据', '思辨力'][i],
        status: i < 8 ? '在轨' : i < 11 ? '需提醒' : '需干预'
      };
    }),
    // 其余 30 名学生聚合数据
    restAvg: { completion: 62, score: 74, active: 5 },
    chapterHeat: (function () { var r = []; for (var c = 0; c < 12; c++) r.push(Math.max(30, Math.round(98 - c * 6 - (c % 3) * 3 - ((c * 7) % 5)))); return r; })(),
    scores: { 任务一: 78, 任务二: 81, 任务三: 79, 任务四: 84, 任务五: 86 },
    activity: {
      weeks: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
      read: [42, 55, 48, 61, 58, 66],
      discuss: [12, 18, 15, 24, 22, 31]
    },
    tasks: [
      { id: 'ct-1', title: '《骆驼祥子》第一至八章 · 导读任务', deadline: '10-18', submitted: 38, total: 42, type: '导读' },
      { id: 'ct-2', title: '第九章至十六章 · 章节测', deadline: '10-23', submitted: 31, total: 42, type: '章节测' },
      { id: 'ct-3', title: '思辨题：祥子的第一次买车', deadline: '10-27', submitted: 18, total: 42, type: '思辨题' }
    ],
    reviews: [
      { id: 'rv-1', stu: '周子墨', task: '思辨题：祥子的第一次买车', submittedAt: '10-19 21:04', status: '待评阅', preview: '祥子的第一次买车既是梦想成真，也是悲剧开场。老舍先生写他买车时的样子……' },
      { id: 'rv-2', stu: '陈雨桐', task: '思辨题：祥子的第一次买车', submittedAt: '10-19 22:41', status: '待评阅', preview: '我认为是悲剧开场。因为作者用了"小兽"这个比喻，暗示他后来的命运……' },
      { id: 'rv-3', stu: '王浩然', task: '第九章至十六章 · 章节测', submittedAt: '10-20 07:32', status: '待评阅', preview: '章节测已完成提交。' }
    ]
  }];

  var BANK = [
    { id: 'bk-1', bookId: 'luotuoxiangzi', type: '思辨题', diff: '进阶', title: '祥子的第一次买车，是"梦想成真"还是"悲剧开场"？', src: '系统题库' },
    { id: 'bk-2', bookId: 'luotuoxiangzi', type: '章节测', diff: '基础', title: '第一章·选择题（3题）', src: '系统题库' },
    { id: 'bk-3', bookId: 'zhaohuaxishi', type: '思辨题', diff: '基础', title: '百草园是"乐园"，三味书屋是"苦地"吗？', src: '系统题库' },
    { id: 'bk-4', bookId: 'xiyouji', type: '思辨题', diff: '挑战', title: '紧箍咒是束缚还是保护？', src: '自建' },
    { id: 'bk-5', bookId: 'hongloumeng', type: '思辨题', diff: '挑战', title: '作者为谁而哭？——"千红一窟"的寓意', src: '校本' },
    { id: 'bk-6', bookId: 'haidiliangwanli', type: '思辨题', diff: '进阶', title: '尼摩船长是英雄还是复仇者？', src: '收藏' },
    { id: 'bk-7', bookId: 'xiangtu', type: '思辨题', diff: '进阶', title: '"差序格局"在今天还有体现吗？', src: '自建' },
    { id: 'bk-8', bookId: 'sanguo', type: '思辨题', diff: '挑战', title: '曹操是"奸雄"还是"英雄"？', src: '系统题库' }
  ];

  /* ---------- 种子数据 ---------- */
  function seed() {
    return {
      accounts: [
        { phone: '13800000001', pass: '123456', name: '林知夏', role: 'student' },
        { phone: '13800000002', pass: '123456', name: '陈砚秋', role: 'teacher' }
      ],
      user: null, // { name, role, phone, stage, grade, goal, tags }
      student: {
        stage: '初中', grade: '七年级', school: '育才中学', goal: '思辨写作',
        tags: ['文学', '科幻', '历史'],
        shelf: {
          reading: [['luotuoxiangzi', 17], ['zhaohuaxishi', 3]],
          want: ['xiangtu', 'fanxing'],
          done: ['xiaowangzi', 'antusheng', 'yisuo']
        },
        chapterRead: { luotuoxiangzi: [0, 1, 2] },
        minutesWeek: [90, 38, 0, 0, 0, 0, 0], // 周一到周日（与设计稿一致：128 分钟）
        minutesTotal: 1476, streak: 7,
        ability: { 投入度: 82, 理解度: 76, 思辨力: 68, 坚持度: 88 },
        planMode: 'standard', // easy | standard | sprint
        notes: [
          { id: 'n-1', bookId: 'luotuoxiangzi', chapter: 17, chapterTitle: '第十八章', quote: '教学示例第3段', text: '祥子的"希望"每燃起一次就被浇灭一次。这句话写得真冷。', date: '2026-10-20' },
          { id: 'n-2', bookId: 'zhaohuaxishi', chapter: 5, chapterTitle: '从百草园到三味书屋', quote: '', text: '鲁迅写百草园，动词一个接一个：翻、按、拍、喷。回忆是有声音和味道的。', date: '2026-10-18' }
        ],
        highlights: { luotuoxiangzi: [{ ch: 0, start: '我们所要介绍的是祥子，不是骆驼', text: '开篇即点题：祥子是"人"，骆驼是"外号"，人的命运才是小说的重心。' }] },
        bookmarks: { luotuoxiangzi: [1] },
        wrong: [
          { id: 'w-1', bookId: 'luotuoxiangzi', q: '祥子第一次买车后不久遭遇了什么？', mine: '车被偷了', right: '车被大兵抢走', exp: '祥子连人带车被乱兵抓去。注意区分"偷"与"抢"。', date: '2026-10-16' },
          { id: 'w-2', bookId: 'luotuoxiangzi', q: '祥子用骆驼换了多少钱？', mine: '一百块', right: '三十五块', exp: '三匹骆驼共卖三十五块，注意"一百块"是祥子攒钱的总数。', date: '2026-10-16' }
        ],
        favorites: ['ex-1', 'ex-5'],
        achievements: [
          { id: 'a-1', name: '七日有读', desc: '连续阅读 7 天', got: true, date: '2026-10-20' },
          { id: 'a-2', name: '三本书，三个世界', desc: '累计完读 3 本', got: true, date: '2026-10-12' },
          { id: 'a-3', name: '让观点有依据', desc: '完成 5 次证据型思辨', got: false, progress: 4, total: 5 }
        ],
        messages: [
          { id: 'm-1', type: '任务', title: '《骆驼祥子》第十六至十八章任务已发布', time: '10-19 09:30', read: false },
          { id: 'm-2', type: '评价', title: '陈老师点评了你的思辨题作业', time: '10-18 16:20', read: false },
          { id: 'm-3', type: '系统', title: '本周阅读周报已生成', time: '10-18 08:00', read: true }
        ],
        submissions: {} // taskId -> {score:{...}, feedback, date}
      },
      teacher: {
        name: '陈砚秋', school: '育才中学', subject: '语文',
        classes: CLASSES, bank: BANK,
        pending: 3, unread: 2
      },
      coach: {
        log: [] // {role, text, time}
      },
      settings: { theme: 'light', eyeProtect: false, notifyTask: true, notifyReview: true, fontScale: 'normal' }
    };
  }

  /* ---------- Store ---------- */
  var db = null;
  function load() {
    if (db) return db;
    try {
      var raw = localStorage.getItem(DB_KEY);
      db = raw ? JSON.parse(raw) : seed();
    } catch (e) { db = seed(); }
    return db;
  }
  function save() { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  function deepMerge(base, patch) {
    for (var k in patch) {
      if (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k]) && base[k] && typeof base[k] === 'object') {
        deepMerge(base[k], patch[k]);
      } else if (patch[k] !== undefined) {
        base[k] = patch[k];
      }
    }
    return base;
  }

  var Store = {
    reset: function () { db = seed(); save(); },

    /* ---- 认证 ---- */
    user: function () { return load().user; },
    login: function (phone, pass) {
      var acc = load().accounts.find(function (a) { return a.phone === phone; });
      if (!acc) return { ok: false, msg: '该手机号尚未注册' };
      if (acc.pass !== pass) return { ok: false, msg: '密码不正确' };
      load().user = { name: acc.name, role: acc.role, phone: acc.phone };
      save();
      return { ok: true, role: acc.role };
    },
    loginByCode: function (phone) {
      var acc = load().accounts.find(function (a) { return a.phone === phone; });
      if (!acc) return { ok: false, msg: '该手机号尚未注册，请先注册' };
      load().user = { name: acc.name, role: acc.role, phone: acc.phone };
      save();
      return { ok: true, role: acc.role };
    },
    loginByInvite: function (code) {
      var cls = load().teacher.classes.find(function (c) { return c.inviteCode === code; });
      if (!cls) return { ok: false, msg: '邀请码不存在，请核对后重试' };
      load().user = { name: '林知夏', role: 'student', phone: '13800000001' };
      save();
      return { ok: true, role: 'student' };
    },
    register: function (data) {
      var role = data.role || 'student';
      load().accounts.push({ phone: data.phone, pass: data.pass, name: data.name || '新同学', role: role });
      load().user = { name: data.name || '新同学', role: role, phone: data.phone };
      if (role === 'student') {
        deepMerge(load().student, {
          stage: data.stage, grade: data.grade, goal: data.goal, tags: data.tags, school: data.school || '未填写'
        });
      }
      save();
      return { ok: true };
    },
    logout: function () { load().user = null; save(); },

    /* ---- 书目 ---- */
    books: function () {
      return load().books || BOOKS.map(function (b) {
        var c = { cover: coverSvg(b.title, b.author, b.coverPi) };
        return Object.assign({}, b, c);
      });
    },
    book: function (id) {
      var b = load().books.find(function (x) { return x.id === id; });
      return b || BOOKS.find(function (x) { return x.id === id; });
    },
    bookCover: function (b) {
      if (b.isFigmaCover && b.figmaCover) return b.figmaCover;
      return b.cover || coverSvg(b.title, b.author, b.coverPi || 0);
    },
    chapterText: function (bookId, chIdx) {
      var t = TEXT[bookId] || {};
      var ex = t.excerpt || {}, sy = t.synopsis || [];
      if (ex[chIdx]) return { paragraphs: ex[chIdx], isExcerpt: true };
      var paras = sy.map(function (s) { return s; });
      return { paragraphs: paras, isExcerpt: false };
    },
    quiz: function (bookId, chIdx) {
      var q = QUIZ[bookId] || {};
      return q[chIdx] || [];
    },
    thinkList: function (bookId) { return THINK.filter(function (t) { return !bookId || t.bookId === bookId; }); },
    think: function (id) { return THINK.find(function (t) { return t.id === id; }); },
    extendList: function (bookId) { return EXTEND.filter(function (e) { return !bookId || e.bookId === bookId; }); },

    /* ---- 学生：书架/进度 ---- */
    student: function () { return load().student; },
    shelfStatus: function (bookId) {
      var s = load().student.shelf;
      if (s.reading.some(function (r) { return r[0] === bookId; })) return 'reading';
      if (s.want.indexOf(bookId) >= 0) return 'want';
      if (s.done.indexOf(bookId) >= 0) return 'done';
      return 'none';
    },
    addToShelf: function (bookId, status) {
      var s = load().student.shelf;
      s.reading = s.reading.filter(function (r) { return r[0] !== bookId; });
      s.want = s.want.filter(function (x) { return x !== bookId; });
      s.done = s.done.filter(function (x) { return x !== bookId; });
      if (status === 'reading') s.reading.push([bookId, 0]);
      if (status === 'want') s.want.push(bookId);
      if (status === 'done') s.done.push(bookId);
      save();
    },
    progressOf: function (bookId) {
      var b = BOOKS.find(function (x) { return x.id === bookId; });
      var s = load().student.shelf;
      var r = s.reading.find(function (x) { return x[0] === bookId; });
      if (r) return { chapter: r[1], total: b.chapterNames.length, pct: Math.round(r[1] / b.chapterNames.length * 100) };
      if (s.done.indexOf(bookId) >= 0) return { chapter: b.chapterNames.length, total: b.chapterNames.length, pct: 100 };
      return { chapter: 0, total: b.chapterNames.length, pct: 0 };
    },
    chapterReadList: function (bookId) { return load().student.chapterRead[bookId] || []; },
    markChapterRead: function (bookId, chIdx) {
      var st = load().student;
      if (st.chapterRead[bookId] === undefined) st.chapterRead[bookId] = [];
      if (st.chapterRead[bookId].indexOf(chIdx) < 0) {
        st.chapterRead[bookId].push(chIdx);
        var r = st.shelf.reading.find(function (x) { return x[0] === bookId; });
        if (r) r[1] = Math.max(r[1], st.chapterRead[bookId].length);
        save();
      }
    },
    addMinutes: function (m) {
      var st = load().student;
      st.minutesTotal += m;
      st.minutesWeek[6] += m; // 原型简化：累计到"今天"
      save();
    },

    /* ---- 学生：笔记/划线/书签 ---- */
    notes: function () { return load().student.notes; },
    addNote: function (bookId, chapterIdx, quote, text) {
      load().student.notes.unshift({
        id: 'n-' + Date.now(), bookId: bookId, chapter: chapterIdx,
        chapterTitle: BOOKS.find(function (b) { return b.id === bookId; }).chapterNames[chapterIdx],
        quote: quote, text: text, date: new Date().toISOString().slice(0, 10)
      });
      save();
    },
    removeNote: function (id) {
      load().student.notes = load().student.notes.filter(function (n) { return n.id !== id; });
      save();
    },
    highlights: function (bookId) { return load().student.highlights[bookId] || []; },
    addHighlight: function (bookId, chIdx, text) {
      var h = load().student.highlights;
      if (!h[bookId]) h[bookId] = [];
      h[bookId].push({ ch: chIdx, start: text.slice(0, 12), text: text });
      save();
    },
    removeHighlight: function (bookId, idx) {
      load().student.highlights[bookId].splice(idx, 1);
      save();
    },
    bookmarks: function (bookId) { return load().student.bookmarks[bookId] || []; },
    toggleBookmark: function (bookId, chIdx) {
      var b = load().student.bookmarks;
      if (!b[bookId]) b[bookId] = [];
      var i = b[bookId].indexOf(chIdx);
      if (i >= 0) b[bookId].splice(i, 1); else b[bookId].push(chIdx);
      save();
      return i < 0;
    },

    /* ---- 学生：错题/收藏/成就 ---- */
    wrongList: function () { return load().student.wrong; },
    addWrong: function (w) { load().student.wrong.unshift(w); save(); },
    removeWrong: function (id) { load().student.wrong = load().student.wrong.filter(function (w) { return w.id !== id; }); save(); },
    favorites: function () { return load().student.favorites; },
    toggleFavorite: function (exId) {
      var f = load().student.favorites;
      var i = f.indexOf(exId);
      if (i >= 0) f.splice(i, 1); else f.push(exId);
      save();
      return i < 0;
    },
    achievements: function () { return load().student.achievements; },

    /* ---- 学生：任务提交 ---- */
    submitTask: function (taskId, payload) {
      var st = load().student;
      st.submissions[taskId] = Object.assign({
        date: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }, payload);
      // 提交后更新能力与成就
      st.ability['思辨力'] = Math.min(99, st.ability['思辨力'] + 1);
      var a = st.achievements.find(function (x) { return x.id === 'a-3'; });
      if (a && !a.got) { a.progress = Math.min(a.total, a.progress + 1); if (a.progress >= a.total) { a.got = true; a.date = '2026-10-20'; } }
      save();
    },
    submission: function (taskId) { return load().student.submissions[taskId] || null; },

    /* ---- 学生：计划模式 ---- */
    planMode: function () { return load().student.planMode; },
    setPlanMode: function (mode) { load().student.planMode = mode; save(); },

    /* ---- 学生：陪练对话 ---- */
    coachLog: function () { return load().coach.log; },
    appendCoach: function (role, text) {
      load().coach.log.push({ role: role, text: text, time: new Date().toTimeString().slice(0, 5) });
      save();
    },
    clearCoach: function () { load().coach.log = []; save(); },

    /* ---- 设置 ---- */
    settings: function () { return load().settings; },
    setSetting: function (k, v) { load().settings[k] = v; save(); },

    /* ---- 教师 ---- */
    teacher: function () { return load().teacher; },
    classes: function () { return load().teacher.classes; },
    classById: function (id) { return load().teacher.classes.find(function (c) { return c.id === id; }); },
    bank: function () { return load().teacher.bank; },
    addTeacherTask: function (classId, task) {
      var cls = load().teacher.classes.find(function (c) { return c.id === classId; });
      cls.tasks.push(Object.assign({ id: 'ct-' + Date.now(), submitted: 0 }, task));
      save();
    },
    gradeReview: function (id, score, comment) {
      var cls = load().teacher.classes[0];
      var r = cls.reviews.find(function (x) { return x.id === id; });
      if (r) { r.status = '已评阅'; r.score = score; r.comment = comment; }
      save();
    },

    /* ---- 周报/报告 ---- */
    weekly: function () {
      var st = load().student;
      return {
        range: '10月19日 — 10月25日',
        minutes: st.minutesWeek.reduce(function (a, b) { return a + b; }, 0),
        target: 30,
        week: st.minutesWeek,
        streak: st.streak,
        books: st.shelf.reading.map(function (r) { return { id: r[0], pct: Store.progressOf(r[0]).pct }; }),
        ability: st.ability,
        days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      };
    }
  };

  // 惰性挂载书目（含封面）到 db，避免 seeds 变大
  load().books = BOOKS.map(function (b) {
    return Object.assign({}, b, { cover: coverSvg(b.title, b.author, b.coverPi) });
  });
  save();

  global.Store = Store;
})(window);
