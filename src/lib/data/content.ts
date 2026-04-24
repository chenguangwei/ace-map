import { routing } from '@/i18n/routing';

export type AppLocale = (typeof routing.locales)[number];

interface LocalizedValue<T> {
	en: T;
	zh: T;
	ja: T;
}

interface BlogSectionDef {
	heading: string;
	paragraphs: string[];
	bullets?: string[];
}

interface BlogPostDef {
	slug: string;
	category: string;
	categoryLabel: LocalizedValue<string>;
	title: LocalizedValue<string>;
	description: LocalizedValue<string>;
	seoTitle: LocalizedValue<string>;
	seoDescription: LocalizedValue<string>;
	keywords: LocalizedValue<string[]>;
	intro: LocalizedValue<string>;
	takeaways: LocalizedValue<string[]>;
	sections: LocalizedValue<BlogSectionDef[]>;
	relatedQuizSlugs: string[];
	relatedPostSlugs: string[];
	featured: boolean;
	publishedAt: string;
	updatedAt: string;
	readingTimeMinutes: number;
}

interface SiteFaqItemDef {
	question: LocalizedValue<string>;
	answer: LocalizedValue<string>;
}

interface SiteFaqGroupDef {
	id: string;
	title: LocalizedValue<string>;
	description: LocalizedValue<string>;
	items: SiteFaqItemDef[];
}

interface LearningPathDef {
	id: string;
	title: LocalizedValue<string>;
	description: LocalizedValue<string>;
	steps: LocalizedValue<string[]>;
	quizSlugs: string[];
	guideSlug: string;
}

export interface BlogSection {
	heading: string;
	paragraphs: string[];
	bullets?: string[];
}

export interface BlogPost {
	slug: string;
	category: string;
	categoryLabel: string;
	title: string;
	description: string;
	seoTitle: string;
	seoDescription: string;
	keywords: string[];
	intro: string;
	takeaways: string[];
	sections: BlogSection[];
	relatedQuizSlugs: string[];
	relatedPostSlugs: string[];
	featured: boolean;
	publishedAt: string;
	updatedAt: string;
	readingTimeMinutes: number;
}

export interface SiteFaqItem {
	question: string;
	answer: string;
}

export interface SiteFaqGroup {
	id: string;
	title: string;
	description: string;
	items: SiteFaqItem[];
}

export interface LearningPath {
	id: string;
	title: string;
	description: string;
	steps: string[];
	quizSlugs: string[];
	guideSlug: string;
}

const pick = <T>(value: LocalizedValue<T>, locale: AppLocale) => value[locale];

