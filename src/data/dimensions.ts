// The eight personality dimensions. Every vector in this app is ordered by DIM_IDS.
export const DIM_IDS = [
  "decisive",
  "empathy",
  "create",
  "insight",
  "express",
  "manage",
  "independent",
  "duty",
] as const;

export type DimId = (typeof DIM_IDS)[number];
export type Vec = readonly number[];

export interface Dimension {
  id: DimId;
  /** Short Chinese label shown on bars and the radar chart */
  name: string;
  /** Archetype name used when this dimension is the user's strongest */
  archetype: string;
  motto: string;
  /** Shared-trait text when user and figure are both strong here */
  strength: string;
  portrait: string;
  reality: string;
  blind: string;
  advice: string;
  /** Suggestion when this is the user's weakest dimension */
  grow: string;
}

export const DIMENSIONS: Record<DimId, Dimension> = {
  decisive: {
    id: "decisive",
    name: "决断",
    archetype: "掌舵者",
    motto: "局面越乱，越要有人先定方向。",
    strength: "面对不确定，你们都能很快收拢信息、抓住主线，并愿意为决定负责。",
    portrait:
      "你身上有一种“先把船稳住”的本能。别人还在争论时，你心里已经排好了先后次序。你不怕做决定，更怕迟迟不做决定带来的消耗。",
    reality: "在团队里，你常常是那个被大家看向、等着拍板的人。",
    blind: "节奏太快时，容易把“我想清楚了”当成“大家都想清楚了”。",
    advice: "拍板之前，留五分钟给最可能反对你的人。",
    grow: "试着在小事上更快做决定，给自己设一条“想到这里就够了”的截止线。",
  },
  empathy: {
    id: "empathy",
    name: "共情",
    archetype: "织网者",
    motto: "人心安定，事情才会顺。",
    strength: "你们都能读懂话语背后的处境，把人与人的关系当成局面的一部分来照料。",
    portrait:
      "你很容易察觉一个房间里谁不自在、谁话里有话。你相信多数冲突不是道理之争，而是有人没有被听见。所以你常常先去听，再去说。",
    reality: "朋友有心事时，第一个想到的往往是你。",
    blind: "太照顾别人的感受，可能把自己的需要一再往后放。",
    advice: "体谅别人的同时，也把自己的边界说出口——这同样是一种体贴。",
    grow: "做决定时多问一句“这会让谁难受”，你会看见之前忽略的代价。",
  },
  create: {
    id: "create",
    name: "开创",
    archetype: "拓荒者",
    motto: "没有路的地方，正好走第一步。",
    strength: "旧办法走不通时，你们都敢另起一行，把“没人做过”当成邀请而不是警告。",
    portrait:
      "你对“向来如此”天生有点不服气。新的地方、新的做法、新的组合，总能让你兴奋起来。你愿意为试错付学费，因为地图就是这样画出来的。",
    reality: "面对新项目，你通常是第一个说“可以试试”的人。",
    blind: "开头的热情很足，收尾和维护的耐心可能不够。",
    advice: "每次出发前，先定好“做到什么程度算成”和“什么情况就停”。",
    grow: "偶尔换一条从没走过的路，哪怕只是换个方法做一件老事。",
  },
  insight: {
    id: "insight",
    name: "洞察",
    archetype: "观局者",
    motto: "先看清楚，再动手。",
    strength: "你们都习惯透过表象看规律，把眼前的事放进更长的时间里衡量。",
    portrait:
      "你不太容易被热闹带着走。别人看到一件事，你会去想它为什么发生、接下来会怎样。你相信多数错误在动手之前就已经埋下了。",
    reality: "遇到复杂问题，大家喜欢找你“帮忙理一理”。",
    blind: "想得太周全，可能错过需要当机立断的窗口。",
    advice: "信息够用七成时，就允许自己行动，剩下的边走边看。",
    grow: "做判断前先问自己“我有什么证据”，再问“有没有反例”。",
  },
  express: {
    id: "express",
    name: "表达",
    archetype: "执笔者",
    motto: "说清楚，本身就是一种力量。",
    strength: "你们都擅长把模糊的感受和想法变成清晰的语言，让人听懂、记住、被打动。",
    portrait:
      "文字、言语、作品——你总需要一个出口来安放心里的东西。你相信一个想法如果没有被好好说出来，就像从来没有存在过。",
    reality: "需要有人发言、写稿、把复杂的事讲明白时，大家会推你出来。",
    blind: "太在意表达得漂亮，可能让人觉得锋芒外露，或说得比做得多。",
    advice: "把最好的表达留给最重要的事，让行动替你说一部分话。",
    grow: "每天花几分钟把一个想法写下来，越短越好。",
  },
  manage: {
    id: "manage",
    name: "经营",
    archetype: "筑基者",
    motto: "好东西要能长久地运转下去。",
    strength: "你们都看得见资源怎样组合、怎样流动，擅长把想法变成能持续运行的安排。",
    portrait:
      "你对“能不能落地”格外敏感。一个计划再漂亮，你也会追问钱从哪来、人怎么分、出了岔子谁兜底。你信的是日积月累，而不是运气。",
    reality: "你常常是把一盘散沙组织起来的那个人。",
    blind: "太看重投入产出，可能忽略那些算不清但很重要的东西。",
    advice: "账要算清，但给少数人和事留一份“不计回报”。",
    grow: "试着为一件小事做一份完整的计划：目标、步骤、预算、复盘。",
  },
  independent: {
    id: "independent",
    name: "独立",
    archetype: "独行者",
    motto: "热闹不等于值得。",
    strength: "你们都有一套不轻易被外界带走的内在坐标，敢于和大多数人不一样。",
    portrait:
      "你很在意精神上的自由。别人的评价会听，但不会照单全收。你宁可慢一点、孤单一点，也不愿活成别人期待的样子。",
    reality: "你不容易被集体情绪裹挟，常常是人群里清醒的那一个。",
    blind: "太快抽身，可能让本该深入的合作和关系一起变浅。",
    advice: "守住边界，但别把所有的妥协都看成对自己的背叛。",
    grow: "下次随大流之前停一下，问问自己真正的想法是什么。",
  },
  duty: {
    id: "duty",
    name: "担当",
    archetype: "守城者",
    motto: "答应过的事，就要有回音。",
    strength: "越到关键时刻，你们越愿意站出来，把责任接到自己手上。",
    portrait:
      "你把承诺看得很重。局面越难，你越不愿走开。你身上那种“我来”的笃定，常常是身边人最大的底气。",
    reality: "别人遇到真正的难事时，往往第一个想到你。",
    blind: "习惯了扛，就容易忘记求助，也会把不属于你的担子背上身。",
    advice: "担当不是无限透支，让信得过的人也有机会帮你。",
    grow: "从一件小事开始，主动说“这件事我负责”，然后把它做完。",
  },
};

export const dimByIndex = (i: number): Dimension => DIMENSIONS[DIM_IDS[i]];