const BLOG_POST_DEFS: BlogPostDef[] = [
	{
		slug: 'world-map-quiz-tips',
		category: 'study-tips',
		categoryLabel: {
			en: 'Study Tips',
			zh: '学习技巧',
			ja: '学習のコツ'
		},
		title: {
			en: 'How to Get Better at a World Map Quiz',
			zh: '如何更快提高世界地图测验成绩',
			ja: '世界地図クイズを上達させる方法'
		},
		description: {
			en: 'A practical approach to improving world map quiz accuracy with continent chunking, replay loops, and mistake review.',
			zh: '用分洲记忆、短回合重玩和错题复盘，更稳定地提高世界地图测验正确率。',
			ja: '大陸ごとの分割、短い反復、ミス復習を使って世界地図クイズの正答率を上げる実践ガイドです。'
		},
		seoTitle: {
			en: 'How to Get Better at a World Map Quiz | MapQuiz.pro Blog',
			zh: '如何提高世界地图测验成绩 | MapQuiz.pro 博客',
			ja: '世界地図クイズを上達させる方法 | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'Learn a repeatable method for improving at world map quizzes with continent drills, replay strategy, and focused correction.',
			zh: '了解一套可重复使用的世界地图测验训练方法，包括分洲练习、重玩节奏和聚焦纠错。',
			ja: '大陸別ドリル、反復の組み立て、ミス修正を組み合わせた世界地図クイズ上達法を紹介します。'
		},
		keywords: {
			en: ['world map quiz tips', 'how to learn countries on a map', 'geography quiz practice'],
			zh: ['世界地图测验技巧', '如何记国家地图', '地理测验练习'],
			ja: ['世界地図クイズ コツ', '国の位置 覚え方', '地理クイズ 練習']
		},
		intro: {
			en: 'Most players do not need more map facts. They need a tighter practice loop. The fastest gains usually come from smaller batches, immediate correction, and a second run before the first one fades.',
			zh: '大多数玩家缺的不是更多地理知识，而是更紧凑的训练循环。提升最快的做法通常是更小的题量、即时纠错，以及在记忆变淡之前再来一轮。',
			ja: '多くの人に必要なのは知識量の追加ではなく、練習ループの最適化です。小さな単位で回し、すぐに修正し、記憶が薄れる前にもう一度やる方が伸びます。'
		},
		takeaways: {
			en: [
				'Start with one continent before mixing the full world set.',
				'Review misses immediately while the map context is still fresh.',
				'Use the full world quiz after smaller drills begin to feel stable.'
			],
			zh: [
				'先按一个大洲练，再回到完整世界题库。',
				'在地图印象还新鲜时立即复盘错题。',
				'当分洲练习稳定后，再回到完整世界测验。'
			],
			ja: [
				'まずは1つの大陸から始めて、安定してから世界全体に戻す。',
				'地図の印象が残っているうちにミスを見直す。',
				'部分練習が安定したら世界全体クイズで統合する。'
			]
		},
		sections: {
			en: [
				{
					heading: 'Break the world into workable chunks',
					paragraphs: [
						'A full world map quiz feels hard because the answer pool is wide. Shrinking that pool makes the signal cleaner and helps you notice genuine weak spots.',
						'Use continent quizzes to build regional confidence first. Once Asia, Europe, or the Americas stop feeling noisy, the world quiz becomes less about panic and more about recall.'
					],
					bullets: [
						'Use continent drills as your entry point.',
						'Keep each session short enough to stay attentive.',
						'Return to the world map after two or three focused runs.'
					]
				},
				{
					heading: 'Treat every wrong answer as a location pair',
					paragraphs: [
						'Wrong answers are useful when you compare what you picked with the correct target. That contrast is where map memory usually gets stronger.',
						'Instead of only noting the correct country name, note the neighbor or coastline pattern that caused the confusion.'
					]
				},
				{
					heading: 'Replay before switching topics',
					paragraphs: [
						'The first replay is often the most valuable one. It lets you test whether the correction actually stuck.',
						'Map quiz progress is less about marathon sessions and more about timely second runs.'
					]
				}
			],
			zh: [
				{
					heading: '先把世界拆成更容易处理的块',
					paragraphs: [
						'完整的世界地图测验之所以难，核心在于备选范围太大。先缩小范围，才能更快看出真正薄弱的区域。',
						'先用大洲测验建立区域感。等亚洲、欧洲或美洲不再混乱时，再回到世界测验，压力会小很多。'
					],
					bullets: [
						'先从大洲专项开始。',
						'每轮时间保持短而集中。',
						'做完两三轮局部训练后再回到世界地图。'
					]
				},
				{
					heading: '把每个错误都当成一组位置对照',
					paragraphs: [
						'真正有价值的不是记住自己错了，而是比较“你点了哪里”和“正确答案在哪里”。地图记忆往往就在这一步增强。',
						'除了国家名，还要记住让你混淆的邻国、海岸线或区域形状。'
					]
				},
				{
					heading: '不要太快切题，先立刻重玩一次',
					paragraphs: [
						'第一轮重玩通常最值钱，因为它能立刻验证刚才的纠错有没有真正留下来。',
						'地图测验提升靠的不是超长时长，而是恰到好处的第二次练习。'
					]
				}
			],
			ja: [
				{
					heading: '世界全体を小さな単位に分ける',
					paragraphs: [
						'世界地図クイズが難しいのは、選択肢の広さです。範囲を絞ると判断材料が増え、本当に弱い場所が見えやすくなります。',
						'まずは大陸別クイズで地域感覚を固めると、世界全体に戻ったときの負荷がかなり下がります。'
					],
					bullets: [
						'入口は大陸別ドリルにする。',
						'集中が切れない短いセッションで回す。',
						'2〜3回の部分練習後に世界全体へ戻る。'
					]
				},
				{
					heading: 'ミスは位置の対比として覚える',
					paragraphs: [
						'大事なのは間違えた事実より、どこを押したかと正解がどこだったかの差です。その対比が地図記憶を強くします。',
						'国名だけでなく、隣接国や海岸線の形まで合わせて残すと次の正答率が上がります。'
					]
				},
				{
					heading: 'トピックを変える前にもう一度やる',
					paragraphs: [
						'最初の再挑戦は価値が高く、修正が定着したかをすぐ確認できます。',
						'上達は長時間プレイより、適切なタイミングでの再実行で作られます。'
					]
				}
			]
		},
		relatedQuizSlugs: ['world-map-quiz', 'asia-countries-quiz', 'europe-countries-quiz'],
		relatedPostSlugs: ['memorize-countries-by-continent', 'geography-quiz-practice-routine'],
		featured: true,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 4
	},
	{
		slug: 'memorize-countries-by-continent',
		category: 'memory-training',
		categoryLabel: {
			en: 'Memory Training',
			zh: '记忆训练',
			ja: '記憶トレーニング'
		},
		title: {
			en: 'A Better Way to Memorize Countries by Continent',
			zh: '按大洲记国家，更有效的一种方法',
			ja: '大陸ごとに国を覚えるための現実的な方法'
		},
		description: {
			en: 'Why continent-first practice helps map recall and how to turn that structure into repeatable geography study.',
			zh: '为什么先按大洲练更容易建立地图记忆，以及怎样把它变成可重复的地理学习流程。',
			ja: 'なぜ大陸単位の練習が地図記憶に効くのか、そしてそれを反復できる学習手順にする方法です。'
		},
		seoTitle: {
			en: 'How to Memorize Countries by Continent | MapQuiz.pro Blog',
			zh: '如何按大洲记忆国家 | MapQuiz.pro 博客',
			ja: '大陸ごとに国を覚える方法 | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'Use continent-focused map quizzes to build country recall faster and avoid overwhelming full-world study sessions.',
			zh: '通过大洲聚焦的地图测验更快建立国家记忆，避免一开始就被完整世界题库压住。',
			ja: '大陸別の地図クイズを使って国の位置記憶を速く作り、最初から世界全体に圧倒されるのを避けます。'
		},
		keywords: {
			en: ['memorize countries by continent', 'continent map quiz', 'learn countries geography'],
			zh: ['按大洲记国家', '大洲地图测验', '学习国家地理'],
			ja: ['大陸ごとに国を覚える', '大陸地図クイズ', '国の地理を学ぶ']
		},
		intro: {
			en: 'Country memorization gets messy when everything arrives at once. Continent-first practice reduces noise and gives each run a clearer mental frame.',
			zh: '当所有国家同时出现时，记忆很容易变乱。先按大洲练，可以减少噪音，让每一轮练习都有更清晰的地图框架。',
			ja: '国を一度に全部覚えようとすると混乱しやすくなります。大陸ごとに区切ると、各セッションの地図フレームが明確になります。'
		},
		takeaways: {
			en: [
				'Continent boundaries give your memory a usable structure.',
				'Repeated continent runs are easier to sustain than full-world marathons.',
				'Once one continent is stable, mix in another instead of jumping straight to everything.'
			],
			zh: [
				'大洲边界会给记忆一个可用的结构。',
				'分洲重玩比完整世界长时间硬背更容易坚持。',
				'一个大洲稳定后，再叠加下一个，而不是直接全开。'
			],
			ja: [
				'大陸という枠が記憶の土台になる。',
				'大陸単位の反復は世界全体より継続しやすい。',
				'1つ安定したら次を足し、いきなり全部にしない。'
			]
		},
		sections: {
			en: [
				{
					heading: 'Why continents are the right unit',
					paragraphs: [
						'Continents are large enough to feel meaningful and small enough to repeat quickly. That balance matters in geography practice.',
						'They also give each country a context. A country is easier to place when you already expect its nearby coastline, neighbors, and general shape.'
					]
				},
				{
					heading: 'Build from one stable region at a time',
					paragraphs: [
						'Pick one continent and run it until the obvious confusion starts to fade. Then use a different continent as a second layer rather than mixing the full world immediately.',
						'This keeps your success rate high enough to stay motivated while still exposing the weak spots you need to clean up.'
					],
					bullets: [
						'Asia and Europe are good for density and contrast.',
						'Americas works well for north-to-south mental mapping.',
						'Oceania is a useful small set for quick confidence.'
					]
				},
				{
					heading: 'Use the world quiz as an integration test',
					paragraphs: [
						'The world quiz is strongest when it checks whether your smaller drills transferred. That makes it a confirmation layer, not the first layer.',
						'If your world performance drops sharply, go back to the continent where the misses cluster.'
					]
				}
			],
			zh: [
				{
					heading: '为什么大洲是合适的记忆单位',
					paragraphs: [
						'大洲足够大，能形成明确主题；又足够小，能快速重玩。这个平衡对地理练习很重要。',
						'同时，大洲也给每个国家提供了上下文。你先熟悉邻国、海岸线和大致轮廓后，国家就更容易定位。'
					]
				},
				{
					heading: '一次先练稳一个区域',
					paragraphs: [
						'选一个大洲反复练，直到主要混淆明显减少，再把下一个大洲加进来，而不是马上切回整个世界。',
						'这样既能维持足够高的成就感，也能稳定暴露出真正需要修正的问题。'
					],
					bullets: [
						'亚洲和欧洲适合训练高密度辨认。',
						'美洲适合建立从北到南的地图序列感。',
						'大洋洲适合快速建立信心。'
					]
				},
				{
					heading: '把世界测验当成整合测试',
					paragraphs: [
						'世界测验最适合验证分洲训练有没有迁移成功，所以它更像整合层，而不是第一层。',
						'如果世界测验掉得很明显，就回到错误最集中的那个大洲。'
					]
				}
			],
			ja: [
				{
					heading: 'なぜ大陸単位が覚えやすいのか',
					paragraphs: [
						'大陸は意味のあるまとまりでありながら、短時間で繰り返せるサイズでもあります。このバランスが重要です。',
						'また、各国に文脈が生まれます。海岸線や近隣国を先に持っていると、国の位置を置きやすくなります。'
					]
				},
				{
					heading: '一度に一つの地域を安定させる',
					paragraphs: [
						'まず1つの大陸を繰り返し、主要な混乱が薄れてから次を追加します。いきなり世界全体に戻す必要はありません。',
						'正答率を維持しながら弱点も見えるので、継続しやすい形になります。'
					],
					bullets: [
						'アジアとヨーロッパは高密度の識別に向く。',
						'南北の流れを作るならアメリカ大陸が扱いやすい。',
						'オセアニアは短い成功体験を作りやすい。'
					]
				},
				{
					heading: '世界クイズは統合テストとして使う',
					paragraphs: [
						'世界クイズは、部分練習が転移したかを確かめる場として使うのが効果的です。',
						'成績が急に落ちるなら、ミスが固まっている大陸に戻って調整します。'
					]
				}
			]
		},
		relatedQuizSlugs: ['asia-countries-quiz', 'europe-countries-quiz', 'americas-countries-quiz', 'world-map-quiz'],
		relatedPostSlugs: ['world-map-quiz-tips', 'geography-quiz-practice-routine'],
		featured: true,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 4
	},
	{
		slug: 'geography-quiz-practice-routine',
		category: 'practice-routine',
		categoryLabel: {
			en: 'Practice Routine',
			zh: '练习流程',
			ja: '練習ルーティン'
		},
		title: {
			en: 'A 15-Minute Geography Quiz Practice Routine That Actually Sticks',
			zh: '一个真正有效的 15 分钟地理测验练习流程',
			ja: '定着しやすい15分の地理クイズ練習ルーティン'
		},
		description: {
			en: 'A short geography study loop built around playable map quizzes, not passive review.',
			zh: '围绕可玩的地图测验，而不是被动翻看资料，设计的一套 15 分钟短练流程。',
			ja: '受け身の暗記ではなく、実際に遊べる地図クイズを中心に組んだ15分練習ルーティンです。'
		},
		seoTitle: {
			en: '15-Minute Geography Quiz Practice Routine | MapQuiz.pro Blog',
			zh: '15 分钟地理测验练习流程 | MapQuiz.pro 博客',
			ja: '15分の地理クイズ練習ルーティン | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'Use a short but structured map quiz routine to improve geography recall without long, unfocused study blocks.',
			zh: '用一套短而有结构的地图测验流程提升地理记忆，不必依赖冗长且分散的学习时间。',
			ja: '長く散漫な勉強時間ではなく、短く構造化された地図クイズの流れで地理記憶を高めます。'
		},
		keywords: {
			en: ['geography quiz routine', '15 minute map quiz practice', 'study geography with games'],
			zh: ['地理测验练习流程', '15分钟地图练习', '用游戏学地理'],
			ja: ['地理クイズ ルーティン', '15分 地図練習', 'ゲームで地理を学ぶ']
		},
		intro: {
			en: 'You do not need long sessions to improve geography recall. You need a repeatable sequence with a clear starting point, a live quiz, and a quick review loop.',
			zh: '提升地理记忆不一定需要很长的学习时长，更需要的是一个可重复执行的顺序：明确起点、真实作答、快速复盘。',
			ja: '地理記憶の向上に長時間は必須ではありません。必要なのは、開始点と実戦、短い見直しがそろった反復可能な流れです。'
		},
		takeaways: {
			en: [
				'Warm up with a narrow topic before doing a broader quiz.',
				'Keep one slot for reviewing misses while they are still vivid.',
				'End with one next step so the following session starts fast.'
			],
			zh: [
				'先用窄主题热身，再做更宽的测验。',
				'留一个环节专门回看刚刚的错误。',
				'结束前确定下一步，方便下一次快速开始。'
			],
			ja: [
				'狭いテーマでウォームアップしてから広いクイズに行く。',
				'ミスが新しいうちに見直す枠を必ず残す。',
				'次回の最初の一手を決めて終える。'
			]
		},
		sections: {
			en: [
				{
					heading: 'Minute 1 to 5: use a narrow warmup',
					paragraphs: [
						'Start with a continent quiz, a capitals set, or a country drill that you already know fairly well. The goal is to wake up map recall, not to fail immediately.',
						'A stable warmup makes the second half of the routine more productive because your brain is already in map-reading mode.'
					]
				},
				{
					heading: 'Minute 6 to 11: run the harder set',
					paragraphs: [
						'Now move into the broader or harder topic. This could be the world map quiz, a denser continent, or a landmarks set that still feels fuzzy.',
						'Because you already warmed up, you get more meaningful signal from this harder run.'
					]
				},
				{
					heading: 'Minute 12 to 15: review and set the next entry point',
					paragraphs: [
						'Finish by reviewing recent misses or replaying the same set once. Then decide which topic should start the next session.',
						'This small handoff removes friction and makes consistency easier.'
					]
				}
			],
			zh: [
				{
					heading: '第 1 到 5 分钟：先做一个窄主题热身',
					paragraphs: [
						'先从一个你已经有点把握的大洲测验、首府题组或国家专项开始，目的不是马上挑战极限，而是把地图感先唤醒。',
						'热身稳定后，后半段的难题会更有效，因为你的大脑已经进入地图识别状态。'
					]
				},
				{
					heading: '第 6 到 11 分钟：进入更难的题组',
					paragraphs: [
						'然后切到更宽或更难的主题，比如世界地图测验、题量更密的大洲，或仍然模糊的地标题组。',
						'前面已经热身过，这一轮得到的反馈会更有价值。'
					]
				},
				{
					heading: '第 12 到 15 分钟：复盘并设定下次入口',
					paragraphs: [
						'最后用来复盘最近的错误，或者马上再刷同一组一次。结束前再确定下一次从哪个主题开始。',
						'这个小动作能明显降低下一次开始时的阻力。'
					]
				}
			],
			ja: [
				{
					heading: '1〜5分: 狭いテーマでウォームアップ',
					paragraphs: [
						'最初は大陸別、首都セット、あるいは少し得意な国別ドリルから始めます。目的は失敗することではなく、地図感覚を起こすことです。',
						'この準備があると後半の難しいセットから得られる学習効果が大きくなります。'
					]
				},
				{
					heading: '6〜11分: 少し難しいセットへ移る',
					paragraphs: [
						'次に、世界地図クイズや密度の高い大陸、まだ曖昧なランドマークセットに進みます。',
						'すでに頭が地図モードに入っているので、ここでのミスはより意味のあるフィードバックになります。'
					]
				},
				{
					heading: '12〜15分: 見直しと次回の入口決め',
					paragraphs: [
						'最後は最近のミスを確認するか、同じセットをもう一度だけ回します。そのうえで次回の開始トピックを決めます。',
						'この小さな準備で継続しやすさがかなり変わります。'
					]
				}
			]
		},
		relatedQuizSlugs: ['world-map-quiz', 'japan-map-quiz', 'germany-map-quiz'],
		relatedPostSlugs: ['world-map-quiz-tips', 'study-capitals-with-map-games'],
		featured: true,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 5
	},
	{
		slug: 'study-capitals-with-map-games',
		category: 'capitals-practice',
		categoryLabel: {
			en: 'Capitals Practice',
			zh: '首府练习',
			ja: '首都・州都練習'
		},
		title: {
			en: 'How Map Games Make Capitals Practice Easier to Keep',
			zh: '为什么地图游戏更适合练首府记忆',
			ja: '地図ゲームが首都や州都の練習に向いている理由'
		},
		description: {
			en: 'Capitals practice works better when each city stays attached to a place on the map, not just a list in your notes.',
			zh: '首府记忆更容易稳定下来，是因为城市始终和地图上的位置绑定，而不只是停留在列表里。',
			ja: '首都や州都の練習は、都市名を一覧として覚えるより、地図上の位置と結び付けた方が定着しやすくなります。'
		},
		seoTitle: {
			en: 'How to Study Capitals with Map Games | MapQuiz.pro Blog',
			zh: '如何用地图游戏练首府 | MapQuiz.pro 博客',
			ja: '地図ゲームで首都や州都を学ぶ方法 | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'Use interactive map play to learn capitals and administrative centers with stronger spatial recall.',
			zh: '通过互动地图玩法学习首府和行政中心，建立更强的空间记忆。',
			ja: 'インタラクティブな地図プレイを使って、首都や行政中心を空間記憶とともに学びます。'
		},
		keywords: {
			en: ['capitals map quiz', 'learn capitals with map games', 'prefecture capitals quiz'],
			zh: ['首府地图测验', '用地图游戏记首府', '都道府县首府测验'],
			ja: ['州都 地図クイズ', '地図ゲームで首都を覚える', '県庁所在地 クイズ']
		},
		intro: {
			en: 'Capitals are easy to confuse when they live only in a text list. Map games turn each answer into a position, which gives your memory a much stronger anchor.',
			zh: '当首府只存在于文字列表里时，很容易混淆。地图游戏会把每个答案变成一个位置，这会给记忆更强的锚点。',
			ja: '首都や州都が文字リストだけにあると混同しやすくなります。地図ゲームでは各答えが位置として残るため、記憶の固定点が増えます。'
		},
		takeaways: {
			en: [
				'Study the map relationship, not only the name pair.',
				'Repeat nearby capitals until they stop collapsing into one another.',
				'Use region quizzes before broader city or landmark sets.'
			],
			zh: [
				'不仅记名称配对，也要记地图关系。',
				'把容易互相混淆的邻近首府反复练到分开。',
				'先做区域题，再扩展到城市或地标题组。'
			],
			ja: [
				'名称の組み合わせだけでなく位置関係も覚える。',
				'近接して混ざりやすい州都は反復で切り分ける。',
				'広い都市セットの前に地域クイズを入れる。'
			]
		},
		sections: {
			en: [
				{
					heading: 'Attach each capital to a visible map frame',
					paragraphs: [
						'When you answer on a map, you are not only memorizing a city name. You are attaching that city to the country, region, coastline, and neighboring places around it.',
						'That extra frame makes recall more resilient than pure list memorization.'
					]
				},
				{
					heading: 'Use capitals after region recognition is decent',
					paragraphs: [
						'Capitals practice is much easier after you can already separate the regions or prefectures themselves. Otherwise you are trying to learn two layers at once.',
						'For most players, regions first and capitals second is the cleaner order.'
					]
				},
				{
					heading: 'Lean on immediate correction for close pairs',
					paragraphs: [
						'Nearby capitals and administrative centers are where confusion survives. Immediate correction matters most there because your comparison is still vivid.',
						'That is why replayable map games are strong for capitals practice.'
					]
				}
			],
			zh: [
				{
					heading: '让每个首府都挂在清晰的地图框架上',
					paragraphs: [
						'在地图上作答时，你记住的不只是城市名，而是它所在的国家、区域、海岸线和周边位置。',
						'这种附着在空间框架上的记忆，比单纯背列表更稳。'
					]
				},
				{
					heading: '先把区域识别练顺，再上首府',
					paragraphs: [
						'如果你连州、省、都道府县本身还没分清，直接练首府往往会变成同时记两层内容。',
						'对大多数人来说，先区域、后首府，是更顺的顺序。'
					]
				},
				{
					heading: '邻近首府最需要即时纠错',
					paragraphs: [
						'真正容易混淆的，往往是彼此很近的首府或行政中心。因为对比还留在脑子里，所以即时纠错特别有效。',
						'这也是可重玩的地图游戏很适合首府训练的原因。'
					]
				}
			],
			ja: [
				{
					heading: '各州都・県庁所在地を地図の枠に乗せる',
					paragraphs: [
						'地図上で答えると、都市名だけでなく、その周辺の地域や海岸線、近隣位置まで一緒に残ります。',
						'この空間的な枠組みが、単なる一覧暗記より強い記憶になります。'
					]
				},
				{
					heading: '先に地域認識を安定させる',
					paragraphs: [
						'都道府県や州そのものの区別がまだ曖昧だと、州都練習は二層同時学習になって負荷が上がります。',
						'多くの場合は地域認識を先に固め、その後に州都へ進む方が整理しやすいです。'
					]
				},
				{
					heading: '近い都市ほど即時修正が効く',
					paragraphs: [
						'混同が残りやすいのは近接する州都や行政中心です。比較が新しいうちの修正が最も効果を持ちます。',
						'反復しやすい地図ゲームが州都練習に向く理由はここにあります。'
					]
				}
			]
		},
		relatedQuizSlugs: ['japan-capitals-quiz', 'germany-state-capitals-quiz', 'canada-provinces-quiz'],
		relatedPostSlugs: ['geography-quiz-practice-routine', 'country-quiz-vs-landmark-quiz'],
		featured: false,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 4
	},
	{
		slug: 'country-quiz-vs-landmark-quiz',
		category: 'quiz-types',
		categoryLabel: {
			en: 'Quiz Types',
			zh: '测验类型',
			ja: 'クイズ形式'
		},
		title: {
			en: 'Country Quiz vs Landmark Quiz: Which One Should You Practice First?',
			zh: '国家测验和地标测验，应该先练哪一个？',
			ja: '国クイズとランドマーククイズはどちらを先に練習すべきか'
		},
		description: {
			en: 'Country quizzes and landmark quizzes train different layers of geography. This guide helps you choose the right order.',
			zh: '国家测验和地标测验训练的是不同层级的地理认知，这篇文章帮你判断先后顺序。',
			ja: '国クイズとランドマーククイズは鍛える地理レイヤーが異なります。どちらから始めるべきかを整理します。'
		},
		seoTitle: {
			en: 'Country Quiz vs Landmark Quiz | MapQuiz.pro Blog',
			zh: '国家测验 vs 地标测验 | MapQuiz.pro 博客',
			ja: '国クイズとランドマーククイズの違い | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'Understand the difference between country-level geography quizzes and landmark map quizzes, and when to use each.',
			zh: '理解国家级地理测验与地标地图测验的区别，以及各自适合的练习时机。',
			ja: '国レベルの地理クイズとランドマーク地図クイズの違い、そして使い分け方を解説します。'
		},
		keywords: {
			en: ['country quiz vs landmark quiz', 'landmark map quiz', 'geography quiz types'],
			zh: ['国家测验和地标测验区别', '地标地图测验', '地理测验类型'],
			ja: ['国クイズ ランドマーククイズ 違い', 'ランドマーク地図クイズ', '地理クイズ 種類']
		},
		intro: {
			en: 'These quiz types look similar, but they solve different problems. One builds a political frame. The other fills that frame with recognizable places.',
			zh: '这两类测验看起来相似，但解决的问题不同。一类先建立政治地理框架，另一类则往这个框架里填入可辨认的地点。',
			ja: 'この二つは似て見えても役割が違います。一方は政治地理の枠を作り、もう一方はその枠の中に具体的な場所を入れていきます。'
		},
		takeaways: {
			en: [
				'Country quizzes build the frame; landmarks add texture.',
				'Most learners should do countries or regions before landmarks.',
				'Landmark quizzes are strongest when the base map already feels familiar.'
			],
			zh: [
				'国家测验先搭框架，地标测验再补细节。',
				'大多数人应先练国家或区域，再练地标。',
				'当地图底层已经熟悉时，地标测验效果最好。'
			],
			ja: [
				'国クイズは枠を作り、ランドマークは質感を足す。',
				'多くの学習者は国や地域を先にやるべき。',
				'ランドマークは土台の地図が入ってから最も効く。'
			]
		},
		sections: {
			en: [
				{
					heading: 'What country quizzes train',
					paragraphs: [
						'Country quizzes teach boundary awareness, regional grouping, and broad map orientation. They are usually the best first layer for new learners.',
						'That makes them useful for school geography, trivia prep, and any study routine that needs a strong mental frame.'
					]
				},
				{
					heading: 'What landmark quizzes add',
					paragraphs: [
						'Landmark quizzes shift from political units to memorable places. That is helpful for travel, culture, and place recognition, but it works best after the map frame exists.',
						'Without that frame, landmark memory can become isolated facts with weak transfer.'
					]
				},
				{
					heading: 'A practical order',
					paragraphs: [
						'For most players, the cleanest sequence is country or region quiz first, capitals second, landmarks third.',
						'That order moves from structure to detail and reduces confusion.'
					]
				}
			],
			zh: [
				{
					heading: '国家测验主要训练什么',
					paragraphs: [
						'国家测验训练的是边界感、区域归类和整体地图方向感。对初学者来说，它通常是最好的第一层。',
						'这使它很适合课堂地理、问答准备，以及任何需要强地图框架的学习流程。'
					]
				},
				{
					heading: '地标测验补上的是什么',
					paragraphs: [
						'地标测验会把重心从行政单元转向具体地点。它对旅行、文化和地点识别很有用，但通常要在框架已经建立后效果更好。',
						'如果没有底层框架，地标记忆容易变成孤立事实。'
					]
				},
				{
					heading: '更实用的顺序',
					paragraphs: [
						'对大多数玩家来说，更顺的顺序是：先国家或区域，再首府，最后地标。',
						'这个顺序是从结构走向细节，混淆会更少。'
					]
				}
			],
			ja: [
				{
					heading: '国クイズが鍛えるもの',
					paragraphs: [
						'国クイズは境界感覚、地域のまとまり、全体の地図方向感を作ります。初学者には最初の層として最も扱いやすいです。',
						'学校地理や雑学対策、基礎フレーム作りに向いています。'
					]
				},
				{
					heading: 'ランドマーククイズが足すもの',
					paragraphs: [
						'ランドマーククイズは行政単位より具体的な場所認識を強めます。旅行や文化寄りの学習には有効ですが、土台がある方が機能します。',
						'土台なしだと、点在する知識になりやすくなります。'
					]
				},
				{
					heading: '実用的な順番',
					paragraphs: [
						'多くの人にとっては、国や地域クイズ、次に州都や首都、最後にランドマークという順番が整理しやすいです。',
						'構造から細部へ進むので混乱が減ります。'
					]
				}
			]
		},
		relatedQuizSlugs: ['japan-map-quiz', 'japan-landmarks-quiz', 'france-landmarks-quiz'],
		relatedPostSlugs: ['study-capitals-with-map-games', 'geography-quiz-practice-routine'],
		featured: false,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 4
	},
	{
		slug: 'classroom-geography-quiz-warmups',
		category: 'classroom',
		categoryLabel: {
			en: 'Classroom Use',
			zh: '课堂应用',
			ja: '授業活用'
		},
		title: {
			en: 'Using Interactive Geography Quizzes as Classroom Warmups',
			zh: '把互动地理测验用作课堂热身',
			ja: 'インタラクティブ地理クイズを授業のウォームアップに使う'
		},
		description: {
			en: 'Short map quiz sessions can work as low-friction classroom warmups, review blocks, or end-of-lesson checks.',
			zh: '短时地图测验很适合用作低门槛课堂热身、复习环节或课尾检查。',
			ja: '短い地図クイズは、授業の導入、復習、終わりの確認に使いやすい形式です。'
		},
		seoTitle: {
			en: 'Classroom Geography Quiz Warmups | MapQuiz.pro Blog',
			zh: '课堂地理测验热身法 | MapQuiz.pro 博客',
			ja: '授業で使う地理クイズのウォームアップ活用 | MapQuiz.pro ブログ'
		},
		seoDescription: {
			en: 'See how interactive map quizzes can support geography classrooms with fast warmups and focused review.',
			zh: '了解互动地图测验如何支持课堂地理教学，包括快速热身和聚焦复习。',
			ja: 'インタラクティブな地図クイズを、授業導入や集中復習にどう使えるかを紹介します。'
		},
		keywords: {
			en: ['classroom geography quiz', 'interactive map quiz for students', 'geography warmup activity'],
			zh: ['课堂地理测验', '学生互动地图测验', '地理热身活动'],
			ja: ['授業 地理クイズ', '生徒向け地図クイズ', '地理ウォームアップ']
		},
		intro: {
			en: 'Interactive geography games are useful in class because they are short, visible, and easy to repeat. Teachers can use them as warmups without redesigning the whole lesson.',
			zh: '互动地理游戏适合课堂，是因为它短、直观、可重复。老师可以把它当作热身使用，而不用重做整节课设计。',
			ja: 'インタラクティブな地理ゲームが授業で使いやすいのは、短く、見やすく、繰り返しやすいからです。授業全体を組み替えなくても導入に使えます。'
		},
		takeaways: {
			en: [
				'Short quiz loops fit well at the start or end of a class.',
				'Focused topics make classroom review easier to manage.',
				'Replayable quizzes support visible correction without extra prep.'
			],
			zh: [
				'短回合测验很适合放在课前或课尾。',
				'聚焦主题更便于课堂复习管理。',
				'可重玩的测验能在不额外备课的情况下完成可视化纠错。'
			],
			ja: [
				'短いクイズは授業の最初や最後に収まりやすい。',
				'焦点の絞られたテーマは授業内復習に向く。',
				'反復できるので、準備を増やさずに修正まで見せやすい。'
			]
		},
		sections: {
			en: [
				{
					heading: 'Keep the scope narrow',
					paragraphs: [
						'Classroom warmups work best when the set is focused. A single continent, one country, or one subtopic is easier to run than a broad world challenge.',
						'That keeps the pace tight and the debrief simple.'
					]
				},
				{
					heading: 'Use the wrong answers as the discussion prompt',
					paragraphs: [
						'The strongest teaching moment is often the miss. It gives the class something concrete to compare and explain.',
						'Because the map shows the gap visually, the correction is easier to discuss than a worksheet-only miss.'
					]
				},
				{
					heading: 'Finish with a next-step quiz',
					paragraphs: [
						'If students finish a continent set well, move them to a related country quiz or capitals page next. The transition feels natural and keeps momentum.',
						'This also turns one activity into a broader practice sequence.'
					]
				}
			],
			zh: [
				{
					heading: '课堂热身的题组要尽量聚焦',
					paragraphs: [
						'课堂热身最好选择单一大洲、一个国家或一个子主题，而不是直接上完整世界挑战。',
						'这样节奏更紧，讲解也更清楚。'
					]
				},
				{
					heading: '把错误当作讨论入口',
					paragraphs: [
						'最有教学价值的往往不是答对，而是答错。因为错误给了全班一个可以具体比较和解释的点。',
						'地图能把偏差直观显示出来，比单纯工作纸更容易讲清楚。'
					]
				},
				{
					heading: '结尾给出下一步题组',
					paragraphs: [
						'如果学生在某个大洲题组里表现不错，下一步就可以接到相关国家测验或首府题页，过渡会非常自然。',
						'这样一来，一次活动就能顺着扩成一整条练习链。'
					]
				}
			],
			ja: [
				{
					heading: '授業導入では範囲を絞る',
					paragraphs: [
						'授業のウォームアップは、1つの大陸、1つの国、または1つのサブトピックに絞る方が回しやすいです。',
						'テンポが良くなり、振り返りも簡潔になります。'
					]
				},
				{
					heading: '間違いを対話の入口にする',
					paragraphs: [
						'最も説明しやすい瞬間はミスが出た時です。比較対象が明確で、クラス全体で共有しやすくなります。',
						'地図上に差が見えるので、紙だけの間違いより話しやすくなります。'
					]
				},
				{
					heading: '次のクイズへ自然につなげる',
					paragraphs: [
						'大陸セットが安定したら、関連する国別クイズや州都ページへ進めます。流れが切れません。',
						'1つの活動をより広い練習シーケンスに変えられます。'
					]
				}
			]
		},
		relatedQuizSlugs: ['asia-countries-quiz', 'world-map-quiz', 'japan-map-quiz'],
		relatedPostSlugs: ['geography-quiz-practice-routine', 'memorize-countries-by-continent'],
		featured: false,
		publishedAt: '2026-04-23',
		updatedAt: '2026-04-23',
		readingTimeMinutes: 4
	}
];

const SITE_FAQ_GROUP_DEFS: SiteFaqGroupDef[] = [
	{
		id: 'getting-started',
		title: {
			en: 'Getting Started',
			zh: '开始使用',
			ja: 'はじめ方'
		},
		description: {
			en: 'Core questions about how MapQuiz.pro works as a geography game and study tool.',
			zh: '关于 MapQuiz.pro 作为地理游戏和学习工具的基础问题。',
			ja: 'MapQuiz.pro を地理ゲーム兼学習ツールとして使うときの基本的な質問です。'
		},
		items: [
			{
				question: {
					en: 'What kind of geography game is MapQuiz.pro?',
					zh: 'MapQuiz.pro 是什么类型的地理游戏？',
					ja: 'MapQuiz.pro はどんな地理ゲームですか？'
				},
				answer: {
					en: 'It is an interactive map quiz site. You answer by selecting places on a map, then compare your guess with the correct location and continue into replayable topic pages.',
					zh: '它是一个互动地图测验网站。你需要在地图上选择地点，系统会展示你的猜测和正确位置，并可继续进入可重玩的主题页。',
					ja: 'インタラクティブな地図クイズサイトです。地図上で場所を選び、正解位置と比較しながら繰り返し練習できるトピックへ進めます。'
				}
			},
			{
				question: {
					en: 'Do I need an account to play the quizzes?',
					zh: '玩这些测验需要注册账号吗？',
					ja: 'プレイにアカウント登録は必要ですか？'
				},
				answer: {
					en: 'No. The core quiz flow is designed to be fast and low-friction, so you can start a map quiz without creating an account first.',
					zh: '不需要。核心测验流程是按低门槛、快速开始设计的，你可以直接进入地图测验。',
					ja: '不要です。コアのクイズ導線はすぐ始められるように作られているため、最初にアカウントを作る必要はありません。'
				}
			},
			{
				question: {
					en: 'Is this only for world geography?',
					zh: '这里只能练世界地理吗？',
					ja: '世界地理だけを扱っていますか？'
				},
				answer: {
					en: 'No. The site includes world quizzes, continent drills, country hubs, and focused pages for capitals, landmarks, and administrative regions.',
					zh: '不是。站点同时包含世界测验、大洲训练、国家中心页，以及首府、地标、行政区等聚焦题页。',
					ja: 'いいえ。世界クイズだけでなく、大陸別、国別、州都、ランドマーク、行政区などの集中ページもあります。'
				}
			}
		]
	},
	{
		id: 'study-and-memory',
		title: {
			en: 'Study and Memory',
			zh: '学习与记忆',
			ja: '学習と記憶'
		},
		description: {
			en: 'Questions about using quiz play for recall, review, and geography study structure.',
			zh: '关于如何把测验玩法用于记忆、复习和地理学习结构的问题。',
			ja: 'クイズプレイを記憶、復習、地理学習の構造にどう使うかに関する質問です。'
		},
		items: [
			{
				question: {
					en: 'Are map quizzes good for memorizing countries?',
					zh: '地图测验适合记国家吗？',
					ja: '地図クイズは国を覚えるのに向いていますか？'
				},
				answer: {
					en: 'Yes. They are especially useful when you want to connect names to shape, region, and position instead of memorizing a flat list.',
					zh: '适合。尤其当你希望把名称和形状、区域、位置联系起来时，地图测验比平面列表更有效。',
					ja: '向いています。名前を平面的な一覧ではなく、形や地域、位置と結び付けたい時に特に有効です。'
				}
			},
			{
				question: {
					en: 'Should I practice continents before the world map quiz?',
					zh: '应该先练大洲，再练世界地图测验吗？',
					ja: '世界地図クイズの前に大陸別を練習すべきですか？'
				},
				answer: {
					en: 'For most learners, yes. Continent drills reduce the answer pool and make it easier to build stable regional recall before mixing everything together.',
					zh: '对大多数学习者来说是的。大洲训练会缩小答案范围，更容易在混合全部国家之前先建立稳定的区域记忆。',
					ja: '多くの学習者にとってはその方が効果的です。大陸別ドリルは答えの範囲を絞り、地域記憶を安定させやすくします。'
				}
			},
			{
				question: {
					en: 'How often should I replay the same geography quiz?',
					zh: '同一个地理测验应该多久重玩一次？',
					ja: '同じ地理クイズはどれくらい再プレイすべきですか？'
				},
				answer: {
					en: 'A quick second run right after review is often the most useful. After that, revisit the same topic once the map details begin to fade.',
					zh: '在复盘后立刻再来一轮，通常最有效。之后等地图细节开始变淡时，再回到同一主题。',
					ja: '見直し直後の2回目が最も効果的なことが多いです。その後は地図の細部が薄れてきた頃に戻るとよいです。'
				}
			}
		]
	},
	{
		id: 'classroom-and-teaching',
		title: {
			en: 'Classroom and Teaching',
			zh: '课堂与教学',
			ja: '授業と指導'
		},
		description: {
			en: 'How teachers and students can use interactive quiz loops in a classroom setting.',
			zh: '老师和学生如何在课堂场景里使用互动测验循环。',
			ja: '教師と生徒が授業の中でインタラクティブなクイズをどう使えるかに関する内容です。'
		},
		items: [
			{
				question: {
					en: 'Can this be used for classroom geography warmups?',
					zh: '这个产品能用作课堂地理热身吗？',
					ja: '授業の地理ウォームアップに使えますか？'
				},
				answer: {
					en: 'Yes. Focused quizzes work well as short warmups because the class can answer quickly, compare misses, and move into the main lesson without much setup.',
					zh: '可以。聚焦型测验很适合短时热身，全班可以快速作答、对比错误，然后顺势进入正课，几乎不需要额外准备。',
					ja: '使えます。焦点の絞られたクイズは短い導入に向いており、素早く答えてミスを比較し、そのまま本題に入れます。'
				}
			},
			{
				question: {
					en: 'Which quiz pages work best for students?',
					zh: '哪些测验页最适合学生？',
					ja: '生徒にはどのクイズページが向いていますか？'
				},
				answer: {
					en: 'Students often do best with a clear sequence: continent pages first, then country pages, then capitals or landmarks once the base map is familiar.',
					zh: '学生通常更适合按顺序来：先大洲页，再国家页，等底层地图熟悉后再练首府或地标。',
					ja: '多くの生徒には、大陸ページ、次に国ページ、その後に州都やランドマークという順番が合っています。'
				}
			},
			{
				question: {
					en: 'Is the site useful for self-study too?',
					zh: '这个站也适合自学吗？',
					ja: '自習にも役立ちますか？'
				},
				answer: {
					en: 'Yes. The same replay loop that works in class also works for short solo study sessions, especially when combined with recent-mistake review.',
					zh: '适合。课堂里有效的重玩循环，同样适用于短时间自学，尤其适合配合最近错题复盘。',
					ja: '役立ちます。授業で有効な反復ループは、自習の短いセッションでも機能し、最近のミス復習と相性が良いです。'
				}
			}
		]
	}
];

const LEARNING_PATH_DEFS: LearningPathDef[] = [
	{
		id: 'world-foundation',
		title: {
			en: 'World Foundation',
			zh: '世界基础路径',
			ja: '世界基礎ルート'
		},
		description: {
			en: 'Build confidence from continent recall into the full world map quiz.',
			zh: '从大洲记忆逐步过渡到完整世界地图测验。',
			ja: '大陸の記憶から世界全体クイズへつなぐ基礎ルートです。'
		},
		steps: {
			en: ['Start with one continent', 'Add a second continent', 'Use the world quiz as the integration run'],
			zh: ['先练一个大洲', '再加入第二个大洲', '最后用世界测验做整合'],
			ja: ['まず1つの大陸', '次に2つ目を追加', '最後に世界クイズで統合']
		},
		quizSlugs: ['asia-countries-quiz', 'europe-countries-quiz', 'world-map-quiz'],
		guideSlug: 'memorize-countries-by-continent'
	},
	{
		id: 'country-depth',
		title: {
			en: 'Country Depth',
			zh: '国家深挖路径',
			ja: '国別深掘りルート'
		},
		description: {
			en: 'Move from a country overview into capitals, regions, and landmark recognition.',
			zh: '从国家总览逐步进入首府、区域和地标识别。',
			ja: '国全体の把握から州都、地域、ランドマーク認識へ進むルートです。'
		},
		steps: {
			en: ['Open the country hub', 'Train capitals or regions', 'Finish with landmarks for place texture'],
			zh: ['先打开国家总页', '接着练首府或区域', '最后用地标补地点感'],
			ja: ['国別ハブを開く', '州都や地域を練習', '最後にランドマークで場所感を足す']
		},
		quizSlugs: ['japan-map-quiz', 'japan-capitals-quiz', 'japan-landmarks-quiz'],
		guideSlug: 'country-quiz-vs-landmark-quiz'
	},
	{
		id: 'quick-daily-loop',
		title: {
			en: 'Quick Daily Loop',
			zh: '每日短练路径',
			ja: '毎日の短時間ルート'
		},
		description: {
			en: 'A short repeatable practice sequence for busy learners.',
			zh: '给时间有限的用户准备的一条短时可重复练习路径。',
			ja: '時間が限られている人向けの短く反復しやすい練習ルートです。'
		},
		steps: {
			en: ['Warm up with a familiar drill', 'Run one broader quiz', 'Review misses before leaving'],
			zh: ['先用熟悉题组热身', '再跑一轮更宽的测验', '离开前复盘错题'],
			ja: ['得意なドリルで温める', '少し広いクイズを1本やる', '終わる前にミスを見直す']
		},
		quizSlugs: ['asia-countries-quiz', 'world-map-quiz', 'japan-map-quiz'],
		guideSlug: 'geography-quiz-practice-routine'
	}
];

const localizeBlogPost = (
	post: BlogPostDef,
	locale: AppLocale
): BlogPost => ({
	slug: post.slug,
	category: post.category,
	categoryLabel: pick(post.categoryLabel, locale),
	title: pick(post.title, locale),
	description: pick(post.description, locale),
	seoTitle: pick(post.seoTitle, locale),
	seoDescription: pick(post.seoDescription, locale),
	keywords: pick(post.keywords, locale),
	intro: pick(post.intro, locale),
	takeaways: pick(post.takeaways, locale),
	sections: pick(post.sections, locale).map((section) => ({
		heading: section.heading,
		paragraphs: [...section.paragraphs],
		bullets: section.bullets ? [...section.bullets] : undefined
	})),
	relatedQuizSlugs: [...post.relatedQuizSlugs],
	relatedPostSlugs: [...post.relatedPostSlugs],
	featured: post.featured,
	publishedAt: post.publishedAt,
	updatedAt: post.updatedAt,
	readingTimeMinutes: post.readingTimeMinutes
});

const localizeFaqGroup = (
	group: SiteFaqGroupDef,
	locale: AppLocale
): SiteFaqGroup => ({
	id: group.id,
	title: pick(group.title, locale),
	description: pick(group.description, locale),
	items: group.items.map((item) => ({
		question: pick(item.question, locale),
		answer: pick(item.answer, locale)
	}))
});

const localizeLearningPath = (
	path: LearningPathDef,
	locale: AppLocale
): LearningPath => ({
	id: path.id,
	title: pick(path.title, locale),
	description: pick(path.description, locale),
	steps: [...pick(path.steps, locale)],
	quizSlugs: [...path.quizSlugs],
	guideSlug: path.guideSlug
});

export const getAllBlogSlugs = () => BLOG_POST_DEFS.map((post) => post.slug);

export const getBlogPosts = (locale: AppLocale) =>
	BLOG_POST_DEFS.map((post) => localizeBlogPost(post, locale));

export const getFeaturedBlogPosts = (locale: AppLocale, limit = 3) =>
	getBlogPosts(locale)
		.filter((post) => post.featured)
		.slice(0, limit);

export const getBlogPostBySlug = (locale: AppLocale, slug: string) => {
	const post = BLOG_POST_DEFS.find((item) => item.slug === slug);
	return post ? localizeBlogPost(post, locale) : null;
};

export const getRelatedBlogPosts = (
	locale: AppLocale,
	slug: string,
	limit = 3
) => {
	const current = BLOG_POST_DEFS.find((item) => item.slug === slug);
	if (!current) return [];

	const preferred = current.relatedPostSlugs
		.map((relatedSlug) =>
			BLOG_POST_DEFS.find((item) => item.slug === relatedSlug)
		)
		.filter((post): post is BlogPostDef => Boolean(post));

	const fallbacks = BLOG_POST_DEFS.filter(
		(post) => post.slug !== slug && !current.relatedPostSlugs.includes(post.slug)
	);

	return [...preferred, ...fallbacks]
		.slice(0, limit)
		.map((post) => localizeBlogPost(post, locale));
};

export const getRelatedBlogPostsForQuiz = (
	locale: AppLocale,
	quizSlug: string,
	limit = 3
) =>
	BLOG_POST_DEFS.filter((post) => post.relatedQuizSlugs.includes(quizSlug))
		.slice(0, limit)
		.map((post) => localizeBlogPost(post, locale));

export const getSiteFaqGroups = (locale: AppLocale) =>
	SITE_FAQ_GROUP_DEFS.map((group) => localizeFaqGroup(group, locale));

export const getLearningPaths = (locale: AppLocale) =>
	LEARNING_PATH_DEFS.map((path) => localizeLearningPath(path, locale));
