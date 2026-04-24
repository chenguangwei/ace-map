import type { routing } from '@/i18n/routing';
import { buildGameHref, getQuizTopicBySlug } from '@/lib/data/quizTopics';

export type AppLocale = (typeof routing.locales)[number];

type LocalizedValue<T> = {
	en: T;
	zh: T;
	ja: T;
};

export type CampaignTemplateId = 'pursuit' | 'command' | 'escape';
export type CampaignDifficulty = 'starter' | 'adaptive' | 'intense';
export type CampaignAudience = 'students' | 'mixed' | 'general';
export type CampaignAccent = 'sky' | 'amber' | 'emerald';

interface CampaignMissionPreviewDef {
	id: string;
	title: LocalizedValue<string>;
	summary: LocalizedValue<string>;
	quizSlug: string;
	dialogue?: CampaignMissionDialogueDef;
}

interface CampaignMissionDialogueDef {
	briefing?: LocalizedValue<string>;
	objective?: LocalizedValue<string>;
	confirm?: LocalizedValue<string>;
	success?: LocalizedValue<string>;
	failure?: LocalizedValue<string>;
	footerObjective?: LocalizedValue<string>;
	footerConfirm?: LocalizedValue<string>;
	footerSuccess?: LocalizedValue<string>;
	footerFailure?: LocalizedValue<string>;
}

interface CampaignFactionDef {
	name: LocalizedValue<string>;
	role: LocalizedValue<string>;
	summary: LocalizedValue<string>;
}

interface CampaignStoryDef {
	prologue: LocalizedValue<string>;
	factions: CampaignFactionDef[];
	epilogue: LocalizedValue<string>;
}

interface CampaignDef {
	slug: string;
	templateId: CampaignTemplateId;
	accent: CampaignAccent;
	title: LocalizedValue<string>;
	summary: LocalizedValue<string>;
	premise: LocalizedValue<string>;
	seoTitle: LocalizedValue<string>;
	seoDescription: LocalizedValue<string>;
	durationMinutes: number;
	missionCount: number;
	difficulty: CampaignDifficulty;
	audience: CampaignAudience;
	launchQuizSlug: string;
	relatedQuizSlugs: string[];
	remixPromptExamples: LocalizedValue<string[]>;
	story: CampaignStoryDef;
	missionPreviews: CampaignMissionPreviewDef[];
}

export interface CampaignMissionPreview {
	id: string;
	title: string;
	summary: string;
	quizSlug: string;
	dialogue?: CampaignMissionDialogue;
}

export interface CampaignMissionDialogue {
	briefing?: string;
	objective?: string;
	confirm?: string;
	success?: string;
	failure?: string;
	footerObjective?: string;
	footerConfirm?: string;
	footerSuccess?: string;
	footerFailure?: string;
}

export interface CampaignFaction {
	name: string;
	role: string;
	summary: string;
}

export interface CampaignStory {
	prologue: string;
	factions: CampaignFaction[];
	epilogue: string;
}

export interface Campaign {
	locale: AppLocale;
	slug: string;
	templateId: CampaignTemplateId;
	templateLabel: string;
	accent: CampaignAccent;
	title: string;
	summary: string;
	premise: string;
	seoTitle: string;
	seoDescription: string;
	durationMinutes: number;
	missionCount: number;
	difficulty: CampaignDifficulty;
	difficultyLabel: string;
	audience: CampaignAudience;
	audienceLabel: string;
	launchQuizSlug: string;
	relatedQuizSlugs: string[];
	remixPromptExamples: string[];
	story: CampaignStory;
	missionPreviews: CampaignMissionPreview[];
}

export interface CampaignRemixDraft {
	prompt: string;
	title: string;
	summary: string;
	premise: string;
	playHref: string;
}

const REMIX_FALLBACK_COPY: LocalizedValue<{
	defaultTitleSuffix: string;
	summaryPrefix: string;
	premisePrefix: string;
	sentenceEnd: string;
}> = {
	en: {
		defaultTitleSuffix: 'Remix',
		summaryPrefix: 'Remix angle:',
		premisePrefix: 'This remix shifts the run toward:',
		sentenceEnd: '.'
	},
	zh: {
		defaultTitleSuffix: '改编版',
		summaryPrefix: '改编方向：',
		premisePrefix: '这次改编会把整场路线调整为：',
		sentenceEnd: '。'
	},
	ja: {
		defaultTitleSuffix: 'リミックス版',
		summaryPrefix: 'リミックスの方向:',
		premisePrefix: '今回のリミックスでは次の方向へ寄せます:',
		sentenceEnd: '。'
	}
};

const pick = <T>(value: LocalizedValue<T>, locale: AppLocale) => value[locale];

const TEMPLATE_LABELS: LocalizedValue<Record<CampaignTemplateId, string>> = {
	en: {
		pursuit: 'Pursuit Campaign',
		command: 'Command Campaign',
		escape: 'Escape Campaign'
	},
	zh: {
		pursuit: '追踪战役',
		command: '指挥战役',
		escape: '逃生战役'
	},
	ja: {
		pursuit: '追跡キャンペーン',
		command: '指揮キャンペーン',
		escape: '脱出キャンペーン'
	}
};

const DIFFICULTY_LABELS: LocalizedValue<Record<CampaignDifficulty, string>> = {
	en: {
		starter: 'Starter',
		adaptive: 'Adaptive',
		intense: 'Intense'
	},
	zh: {
		starter: '入门',
		adaptive: '自适应',
		intense: '高压'
	},
	ja: {
		starter: 'スターター',
		adaptive: '適応型',
		intense: '高密度'
	}
};

const AUDIENCE_LABELS: LocalizedValue<Record<CampaignAudience, string>> = {
	en: {
		students: 'Student-friendly',
		mixed: 'Student + map fans',
		general: 'General players'
	},
	zh: {
		students: '学生友好',
		mixed: '学生与地图爱好者',
		general: '泛玩家'
	},
	ja: {
		students: '学習者向け',
		mixed: '学習者と地図好き向け',
		general: '一般プレイヤー向け'
	}
};

const CAMPAIGN_DEFS: CampaignDef[] = [
	{
		slug: 'lost-shipping-route',
		templateId: 'pursuit',
		accent: 'sky',
		title: {
			en: 'Lost Shipping Route',
			zh: '失落航线',
			ja: '失われた航路'
		},
		summary: {
			en: 'Morning Star is gone. Follow the forged manifests across three seas and steal the relief cargo back before the black market closes the deal.',
			zh: '“晨星号”失联了。顺着三片海域里的伪造舱单追下去，在黑市成交前把那批救援冷链货抢回来。',
			ja: 'モーニングスターが消えました。三つの海域に撒かれた偽造船荷証券を追い、闇市の取引が閉じる前に救援貨物を奪い返します。'
		},
		premise: {
			en: 'At 03:17, the Seven Ports League lost contact with Morning Star and every honest broker started lying at once. Each correct lock reveals which country handled the cargo, who forged the transfer, and how close you are to the final harbor.',
			zh: '凌晨 03:17，七港同盟与“晨星号”同时失去联系，随后所有本该诚实的中转商口径一致地开始说谎。你每锁定一个正确国家，就会揭开一层假转运记录，逼近真正的偷货人和最后的靠港点。',
			ja: '03:17、セブンポーツ連盟はモーニングスターとの交信を失い、その瞬間から正規の仲介人たちまで口をそろえて嘘をつき始めました。正しい国を一つ特定するたび、偽装転送の層が剥がれ、犯人と最終寄港地へ近づきます。'
		},
		seoTitle: {
			en: 'Lost Shipping Route Campaign | MapQuiz.pro',
			zh: '失落航线战役 | MapQuiz.pro',
			ja: '失われた航路キャンペーン | MapQuiz.pro'
		},
		seoDescription: {
			en: 'Play an official AI pursuit campaign about forged cargo manifests, vanishing ports, and a stolen relief shipment.',
			zh: '体验官方 AI 追踪战役，在伪造舱单、失踪港口与被盗救援货物之间一路追到终点。',
			ja: '偽造船荷証券、消えた港、盗まれた救援貨物を追う公式 AI 追跡キャンペーンです。'
		},
		durationMinutes: 4,
		missionCount: 4,
		difficulty: 'starter',
		audience: 'mixed',
		launchQuizSlug: 'world-map-quiz',
		relatedQuizSlugs: [
			'world-map-quiz',
			'europe-countries-quiz',
			'asia-countries-quiz'
		],
		remixPromptExamples: {
			en: [
				'Make this a pirate-smuggling route.',
				'Turn this into a classroom trade mission.',
				'Make it faster and harder.'
			],
			zh: [
				'把它改成海盗走私航线。',
				'改成课堂版贸易任务。',
				'改得更快更难。'
			],
			ja: [
				'海賊の密輸ルート風にする。',
				'授業向けの貿易ミッションにする。',
				'もっと速く、難しくする。'
			]
		},
		story: {
			prologue: {
				en: 'Morning Star should have been a boring overnight relief run. Instead, by the time dawn traffic opened, its registry had split into three versions, its cargo tags had been overwritten, and the ship itself existed only as rumor. The Seven Ports League cannot send a fleet after a rumor, so they send you: one operator, one map wall, and a shrinking chance to recover the true route before the stolen medicine is sold into the dark market.',
				zh: '“晨星号”原本只该是一趟平平无奇的夜间救援航程。可等到天快亮的时候，它的船籍记录已经裂成了三份版本，货柜标签被整批改写，连这艘船本身都像只剩下传闻。七港同盟没法派一整支船队去追一个传闻，所以他们把你推上了值班台: 一个人，一面地图墙，以及越来越短的时间窗口。你要在被盗药品流进黑市之前，把真正的航线一段段从谎言里捞回来。',
				ja: 'モーニングスターは、本来なら退屈な夜間救援航海で終わるはずでした。ところが夜明け前には、船籍記録が三つに割れ、貨物タグは上書きされ、船そのものが噂にしか見えなくなっていました。セブンポーツ連盟は噂へ艦隊を出せません。だからこそ、地図壁と短くなる猶予だけを持つあなた一人が送り込まれます。盗まれた医薬品が闇市へ流れる前に、本当の航路を嘘の中から一本ずつ引き戻さなければなりません。'
			},
			factions: [
				{
					name: {
						en: 'Seven Ports League',
						zh: '七港同盟',
						ja: 'セブンポーツ連盟'
					},
					role: {
						en: 'Your employer',
						zh: '你的委托方',
						ja: 'あなたの依頼元'
					},
					summary: {
						en: 'A mutual-aid shipping union that keeps relief cargo moving when ordinary insurers back away.',
						zh: '一个专门维持救援航运的互助同盟，平时负责把那些普通保险公司根本不愿碰的货安全送出去。',
						ja: '通常の保険会社が手を引く救援貨物を、それでも動かし続けるための相互扶助型海運連盟です。'
					}
				},
				{
					name: {
						en: 'Blackwake Traders',
						zh: '黑潮商会',
						ja: 'ブラックウェイク商会'
					},
					role: {
						en: 'Route saboteurs',
						zh: '航线破坏者',
						ja: '航路破壊者'
					},
					summary: {
						en: 'A cargo-broker syndicate that profits by creating paperwork chaos first and supply shortages second.',
						zh: '靠制造单据混乱赚钱的货运黑商，他们最擅长的不是偷东西，而是先让所有人都分不清东西是不是还在。',
						ja: '書類の混乱を先に生み、そのあとで供給不足から利益を吸い上げる闇の貨物ブローカー集団です。'
					}
				},
				{
					name: {
						en: 'Night Tide Buyers',
						zh: '夜潮买家团',
						ja: 'ナイトタイド買い手連'
					},
					role: {
						en: 'End-point receivers',
						zh: '终点收货人',
						ja: '終端の受け取り手'
					},
					summary: {
						en: 'Anonymous auction buyers who do not care whether the cargo was stolen, only whether it arrives cold and on time.',
						zh: '一群匿名竞拍者，他们根本不在乎货是不是偷来的，只在乎药品能不能在失效前、完好无损地送到手里。',
						ja: '貨物が盗品かどうかではなく、冷えたまま期限内に届くかだけを気にする匿名の競売買い手たちです。'
					}
				}
			],
			epilogue: {
				en: 'If you clear the final harbor, Morning Star does not return to applause. It returns to a clinic quay where exhausted volunteers unload the crates in silence because there is no spare energy left for cheering. That is the real reward of this run: not glory, but the moment a stolen route becomes a lifeline again.',
				zh: '如果你把最后的港口打通，“晨星号”靠回来的时候并不会有人夹道欢呼。它只会安安静静停进诊所码头，累到站不稳的志愿者们一句话不说地把药箱往下卸，因为所有人都把力气花在了活下来这件事上。这条战役真正的回报从来都不是荣耀，而是你亲眼看着一条被人偷走的航线，重新变回一条能救命的生命线。',
				ja: '最後の港を抜けたとしても、モーニングスターを迎えるのは拍手ではありません。診療所の岸壁に静かに寄せられ、疲れ切ったボランティアたちが言葉もなく木箱を降ろしていくだけです。このランの報酬は栄光ではなく、盗まれた航路が再び命綱へ戻る瞬間そのものです。'
			}
		},
		missionPreviews: [
			{
				id: 'forged-stamp',
				title: {
					en: 'The first forged stamp',
					zh: '第一枚伪造印章',
					ja: '最初の偽造印'
				},
				summary: {
					en: 'Morning Star disappeared after docking under a false customs seal. Start with a world scan and find the country where the route was first swapped.',
					zh: '“晨星号”是在一枚假海关印章落下后失踪的。先从全球货运图里找出第一处被人调包的国家，把真正的起点挖出来。',
					ja: 'モーニングスターは偽の税関印が押された直後に消えました。世界スケールで最初のすり替えが起きた国を突き止め、真の起点を掘り当てます。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: '03:17. The League wakes you with one sentence: Morning Star is gone. All that remains is a manifest page with one customs stamp that does not belong.',
						zh: '03:17，七港同盟把你从值班室里直接叫醒，只留下一句话：“晨星号不见了。” 现在能相信的，只有那页被雨水泡皱的舱单，以及上面一枚来路不对的海关印章。',
						ja: '03:17、連盟はあなたをたたき起こしました。言葉は一つだけです。「モーニングスターが消えた。」 信じられるのは、雨に濡れた船荷証券の一枚と、そこに押された場違いな税関印だけです。'
					},
					objective: {
						en: 'Blackwake traders hid their first swap at {target}. Name that country and we can prove where the ship stopped being itself.',
						zh: '黑潮商会把第一次换箱藏在了 {target}。只要你先咬住这里，我们就能证明“晨星号”究竟是从哪一站开始不再是原来的那艘船。',
						ja: 'ブラックウェイク商会は最初の積み替えを {target} に隠しました。そこを押さえれば、船がいつ別物にすり替わったかを証明できます。'
					},
					confirm: {
						en: 'You marked {selection}. If that is the fake customs stamp, dispatch can reopen the sealed ledger.',
						zh: '你已经把 {selection} 圈出来了。如果这就是那枚假印章落下的地方，调度台就能强行解开第一层封存账本。',
						ja: '{selection} をマークしました。そこが偽造印の地点なら、ディスパッチは封印された帳簿の最初の層を開けます。'
					},
					success: {
						en: '{selection} matches the forged seal. The ledger cracks open and Morning Star reappears on the route for one brief minute.',
						zh: '{selection} 和伪造印章对上了。封账裂开一道口子，“晨星号”的第一段真实航迹终于重新浮出来。',
						ja: '{selection} は偽造印と一致しました。封印帳簿に裂け目が入り、モーニングスターの本当の航跡が一瞬だけ戻ります。'
					},
					failure: {
						en: '{selection} is clean. The forged stamp is still hiding at {target}, and the thief is buying more time.',
						zh: '{selection} 是干净的。那枚假印章还躲在 {target}，偷货的人又替自己争到了一点时间。',
						ja: '{selection} は白です。偽造印はまだ {target} に潜み、犯人はさらに時間を稼いでいます。'
					},
					footerObjective: {
						en: 'Find the country first. The whole pursuit starts with that single lie.',
						zh: '先把这一个国家钉死。整条追击线，都是从这一句谎话开始的。',
						ja: 'まずこの一国を確定してください。追跡線はこの一つの嘘から始まります。'
					},
					footerConfirm: {
						en: 'One confirmation now decides whether this becomes rumor or evidence.',
						zh: '这次确认，会决定它只是传闻，还是第一份铁证。',
						ja: 'この確認で、噂のまま終わるか、最初の証拠になるかが決まります。'
					},
					footerSuccess: {
						en: 'The first lie is exposed. Push into the next port before the trail is scrubbed.',
						zh: '第一层伪装已经撕开。趁线索还没被抹干净，立刻压向下一座港口。',
						ja: '最初の偽装は剥がれました。痕跡が消される前に次の港へ踏み込みます。'
					},
					footerFailure: {
						en: 'The trail is still moving. Reset and hunt the real stamp.',
						zh: '线索还在移动。重开扫描，把真正的印章揪出来。',
						ja: '痕跡はまだ動いています。スキャンを開き直し、本物の偽造印を引きずり出します。'
					}
				}
			},
			{
				id: 'ghost-corridor',
				title: {
					en: 'The corridor of ghost containers',
					zh: '幽灵货柜走廊',
					ja: '幽霊コンテナ回廊'
				},
				summary: {
					en: 'A dockworker codenamed White Gull admits the cargo crossed a corridor of ghost containers through Europe. Rebuild that route before every crane log is erased.',
					zh: '代号“白鹭”的码头线人终于开口，说货物曾借一条“幽灵货柜走廊”穿过欧洲。你得赶在所有吊机记录被抹掉前，把这条中段路线重新拼出来。',
					ja: '埠頭の内通者ホワイトガルがついに口を割り、貨物はヨーロッパの「幽霊コンテナ回廊」を抜けたと認めました。クレーン記録が消される前に中継線を組み直します。'
				},
				quizSlug: 'europe-countries-quiz',
				dialogue: {
					briefing: {
						en: 'White Gull sold you half a confession and a torn crane ticket. The middle leg was not random; someone moved the cargo port to port behind a wall of decoy containers.',
						zh: '“白鹭”卖给你的，是半句供词和一张撕开的吊机票据。中段航线不是乱掉的，而是有人躲在一整排诱饵货柜后面，刻意把货物一站一站洗过去。',
						ja: 'ホワイトガルが売ってきたのは、半分の自白と破れたクレーン票でした。中継区間は偶然ではなく、誰かが囮のコンテナ列の裏で貨物を洗い直していたのです。'
					},
					objective: {
						en: 'The hidden corridor narrows at {target}. Lock it, and the League can follow the cranes instead of the rumors.',
						zh: '那条看不见的走廊在 {target} 收束。把这里锁住，七港同盟才能跟着吊机轨迹走，而不是继续听谣言兜圈子。',
						ja: '見えない回廊は {target} で細くなります。そこを押さえれば、連盟は噂ではなくクレーンの軌跡を追えます。'
					},
					confirm: {
						en: '{selection} is lined up on your board. Confirm it if this is where the ghost containers changed hands.',
						zh: '{selection} 已经被你摆上推演板了。如果幽灵货柜是在这里换手，现在就敲定它。',
						ja: '{selection} を作戦盤に固定しました。幽霊コンテナの受け渡し地点なら、ここで確定します。'
					},
					success: {
						en: '{selection} is the corridor hinge. Every fake container on the board suddenly points the same way.',
						zh: '{selection} 就是整条走廊的铰点。推演板上那些假货柜一下子全朝同一个方向转过去了。',
						ja: '{selection} が回廊の蝶番でした。作戦盤の偽装コンテナが一斉に同じ方向を向きます。'
					},
					failure: {
						en: '{selection} does not fit the crane pattern. The corridor still bends through {target}.',
						zh: '{selection} 对不上吊机节奏。那条走廊真正拐弯的地方，仍然是 {target}。',
						ja: '{selection} はクレーンの周期に合いません。回廊が本当に曲がる地点はまだ {target} です。'
					},
					footerObjective: {
						en: 'Read the machinery, not the paperwork. The papers were forged hours ago.',
						zh: '看机械轨迹，不要看报表。那些报表几个小时前就已经被人写假了。',
						ja: '帳票ではなく機械の軌跡を見てください。書類は何時間も前に偽造されています。'
					},
					footerConfirm: {
						en: 'One lock here decides whether the corridor becomes a map again.',
						zh: '这里的这一下锁定，决定这条走廊还能不能重新变回一张地图。',
						ja: 'ここでの一回の固定で、この回廊が再び地図になるかが決まります。'
					},
					footerSuccess: {
						en: 'The middle route is back. Now hunt the buyer waiting on the far side of the sea.',
						zh: '中段路线接回来了。下一步，去追海对面那个等着收货的人。',
						ja: '中継線が戻りました。次は海の向こうで待つ買い手を追います。'
					},
					footerFailure: {
						en: 'The corridor is still masked. Peel back another layer.',
						zh: '这条走廊还披着假皮。再掀一层。',
						ja: '回廊はまだ偽装の皮をかぶっています。もう一枚剥がします。'
					}
				}
			},
			{
				id: 'night-tide-ledger',
				title: {
					en: 'The Night Tide ledger',
					zh: '夜潮账本',
					ja: 'ナイトタイドの帳簿'
				},
				summary: {
					en: 'Inside the corridor you find a salt-soaked ledger page signed Night Tide. It points east. Follow the buyer trail into Asia before the auction bell rings.',
					zh: '走廊尽头藏着一页被海盐浸坏的账本，落款只有“夜潮”两个字。它把方向直接指向东边。你必须赶在拍卖钟响前，把收货人的落点在亚洲锁出来。',
					ja: '回廊の終点には、塩で傷んだ帳簿の切れ端があり、署名は「ナイトタイド」だけでした。矢印は東を向いています。競りの鐘が鳴る前に、アジア側の受け取り地点を確定します。'
				},
				quizSlug: 'asia-countries-quiz',
				dialogue: {
					briefing: {
						en: 'The Night Tide ledger lists buyers by moon phase instead of name. Only one stop matches the timing, and that stop is paying for silence.',
						zh: '“夜潮”的账本从不写买家名字，只按月相记账。现在只有一站和时间完全吻合，而那一站正拼命花钱让所有人闭嘴。',
						ja: 'ナイトタイドの帳簿は買い手の名前ではなく月相で記録されています。時刻が一致する停泊地は一つだけで、そこは今まさに沈黙へ金を払っています。'
					},
					objective: {
						en: 'The buyer trail sharpens at {target}. Call it correctly and we can crash the sale before the cargo disappears inland.',
						zh: '收货线在 {target} 突然清晰起来。只要你这次叫准，我们就能在货物被拖进内陆前砸掉这场交易。',
						ja: '買い手の線は {target} で一気に濃くなります。ここを言い当てれば、貨物が内陸へ消える前に取引を潰せます。'
					},
					confirm: {
						en: '{selection} is now under your pin. Confirm it if this is where Night Tide planned to cash out.',
						zh: '{selection} 已经压上你的定位针了。如果“夜潮”准备在这里套现，现在就确认。',
						ja: '{selection} にピンを打ちました。ナイトタイドがここで現金化するつもりなら、今確定します。'
					},
					success: {
						en: '{selection} is the buyer stop. The auction lights cut out, and the ledger finally reads like truth.',
						zh: '{selection} 就是收货点。拍卖厅的灯一瞬间全灭了，账本终于开始说真话。',
						ja: '{selection} が受け取り地点です。競り場の灯りが落ち、帳簿がようやく本当のことを語り始めます。'
					},
					failure: {
						en: '{selection} is a decoy market. The real buyer is still preparing at {target}.',
						zh: '{selection} 只是诱饵市场。真正的买家还在 {target} 整理接货清单。',
						ja: '{selection} は囮の市場です。本当の買い手はまだ {target} で受け取り表を整えています。'
					},
					footerObjective: {
						en: 'This is no longer about route recovery. It is about catching the hand waiting at the end.',
						zh: '这一步已经不只是修航线了，而是去抓那只等在终点的手。',
						ja: 'ここは航路復旧だけの話ではありません。終点で待つ手を捕まえる段階です。'
					},
					footerConfirm: {
						en: 'The next call sends either a strike team or an apology.',
						zh: '你下一次落针，决定调过去的是突击队，还是一封道歉信。',
						ja: '次の確定で送られるのは制圧班か、謝罪文かのどちらかです。'
					},
					footerSuccess: {
						en: 'Night Tide is cornered. One last sprint and Morning Star reaches dawn.',
						zh: '“夜潮”已经被你逼到墙角。再冲最后一段，“晨星号”就能在天亮前靠港。',
						ja: 'ナイトタイドは追い詰められました。あと一走りでモーニングスターは夜明け前に着けます。'
					},
					footerFailure: {
						en: 'The buyer slipped the net. Re-open the eastern chart now.',
						zh: '买家从网眼里滑过去了。立刻重开东线海图。',
						ja: '買い手が網目を抜けました。すぐに東側チャートを開き直します。'
					}
				}
			},
			{
				id: 'dawn-harbor',
				title: {
					en: 'Harbor before sunrise',
					zh: '日出前靠港',
					ja: '夜明け前の寄港'
				},
				summary: {
					en: 'The cargo is finally moving toward the real harbor, but the cold-chain timer is dying. Win the last navigation race and bring Morning Star home before sunrise.',
					zh: '货物终于朝真正的港口动起来了，但冷链倒计时也已经快烧到底。赢下最后这段抢航，让“晨星号”在日出前回到它该去的地方。',
					ja: '貨物はようやく本来の港へ動き始めましたが、低温維持の残り時間はほとんどありません。最後の航路競争に勝ち、夜明け前にモーニングスターを帰還させます。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: 'The ship is back on the water, but barely. Every delay now is measured in melted coolant and dying clinic lights.',
						zh: '船是找回来了，可也只是勉强还在水面上。现在每晚一秒，消耗掉的都不只是冷却剂，还有终点诊所一盏一盏快要熄掉的灯。',
						ja: '船は戻りましたが、ぎりぎりです。今の遅れは溶ける冷媒と、終着地の診療所で消えかける灯として数えられます。'
					},
					objective: {
						en: 'The true harbor window opens at {target}. Call it, and Morning Star can dock before the sun catches the deck.',
						zh: '真正的靠港窗口在 {target} 打开。只要你这一锤敲准，“晨星号”就能赶在第一道日光照上甲板前进港。',
						ja: '本当の寄港窓は {target} で開きます。ここを言い当てれば、朝日が甲板に触れる前に接岸できます。'
					},
					confirm: {
						en: '{selection} is set as the final harbor. Confirm it if you are ready to end the chase.',
						zh: '{selection} 已经被设成最终靠港点了。如果你准备好把这场追击收尾，现在就确认。',
						ja: '{selection} を最終寄港地に設定しました。この追跡を終える覚悟があるなら、今確定します。'
					},
					success: {
						en: '{selection} is home. Morning Star cuts through the dawn fog, and the relief cargo survives the night.',
						zh: '{selection} 就是终点港。“晨星号”穿过晨雾的时候，整批救援货物终于完整熬过了这一夜。',
						ja: '{selection} が終着港でした。モーニングスターは朝霧を切り裂き、救援貨物は一晩を生き延びます。'
					},
					failure: {
						en: '{selection} is not the harbor we need. The last safe window is still waiting at {target}.',
						zh: '{selection} 不是我们要的港。最后那道安全窗口，还留在 {target} 没关。',
						ja: '{selection} は必要な港ではありません。最後の安全窓はまだ {target} に残っています。'
					},
					footerObjective: {
						en: 'Final leg. No more rumors, no more middlemen. Just the harbor.',
						zh: '最后一程了。没有谣言，没有中间商，只有终点港本身。',
						ja: '最終区間です。噂も仲介人ももういません。残るのは港だけです。'
					},
					footerConfirm: {
						en: 'Once you confirm, the whole fleet commits.',
						zh: '你这一确认，整支护航船队就会一起压过去。',
						ja: 'この確認で、護衛船団全体が一斉に動きます。'
					},
					footerSuccess: {
						en: 'Route recovered. Cargo delivered. Case closed at sunrise.',
						zh: '航线接回，货物送达，这一案在日出时分正式结掉。',
						ja: '航路復旧、貨物到着。案件は夜明けとともに閉じます。'
					},
					footerFailure: {
						en: 'The sun is rising. Re-lock the final harbor now.',
						zh: '天已经快亮了。立刻重新锁定最后的港口。',
						ja: '夜明けが迫っています。すぐに最後の港を再固定します。'
					}
				}
			}
		]
	},
	{
		slug: 'border-crisis-command',
		templateId: 'command',
		accent: 'amber',
		title: {
			en: 'Border Crisis Command',
			zh: '边境危机指挥',
			ja: '境界危機コマンド'
		},
		summary: {
			en: 'The ceasefire is slipping, the beacons are going dark, and panic is outrunning command. Reclaim the map before the whole frontier tears open.',
			zh: '停火线在松，信标在熄，恐慌已经快跑过指挥链了。你得先把地图抢回来，别让整条边境一起裂开。',
			ja: '停戦線が緩み、ビーコンが落ち、恐慌が指揮より先に走っています。前線全体が裂ける前に、まず地図を取り戻さなければなりません。'
		},
		premise: {
			en: 'The Gray Wall Accord will survive only until sunrise unless someone stops the false alarms, reroutes the convoys, and exposes the hand planting them. Every correct region read keeps one more town from panicking.',
			zh: '“灰墙协定”撑不撑得到日出，全看你能不能先压住假警报、重排车队，再把背后故意放火的人从混乱里拎出来。你每认对一个关键区域，就能替一座边境城镇按住一次失控。',
			ja: 'グレイウォール協定が夜明けまで持つかどうかは、偽警報を抑え、車列を組み直し、その裏で火をつける人物を暴けるかにかかっています。正しい地域認識が、一つの町の暴走を一度ずつ止めます。'
		},
		seoTitle: {
			en: 'Border Crisis Command Campaign | MapQuiz.pro',
			zh: '边境危机指挥战役 | MapQuiz.pro',
			ja: '境界危機コマンドキャンペーン | MapQuiz.pro'
		},
		seoDescription: {
			en: 'Play an official AI command campaign about a breaking ceasefire, failing border beacons, and one long night of emergency dispatches.',
			zh: '体验官方 AI 指挥战役，在停火将碎、信标失效和整夜紧急调度之间稳住边境。',
			ja: '停戦崩壊寸前の国境、沈黙するビーコン、徹夜の緊急派遣を描く公式 AI 指揮キャンペーンです。'
		},
		durationMinutes: 5,
		missionCount: 5,
		difficulty: 'adaptive',
		audience: 'mixed',
		launchQuizSlug: 'europe-countries-quiz',
		relatedQuizSlugs: [
			'europe-countries-quiz',
			'africa-countries-quiz',
			'world-map-quiz'
		],
		remixPromptExamples: {
			en: [
				'Make this a disaster-response mission.',
				'Turn it into a student-safe UN exercise.',
				'Reduce the pressure and add more hints.'
			],
			zh: [
				'改成灾害应急任务。',
				'改成学生可玩的联合国演练。',
				'降低压力，多给一些提示。'
			],
			ja: [
				'災害対応ミッションにする。',
				'学習者向けの国際演習にする。',
				'緊張感を少し下げてヒントを増やす。'
			]
		},
		story: {
			prologue: {
				en: 'The Gray Wall Accord was signed to keep one ugly border from becoming six. It almost worked. Then the beacons began reporting smoke in the wrong places, convoys started driving toward fabricated emergencies, and every ministry discovered that panic is easier to issue than orders. You are dropped into the command lattice midway through the worst night of the accord, with just enough time to identify which alarms are real, which fronts are bait, and which single decision will keep the frontier intact until morning.',
				zh: '“灰墙协定”原本是为了把一条难看的边境线控制在一条，而不是让它炸成六条。它差一点就成功了。然后，边境信标开始把烟火报到错误的方向，补给车队被假警报牵着满地乱跑，每个部门都发现恐慌这种东西比命令更容易下发。你被临时扔进这张快要撕开的指挥网，接手协定最糟的一夜。你要在天亮前分清哪些警报是真的，哪些前线只是诱饵，以及哪一道命令能让整片边境不至于当场崩开。',
				ja: 'グレイウォール協定は、一つの醜い国境を六つの火種へ増やさないために結ばれました。あと少しで機能するはずでした。ところがビーコンは煙を誤報し、車列は捏造された非常事態へ走り、どの省庁も命令より恐慌の方が早く広がると知ります。あなたは協定史上最悪の夜、その指揮網へ途中参加させられます。夜明けまでに、本物の警報と囮の前線を見分け、国境全体を一つにつなぎ止める最後の命令を選ばなければなりません。'
			},
			factions: [
				{
					name: {
						en: 'Gray Wall Council',
						zh: '灰墙议会',
						ja: 'グレイウォール評議会'
					},
					role: {
						en: 'Fragile political center',
						zh: '脆弱的中枢',
						ja: '脆い政治中枢'
					},
					summary: {
						en: 'A ceasefire body that can authorize peace faster than war only when its information stays clean.',
						zh: '一个理论上能比战争更快地下达和平命令的停火中枢，前提是它看到的情报还没有被污染。',
						ja: '情報が汚染されていないときに限り、戦争より速く平和命令を出せる停戦中枢です。'
					}
				},
				{
					name: {
						en: 'Beacon Saboteurs',
						zh: '信标破坏者',
						ja: 'ビーコン破壊工作員'
					},
					role: {
						en: 'Chaos brokers',
						zh: '混乱贩子',
						ja: '混乱の仲介人'
					},
					summary: {
						en: 'An underground network that weaponizes false coordinates so border forces exhaust themselves without a battle.',
						zh: '一张专门利用假坐标制造内耗的地下网络，他们最想看到的并不是开战，而是所有人自己把自己拖垮。',
						ja: '偽の座標で国境側の兵力を自滅させる地下ネットワークで、狙いは開戦そのものよりも、相手を自壊させることです。'
					}
				},
				{
					name: {
						en: 'Frontier Convoys',
						zh: '前线车队',
						ja: '前線車列'
					},
					role: {
						en: 'Lives on the line',
						zh: '真正压在线上的人',
						ja: '本当に線上にいる者たち'
					},
					summary: {
						en: 'Medical and archive convoys whose routes decide whether the accord remains a document or becomes reality.',
						zh: '运送药品、档案和停火正本的前线车队；协定能不能活着，最后都落在他们的轮子能不能继续往前滚。',
						ja: '医薬品、記録文書、停戦原本を運ぶ前線車列で、協定が紙のまま終わるか現実になるかは彼らの車輪にかかっています。'
					}
				}
			],
			epilogue: {
				en: 'A clean command finish does not make the border beautiful. It makes it quiet enough for people to sleep through the rest of the night. When the sun finally comes up over the Gray Wall, that is victory here: not triumph, but the absence of fresh graves and one more day in which the accord still means something.',
				zh: '这场指挥战役打赢了，也不会把边境线变得好看。它只会把这里重新压回一种足够安静的状态，让普通人还能睡完整个后半夜。等太阳真的从灰墙上升起来的时候，这里所谓的胜利也从来不是凯旋，而是没有再多出新的坟，没有哪座城因为你的失手多死一批人，以及这份协定在今天依然还算一份协定。',
				ja: 'この指揮戦に勝っても、国境が美しくなるわけではありません。ただ人々が残りの夜を眠れる程度には静かになります。グレイウォールの向こうに朝日が昇るとき、ここでの勝利とは凱旋ではなく、新しい墓が増えなかったこと、そして協定が今日もなお協定として機能したという事実です。'
			}
		},
		missionPreviews: [
			{
				id: 'first-smoke',
				title: {
					en: 'Where the first smoke rose',
					zh: '第一缕烟从哪里升起',
					ja: '最初の煙が上がった場所'
				},
				summary: {
					en: 'The Gray Wall Accord begins to shake when one border beacon reports smoke on the wrong horizon. Open in Europe and identify where the first real breach began.',
					zh: '“灰墙协定”真正开始摇晃，是因为有一座边境信标把烟火报错了方向。先从欧洲开局，找出第一处真正出事的裂口。',
					ja: 'グレイウォール協定が揺れ始めたのは、ある境界ビーコンが煙の方向を誤報した瞬間でした。ヨーロッパ側から、本当の裂け目が最初に開いた地点を探します。'
				},
				quizSlug: 'europe-countries-quiz',
				dialogue: {
					briefing: {
						en: 'Two capitals are already blaming each other. The only honest witness is a beacon camera that caught smoke drifting the wrong way across the dawn wind.',
						zh: '两边首都已经开始互相甩锅了。眼下唯一还算老实的证人，是一台拍到“烟飘反方向”的边境信标摄像机。',
						ja: '両側の首都はすでに責任の押し付け合いを始めています。今のところ正直なのは、煙が風向きと逆に流れる映像を残した境界ビーコンだけです。'
					},
					objective: {
						en: 'The first real crack opened at {target}. Name it, and command can stop chasing the wrong smoke.',
						zh: '第一道真正的裂口开在 {target}。把这里先点出来，指挥席才不会继续追着假烟跑。',
						ja: '最初の本当の裂け目は {target} にあります。そこを押さえれば、司令部は偽の煙を追わずに済みます。'
					},
					confirm: {
						en: '{selection} is marked as the opening breach. Confirm it before the council sends troops at shadows.',
						zh: '{selection} 已被你标成初始裂口。赶在议会对着影子派兵之前，先确认它。',
						ja: '{selection} を最初の裂け目として記録しました。評議会が影に向かって兵を送る前に確定します。'
					},
					success: {
						en: '{selection} is the true opening front. Half the panic traffic on the crisis net dies instantly.',
						zh: '{selection} 就是真正的起爆点。危机网络里一半乱飞的警报，当场就哑了一截。',
						ja: '{selection} が本当の起点でした。危機ネットを飛び交っていた半分の誤警報がその場で沈みます。'
					},
					failure: {
						en: '{selection} only carries rumor smoke. The real breach is still burning at {target}.',
						zh: '{selection} 只有谣言，没有火。真正的裂口还在 {target} 往外冒烟。',
						ja: '{selection} にあるのは噂だけで火ではありません。本当の裂け目はまだ {target} で煙を上げています。'
					},
					footerObjective: {
						en: 'Start with the first true breach. Every other order depends on it.',
						zh: '先把第一道真裂口找对，后面所有命令才有意义。',
						ja: '最初の本物の裂け目を当ててください。以後の命令はすべてそこに依存します。'
					},
					footerConfirm: {
						en: 'One clean lock now is worth a hundred shouting ministers.',
						zh: '你现在这一份干净判断，比一百个吵架的部长都有用。',
						ja: '今ここでの一つの正確な固定は、百人の大臣の怒鳴り合いより価値があります。'
					},
					footerSuccess: {
						en: 'The smoke has a source. Push south before the false alarms regroup.',
						zh: '烟已经找到源头了。趁假警报还没重新聚起来，立刻压南线。',
						ja: '煙の源は見えました。偽警報が再集合する前に南線へ押し込みます。'
					},
					footerFailure: {
						en: 'Wrong horizon. Reset the board and read the wind again.',
						zh: '看错天边了。重开推演板，再读一次风向。',
						ja: '空を見誤りました。盤面を開き直し、風向きをもう一度読みます。'
					}
				}
			},
			{
				id: 'southern-false-alarm',
				title: {
					en: 'The southern false alarm',
					zh: '南线假警报',
					ja: '南線の偽警報'
				},
				summary: {
					en: 'Someone is bouncing fake distress pings through the southern relay network to pull every convoy off balance. Shift south and cut the lie before it empties the frontier.',
					zh: '有人正在借南线中继站连续弹射假求救信号，想把所有车队都从正轨上骗开。转向南线，先把这句谎话截断，别让整条边境补给被掏空。',
					ja: '誰かが南側リレーネットを使って偽の救難信号を連射し、すべての車列を釣り出そうとしています。南線へ回り込み、その嘘を断って前線補給の空洞化を止めます。'
				},
				quizSlug: 'africa-countries-quiz',
				dialogue: {
					briefing: {
						en: 'Supply captains are turning south on panic orders that were never signed. Whoever planted them understands how fear travels faster than wheels.',
						zh: '南下的补给车队正在执行一批根本没人签过字的紧急命令。放假警报的人很懂一件事: 恐慌永远比车轮跑得快。',
						ja: '補給車列は、誰も署名していない緊急命令で南へ曲げられています。偽警報を仕掛けた相手は一つ知っています。恐怖は車輪より速く走るということです。'
					},
					objective: {
						en: 'The fake distress relay anchors at {target}. Cut it there and the southern convoys will stop bleeding away.',
						zh: '那串假求救信号的锚点在 {target}。从这里切断它，南线车队才不会继续被一点点放空。',
						ja: '偽救難信号の錨点は {target} にあります。そこで切れば、南線の車列はこれ以上吸い取られません。'
					},
					confirm: {
						en: '{selection} is ready for shutdown. Confirm if this is the relay tower feeding the panic.',
						zh: '{selection} 已经被你推到断电名单上了。如果这就是那座喂大恐慌的中继塔，现在就拍板。',
						ja: '{selection} を遮断候補に載せました。恐慌を増幅している中継塔なら、今ここで確定します。'
					},
					success: {
						en: '{selection} was the panic relay. Southern convoy routes straighten on the board almost immediately.',
						zh: '{selection} 就是那座恐慌中继塔。南线车队的路线几乎是立刻就在推演板上重新拉直了。',
						ja: '{selection} が恐慌中継塔でした。南線の車列ルートが盤上ですぐにまっすぐ戻ります。'
					},
					failure: {
						en: '{selection} is noise, not the source. The real relay still flashes through {target}.',
						zh: '{selection} 只是噪声，不是源头。真正的中继闪点还在 {target} 一下一下往外跳。',
						ja: '{selection} はノイズであって源ではありません。本当の中継点はまだ {target} で点滅しています。'
					},
					footerObjective: {
						en: 'Stop the fake distress line, and the real convoys can breathe.',
						zh: '把假求救线掐掉，真正的车队才能喘口气。',
						ja: '偽救難ラインを止めれば、本当の車列が息をつけます。'
					},
					footerConfirm: {
						en: 'A mistaken shutdown here strands the wrong people. Be exact.',
						zh: '这里一旦误切，困住的就是不该困住的人。要准。',
						ja: 'ここでの誤遮断は、助けるべき人を足止めします。正確に。'
					},
					footerSuccess: {
						en: 'South line stabilized. Time to find who is steering the fear.',
						zh: '南线稳住了。现在该顺着恐慌去找那个握方向盘的人。',
						ja: '南線は安定しました。次は恐怖を操っている手を追います。'
					},
					footerFailure: {
						en: 'The panic circuit is still live. Open the relay map again.',
						zh: '恐慌回路还活着。重开中继图。',
						ja: '恐慌回路はまだ生きています。中継図を開き直します。'
					}
				}
			},
			{
				id: 'broken-bridge-convoy',
				title: {
					en: 'The convoy at the broken bridge',
					zh: '断桥上的车队',
					ja: '壊れた橋の車列'
				},
				summary: {
					en: 'With the fake pings cut, a real convoy finally speaks: it is stalled at a broken crossing and carrying the accord archives. Find the route that keeps the treaty alive.',
					zh: '假信号被掐掉后，真正的车队终于发回了声音: 它被困在一座断桥前，车里装着整份停火协定的正本档案。你得找到那条还能让条约活下去的通路。',
					ja: '偽信号を止めた途端、本物の車列がようやく声を返しました。壊れた橋の前で立ち往生し、荷台には停戦協定の正本書類が載っています。協定を生かす経路を見つけます。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: 'The convoy commander sounds calm in the way only exhausted people do. If the archive truck does not move tonight, the ceasefire vote dies with it.',
						zh: '车队指挥官的声音很平静，平静得只像一种极度疲惫。那辆档案车今晚如果不过桥，明早的停火表决就会跟着一起死。',
						ja: '車列指揮官の声は、不自然なほど落ち着いています。今夜あの文書車が渡れなければ、明朝の停戦採決もそこで終わります。'
					},
					objective: {
						en: 'The archive convoy can still be rerouted through {target}. Call it, and the bridge crisis becomes survivable.',
						zh: '档案车队还能从 {target} 绕过去。只要你现在叫准，断桥危机就还有得救。',
						ja: '文書車列はまだ {target} 経由で迂回できます。今ここで言い当てれば、橋の危機はまだ越えられます。'
					},
					confirm: {
						en: '{selection} is your reroute call. Confirm if that road is still open enough to carry the accord.',
						zh: '{selection} 是你给出的改道点。如果那条路还撑得住协定正本，就现在确认。',
						ja: '{selection} があなたの迂回案です。その道がまだ協定文書を通せるなら、今確定します。'
					},
					success: {
						en: '{selection} holds. The convoy starts moving again, and the archives stay alive.',
						zh: '{selection} 还撑得住。车队重新动起来了，协定正本也跟着活下来了。',
						ja: '{selection} はまだ持ちます。車列が再び動き出し、協定文書も生き残ります。'
					},
					failure: {
						en: '{selection} is already dead road. The last viable detour still runs through {target}.',
						zh: '{selection} 那条路已经死了。最后一条还能走的绕行线，仍然压在 {target} 上。',
						ja: '{selection} の道はもう死んでいます。最後に残る迂回線はまだ {target} を通っています。'
					},
					footerObjective: {
						en: 'This call does not move soldiers. It moves the treaty itself.',
						zh: '这一判断调动的已经不是士兵了，而是整份条约本身。',
						ja: 'ここで動くのは兵ではなく、協定そのものです。'
					},
					footerConfirm: {
						en: 'One exact reroute now saves hours the diplomats do not have.',
						zh: '你现在的一次准确改道，能替那些外交官省下他们根本没有的几个小时。',
						ja: '今の一度の正確な迂回が、外交官たちに存在しない数時間を与えます。'
					},
					footerSuccess: {
						en: 'The archives are moving. Now find who wanted them stranded.',
						zh: '档案车重新滚起来了。下一步，去找那个想把它永远困在桥边的人。',
						ja: '文書車が再び走り出しました。次はそれを橋の前で止めたがった人物を追います。'
					},
					footerFailure: {
						en: 'That road is gone. Search the map for the last live line.',
						zh: '那条路没了。去地图上把最后一根还活着的线挖出来。',
						ja: 'その道は終わっています。地図から最後の生きた線を掘り出します。'
					}
				}
			},
			{
				id: 'black-box-council',
				title: {
					en: 'The black box before council',
					zh: '议会前的黑盒',
					ja: '評議会前のブラックボックス'
				},
				summary: {
					en: 'A surveillance balloon falls out of the sky and leaves behind a black box with one surviving coordinate chain. Read it before the council session opens.',
					zh: '一枚监视气球从夜空里掉了下来，只留下一个还没烧掉的黑盒和一串坐标残片。赶在议会开场前，把它读懂。',
					ja: '監視気球が夜空から落ち、燃え残ったブラックボックスと座標の断片だけが残りました。評議会が始まる前に読み切ります。'
				},
				quizSlug: 'europe-countries-quiz',
				dialogue: {
					briefing: {
						en: 'Inside the black box is not footage, but routing metadata. Someone tried to erase their fingerprints and accidentally preserved them.',
						zh: '黑盒里存下来的不是影像，而是一串调度元数据。有人想把指纹擦干净，结果反而把自己的手势留在了里面。',
						ja: 'ブラックボックスに残っていたのは映像ではなくルーティングのメタデータでした。痕跡を消そうとした誰かが、かえって自分の癖を焼き付けています。'
					},
					objective: {
						en: 'The surviving coordinate chain converges on {target}. Name it, and we can point the council at a culprit instead of a rumor.',
						zh: '那串烧剩下的坐标最后都收束到 {target}。只要你说准，议会面前摆着的就不再是谣言，而是嫌疑人。',
						ja: '燃え残った座標列は最後に {target} へ収束します。そこを言い当てれば、評議会に示すのは噂ではなく容疑者です。'
					},
					confirm: {
						en: '{selection} is flagged on the council display. Confirm if this is where the sabotage chain was directed.',
						zh: '{selection} 已经被抬上议会大屏了。如果整条破坏链真是朝这里指过去的，就现在确认。',
						ja: '{selection} を評議会の表示板に出しました。妨害連鎖が本当にここを指しているなら今確定します。'
					},
					success: {
						en: '{selection} is the hand behind the beacons. For the first time tonight, the room goes quiet for the right reason.',
						zh: '{selection} 就是那只在信标背后动手的手。今夜第一次，整个议会大厅是因为真相而安静下来。',
						ja: '{selection} がビーコンを操っていた手でした。今夜初めて、評議会の部屋が正しい理由で静まります。'
					},
					failure: {
						en: '{selection} does not close the chain. The black box still points toward {target}.',
						zh: '{selection} 合不上这条链。黑盒留下来的最后一指，还是在 {target}。',
						ja: '{selection} では連鎖が閉じません。ブラックボックスの最後の指先はまだ {target} を向いています。'
					},
					footerObjective: {
						en: 'Tonight the council needs a name, not another speech.',
						zh: '今晚议会需要的不是一段演讲，而是一个名字。',
						ja: '今夜の評議会に必要なのは演説ではなく、一つの名前です。'
					},
					footerConfirm: {
						en: 'Once you confirm, the accusation becomes official record.',
						zh: '你一确认，这份指控就会写进正式记录。',
						ja: 'この確認で、告発は正式記録になります。'
					},
					footerSuccess: {
						en: 'The saboteur has a face. Now keep the frontier alive until sunrise.',
						zh: '破坏者终于有了脸。最后一步，把边境线撑到日出。',
						ja: '破壊者に顔がつきました。あとは夜明けまで前線を持たせます。'
					},
					footerFailure: {
						en: 'The room cannot move on guesswork. Read the chain again.',
						zh: '议会不能拿猜测投票。再读一次这条链。',
						ja: '推測だけでは採決できません。連鎖をもう一度読みます。'
					}
				}
			},
			{
				id: 'sunrise-order',
				title: {
					en: 'The order that holds till sunrise',
					zh: '撑到日出的最后一令',
					ja: '夜明けまで持たせる最後の命令'
				},
				summary: {
					en: 'The saboteur is named, but the frontier still has to survive the night. Issue the final order that keeps the ceasefire intact until the sun comes up.',
					zh: '人已经揪出来了，可边境线还得真的撑过这一夜。下出最后一令，让停火协议活到太阳升起。',
					ja: '犯人は名指しできましたが、前線はまだ一晩を生き延びなければなりません。夜明けまで停戦を保つ最後の命令を下します。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: 'Every feed in the room now waits on you. Not because they trust command, but because command is all that remains.',
						zh: '整个大厅所有屏幕现在都在等你，不是因为他们突然信任指挥席了，而是因为此刻真的只剩指挥席还能让事情继续往前走。',
						ja: '部屋中のすべての画面が今あなたを待っています。司令部が信頼されたからではなく、残っているのが司令部しかないからです。'
					},
					objective: {
						en: 'The final stabilizing order has to land on {target}. Get it right, and the ceasefire lives through dawn.',
						zh: '最后那道稳局命令，必须落在 {target}。只要你这次不失手，停火线就能硬撑到天亮。',
						ja: '最後の安定化命令は {target} に落とさなければなりません。ここを外さなければ、停戦線は夜明けまで持ちます。'
					},
					confirm: {
						en: '{selection} is loaded as the final order destination. Confirm if you are ready to hold the frontier together.',
						zh: '{selection} 已经被装入最后一道命令的落点。如果你准备好把整条边境线缝回去，就现在确认。',
						ja: '{selection} を最後の命令先に読み込みました。前線全体を縫い戻すなら、今確定します。'
					},
					success: {
						en: '{selection} takes the order. The frontier steadies, and the Gray Wall Accord survives the night.',
						zh: '{selection} 接住了最后一令。边境线慢慢稳下来，“灰墙协定”总算熬过了这一夜。',
						ja: '{selection} が最後の命令を受けました。前線は静まり、グレイウォール協定は一夜を越えます。'
					},
					failure: {
						en: '{selection} cannot hold the final line. The order still needs to land at {target}.',
						zh: '{selection} 撑不起最后这条线。那道命令真正该落下的地方，还是 {target}。',
						ja: '{selection} では最後の線を持たせられません。命令はまだ {target} に落とす必要があります。'
					},
					footerObjective: {
						en: 'Last order. After this, the map either calms down or fractures for everyone.',
						zh: '最后一令。过了这一步，这张地图要么平下来，要么一起碎给所有人看。',
						ja: '最後の命令です。この一手の後、地図は静まるか、全員の前で割れるかのどちらかです。'
					},
					footerConfirm: {
						en: 'No second draft. This order is the sunrise line.',
						zh: '没有第二稿了。这道命令，就是日出线。',
						ja: '第二案はありません。この命令が夜明け線です。'
					},
					footerSuccess: {
						en: 'Frontier held. Accord intact. Night command complete.',
						zh: '边境守住了，协定也保住了，这一夜的指挥到此收束。',
						ja: '前線は保たれ、協定も守られました。夜通しの指揮はここで完了です。'
					},
					footerFailure: {
						en: 'The line is still slipping. Re-issue the final order fast.',
						zh: '边境线还在滑。立刻重下最后一令。',
						ja: '前線はまだ滑っています。すぐに最後の命令を再発行します。'
					}
				}
			}
		]
	},
	{
		slug: 'whiteout-escape',
		templateId: 'escape',
		accent: 'emerald',
		title: {
			en: 'Whiteout Escape',
			zh: '白障逃生',
			ja: 'ホワイトアウト脱出'
		},
		summary: {
			en: 'The map is vanishing inside a whiteout. Chase the dying beacons and cut Polaris Six out of the storm before the last horizon disappears.',
			zh: '整张地图正在白障里消失。追着快死掉的信标往前冲，在最后一道地平线沉下去之前，把“北辰六号”从风暴里劈出去。',
			ja: '地図そのものがホワイトアウトの中で消えています。消えかけたビーコンを追い、最後の水平線が沈む前にポラリス・シックスを嵐から切り出します。'
		},
		premise: {
			en: 'Survey ship Polaris Six has one surviving navigator and a beacon chain that keeps blinking out ahead of the hull. Every correct country lock turns one more light back on and keeps the storm from closing over you.',
			zh: '勘测船“北辰六号”只剩下一名还能看图的领航员，而船头前方的信标链正在一盏一盏往黑里掉。你每锁定一个正确国家，就能把一盏灯重新点亮，让风暴别那么快把你们全吞进去。',
			ja: '測量船ポラリス・シックスには、もう一人しか地図を読める航法士が残っていません。船首前方のビーコン列は一灯ずつ闇へ落ちています。正しい国を一つ固定するたび、一つの灯が戻り、嵐が船を飲み込む速度を遅らせます。'
		},
		seoTitle: {
			en: 'Whiteout Escape Campaign | MapQuiz.pro',
			zh: '白障逃生战役 | MapQuiz.pro',
			ja: 'ホワイトアウト脱出キャンペーン | MapQuiz.pro'
		},
		seoDescription: {
			en: 'Play an official AI escape campaign about a survey ship in whiteout, fading beacons, and one last route through the storm.',
			zh: '体验官方 AI 逃生战役，沿着白障中的勘测船、熄灭中的信标和最后一条生路一路冲出去。',
			ja: 'ホワイトアウトの測量船、消えゆくビーコン、嵐を抜ける最後の航路を描く公式 AI 脱出キャンペーンです。'
		},
		durationMinutes: 3,
		missionCount: 4,
		difficulty: 'intense',
		audience: 'general',
		launchQuizSlug: 'americas-countries-quiz',
		relatedQuizSlugs: [
			'americas-countries-quiz',
			'world-map-quiz',
			'oceania-countries-quiz'
		],
		remixPromptExamples: {
			en: [
				'Make this a treasure-hunt escape.',
				'Turn it into a student version with softer tension.',
				'Set it in the Pacific instead.'
			],
			zh: [
				'改成寻宝逃生。',
				'改成更适合学生、压力更柔和的版本。',
				'改到太平洋区域。'
			],
			ja: [
				'宝探し風の脱出にする。',
				'緊張を少し抑えた学習者向けにする。',
				'舞台を太平洋側に変える。'
			]
		},
		story: {
			prologue: {
				en: 'Polaris Six went into the storm to chart safer winter passages. Then the storm changed shape and started erasing the chart faster than the crew could write it down. By the time your link reaches the bridge, the ship has lost most of its outer sensors, the horizon has turned into white static, and the crew are following a chain of fading beacons they no longer fully trust. Your job is simple only on paper: read what little the map still reveals, keep the escape corridor alive, and drag the ship back out before the whiteout closes over every direction at once.',
				zh: '“北辰六号”原本是去风暴边缘测一条更安全的冬季航道。结果风暴先变了形，而且抹掉航图的速度比船员记录它的速度还快。等你接入舰桥的时候，船外大部分传感器已经瞎了，地平线只剩一整片发白的噪声，整艘船正沿着一串自己都快不敢信的信标往前摸。纸面上你的任务很简单: 读出地图还肯留下来的那点信息，让逃生走廊别断掉，然后在白障把所有方向一起吞没之前，把整艘船从里面拖出来。',
				ja: 'ポラリス・シックスは、より安全な冬季航路を測るため嵐へ入りました。ところが嵐は形を変え、乗組員が書き留めるより速く海図を消し始めます。あなたが艦橋へ接続したときには、外部センサーの大半は沈黙し、水平線は白いノイズへ変わり、船は自分たちでさえ信じきれないビーコン列を頼りに進んでいました。紙の上では単純です。地図がまだ残している断片を読み、脱出回廊を切らさず、白障が全方向を一度に飲み込む前に船を外へ引きずり出すこと。'
			},
			factions: [
				{
					name: {
						en: 'Polaris Six Crew',
						zh: '北辰六号船员',
						ja: 'ポラリス・シックス乗組員'
					},
					role: {
						en: 'Survivors inside the storm',
						zh: '被困风暴中的生还者',
						ja: '嵐の中の生存者'
					},
					summary: {
						en: 'A survey crew held together by procedure, stubbornness, and the hope that one more beacon can still turn into a route.',
						zh: '一群靠流程、硬撑和“下一盏灯也许还能接成路”这种念头死死顶住的勘测船员。',
						ja: '手順と頑固さ、そして「次の灯もまだ航路になりうる」という希望だけで持ちこたえている測量船の乗組員です。'
					}
				},
				{
					name: {
						en: 'Whiteout Front',
						zh: '白障前沿',
						ja: 'ホワイトアウト前線'
					},
					role: {
						en: 'The enemy environment',
						zh: '真正的敌人',
						ja: '本当の敵'
					},
					summary: {
						en: 'Not a faction of people, but a weather system so unstable it behaves like a hunter closing every false move.',
						zh: '它不是一个组织，而是一套像猎手一样会惩罚每一次误判的极端天气系统；你每走错一步，它就把出口关得更小一点。',
						ja: '人間の勢力ではなく、誤判断のたびに出口を狭めてくる、狩人のように振る舞う極端な気象系そのものです。'
					}
				},
				{
					name: {
						en: 'Ghost Harbor Network',
						zh: '幽港信标网',
						ja: '幽霊港ビーコン網'
					},
					role: {
						en: 'Possible way out',
						zh: '唯一可能的出口',
						ja: '唯一の可能な出口'
					},
					summary: {
						en: 'A half-legend chain of remote docking lights that may be illusion, trap, or the only infrastructure still answering through the storm.',
						zh: '一条半传说性质的远端港灯网络，可能是幻象，可能是陷阱，也可能是暴风里唯一还愿意回答你们的基础设施。',
						ja: '幻か罠か、それとも嵐の中でまだ返答してくれる唯一のインフラかもしれない、半ば伝説化した遠隔港灯ネットワークです。'
					}
				}
			],
			epilogue: {
				en: 'If you cut through the storm edge, Polaris Six does not emerge looking heroic. Ice hangs from every rail, the crew move like people who have been awake for a week, and the first visible horizon almost hurts to look at. That is exactly why the finish matters. In this campaign, survival is not a cinematic ending. It is the hard, bright fact that a ship, a crew, and a map all managed to remain real after the storm tried to erase them.',
				zh: '如果你真的把“北辰六号”拖出了风暴，它也不会是一副英雄凯旋的样子。每根栏杆都挂着冰壳，船员走路像连续醒了一个星期的人，重新看见地平线的那一刻甚至会刺眼到让人不敢直视。也正因为这样，这个结局才有分量。在这条战役里，活下来从来不是什么电影式的收尾，而是一个很硬的事实: 这艘船、这群人，还有他们手里那张地图，在风暴拼命想把一切抹掉之后，依然还是真的。',
				ja: 'ポラリス・シックスが本当に嵐を抜けても、英雄の凱旋には見えません。手すりには氷が垂れ、乗組員は一週間眠っていない人間のように歩き、久しぶりの水平線はむしろ目に痛いほどです。だからこそ、この結末には重みがあります。このキャンペーンでの生還とは映画的なエンディングではなく、船と乗組員と地図が、消されそうになりながらも現実として残ったという、ただそれだけの硬い事実です。'
			}
		},
		missionPreviews: [
			{
				id: 'warm-beacon',
				title: {
					en: 'The last warm beacon',
					zh: '最后一枚余温信标',
					ja: '最後のぬくもりを持つビーコン'
				},
				summary: {
					en: 'Polaris Six catches one surviving heat signature in the Americas before the storm shutters the glass. Find that first warm beacon and give the ship a direction.',
					zh: '“北辰六号”在美洲侧只捕到一枚还带余温的信标，随后风暴就把观测窗彻底拍黑。先把这盏灯找出来，给整艘船一个还算像样的方向。',
					ja: 'ポラリス・シックスは、嵐が窓を閉ざす直前にアメリカ側で一つだけ熱を残したビーコンを拾いました。その最初の灯を見つけ、船に進む方向を与えます。'
				},
				quizSlug: 'americas-countries-quiz',
				dialogue: {
					briefing: {
						en: 'The storm took the stars first, then the coastlines. All you have now is a blinking dot with a heartbeat still trapped inside it.',
						zh: '风暴先吃掉了星星，然后吃掉了海岸线。现在你手里只剩一个还在跳的光点，像是有人把最后一点心跳塞进了它里面。',
						ja: '嵐はまず星を奪い、次に海岸線を奪いました。今残っているのは、鼓動のように点滅する一つの光点だけです。'
					},
					objective: {
						en: 'That last warm beacon is at {target}. Lock it, and Polaris Six gets one more heading before the glass freezes over.',
						zh: '最后那枚还带余温的信标就在 {target}。只要你把它锁准，“北辰六号”就能在观测窗彻底结霜前再拿到一次航向。',
						ja: '最後に熱を残したビーコンは {target} にあります。そこを固定すれば、窓が凍りきる前にもう一度だけ針路を得られます。'
					},
					confirm: {
						en: '{selection} is marked as the heat source. Confirm if this is the light we chase into the storm.',
						zh: '{selection} 已被标成热源了。如果这就是我们要追进去的那盏灯，现在确认。',
						ja: '{selection} を熱源としてマークしました。嵐の中へ追うべき灯なら今確定します。'
					},
					success: {
						en: '{selection} is alive. The bridge lights answer back, and the bow finally points somewhere real.',
						zh: '{selection} 还活着。舰桥的指示灯一下子跟着亮起来，船头终于重新指向了一个真实的地方。',
						ja: '{selection} はまだ生きています。艦橋の計器灯が応え、船首がようやく本物の方角を向きます。'
					},
					failure: {
						en: '{selection} is only reflected ice. The true warm signal still flickers at {target}.',
						zh: '{selection} 只是冰层反光。真正还在发热的那一点，仍然在 {target} 一闪一闪。',
						ja: '{selection} は氷の反射にすぎません。本当の熱信号はまだ {target} で脈打っています。'
					},
					footerObjective: {
						en: 'First light first. Without it, there is no route to save.',
						zh: '先把第一盏灯点回来。没有它，就根本谈不上路线。',
						ja: '最初の灯を戻してください。それがなければ、そもそも航路がありません。'
					},
					footerConfirm: {
						en: 'One beacon call now decides whether the ship drifts or moves.',
						zh: '你现在这一声报点，决定这艘船接下来是漂着，还是动起来。',
						ja: '今の一度のビーコン確定で、この船が漂うか進むかが決まります。'
					},
					footerSuccess: {
						en: 'A heading survives. Push into open water.',
						zh: '航向保住了。顶着风往外海冲。',
						ja: '針路は生き残りました。外洋へ押し出します。'
					},
					footerFailure: {
						en: 'The bridge is still blind. Hunt the real heat source.',
						zh: '舰桥还瞎着。去把真正的热源找出来。',
						ja: '艦橋はまだ盲目です。本当の熱源を探します。'
					}
				}
			},
			{
				id: 'reverse-tide',
				title: {
					en: 'The reverse tide',
					zh: '反向潮汐',
					ja: '逆潮'
				},
				summary: {
					en: 'Out on blind water, the storm starts pushing Polaris Six toward a false current that looks safe from every short-range panel. Pull back to world scale and avoid the trap.',
					zh: '船一旦冲进看不见边的海面，风暴就开始把“北辰六号”往一股看起来很安全、实际上会把人带进死圈的假潮里推。把视角拉回世界尺度，别让整艘船被顺着骗走。',
					ja: '外洋へ出た瞬間、嵐はポラリス・シックスを短距離パネルでは安全に見える偽の潮流へ押し始めます。視点を世界へ引き戻し、その罠を避けます。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: 'The ocean has become a white wall with moving teeth. The ship keeps trying to trust the nearest calm patch, and every calm patch is lying.',
						zh: '整片海现在像一堵会咬人的白墙。船总想朝最近那块看起来平静的地方靠，可眼下每一块“平静”都在撒谎。',
						ja: '海は動く牙を持つ白い壁になりました。船は近くの静かな場所を信じたがりますが、その静けさはすべて嘘です。'
					},
					objective: {
						en: 'The false current breaks if you read {target} correctly. Call that anchor and we can turn against the tide instead of with it.',
						zh: '这股假潮的伪装，只有在你把 {target} 读准时才会裂开。报对这个锚点，我们才能逆着潮汐活下去，而不是顺着它沉下去。',
						ja: '偽潮流の化けの皮は {target} を正しく読んだときにだけ裂けます。その錨点を押さえれば、潮に流されるのではなく、潮へ逆らえます。'
					},
					confirm: {
						en: '{selection} is lined up as the tide anchor. Confirm if this is the point that lets us turn the hull.',
						zh: '{selection} 已被你压成潮汐锚点了。如果船头真要靠这里才能拧过去，就现在确认。',
						ja: '{selection} を潮の錨点に合わせました。船首を切り返す基点なら今確定します。'
					},
					success: {
						en: '{selection} bites into the storm like a hook. Polaris Six finally turns instead of drifting.',
						zh: '{selection} 像一枚钩子一样咬进了风暴里。“北辰六号”终于不是继续漂，而是真正开始转向了。',
						ja: '{selection} が鉤のように嵐へ食い込みました。ポラリス・シックスはようやく流されるのでなく、自力で向きを変えます。'
					},
					failure: {
						en: '{selection} cannot hold the turn. The only real tide anchor still sits at {target}.',
						zh: '{selection} 扛不住这次转向。真正能挂住船身的潮汐锚点，仍然在 {target}。',
						ja: '{selection} では船体を支えられません。本当の潮汐錨点はまだ {target} にあります。'
					},
					footerObjective: {
						en: 'Think bigger than the waves. The trap only works up close.',
						zh: '别只看浪头，要看整片海。这个陷阱只有贴近了才像真的。',
						ja: '波だけを見るな。海全体を見てください。この罠は近くでだけ本物に見えます。'
					},
					footerConfirm: {
						en: 'This turn either opens the ocean or seals it shut.',
						zh: '这一下转向，要么把海面打开，要么把它彻底封死。',
						ja: 'この転回で海が開くか、完全に閉じるかが決まります。'
					},
					footerSuccess: {
						en: 'The ship has bite again. Chase the next light.',
						zh: '船重新咬住方向了。去追下一盏灯。',
						ja: '船は再び方向を噛みました。次の灯を追います。'
					},
					footerFailure: {
						en: 'The current is still faking calm. Reopen the wide chart.',
						zh: '那股潮还在装平静。重开大图。',
						ja: '潮流はまだ平静を装っています。広域チャートを開き直します。'
					}
				}
			},
			{
				id: 'ghost-harbor',
				title: {
					en: 'The ghost harbor',
					zh: '幽蓝港口',
					ja: '青い亡霊港'
				},
				summary: {
					en: 'A harbor light appears in Oceania where no harbor should exist on the storm chart. It may be a trap, or the only gate left. Read it before the whiteout closes again.',
					zh: '大洋洲方向忽然亮起一座本不该出现在风暴图上的港灯。它可能是陷阱，也可能是今晚唯一还没沉掉的门。趁白障再次合上前，把它看清。',
					ja: 'オセアニア側に、嵐の海図には存在しないはずの港灯が現れました。罠かもしれないし、今夜最後に残った門かもしれません。ホワイトアウトが閉じる前に見極めます。'
				},
				quizSlug: 'oceania-countries-quiz',
				dialogue: {
					briefing: {
						en: 'The deck crew is calling it a ghost harbor because nobody believes anything can still be waiting ahead. The navigator beside you says ghosts do not broadcast docking codes.',
						zh: '甲板上的人都管那地方叫“幽灵港”，因为没人相信前面居然还能有东西在等你。站在你旁边的领航员却只说了一句: 幽灵不会发靠泊报码。',
						ja: '甲板員たちはそこを幽霊港と呼び始めました。あの先に何かが待っているとは誰も信じられないからです。隣の航法士は一言だけ返します。幽霊は接岸コードを打たない、と。'
					},
					objective: {
						en: 'If the harbor light is real, it belongs to {target}. Call it correctly and we gain one living port inside the storm.',
						zh: '如果那盏港灯是真的，它就该属于 {target}。只要你这次报得准，我们就等于在风暴里抢回来一座活港。',
						ja: 'あの港灯が本物なら、属する先は {target} です。ここを言い当てれば、嵐の中に一つの生きた港を奪い返せます。'
					},
					confirm: {
						en: '{selection} is set as the harbor light. Confirm if this is where the storm finally leaves us a door.',
						zh: '{selection} 已经被你定成港灯坐标了。如果风暴真的还肯留一扇门给我们，就在这里确认。',
						ja: '{selection} を港灯座標に設定しました。嵐がまだ扉を残しているなら、ここで確定します。'
					},
					success: {
						en: '{selection} is real harbor, not mirage. The docking code answers, and half the bridge forgets to breathe.',
						zh: '{selection} 不是海市蜃楼，而是真的港。靠泊报码一响起来，半个舰桥都忘了呼吸。',
						ja: '{selection} は蜃気楼ではなく本物の港でした。接岸コードが返り、艦橋の半分が息を止めます。'
					},
					failure: {
						en: '{selection} is ghost light only. The true harbor signal still waits at {target}.',
						zh: '{selection} 只是幽光，不是港。真正还在回应的信号，仍然守在 {target}。',
						ja: '{selection} はただの幽光でした。本当に応答している港信号はまだ {target} にあります。'
					},
					footerObjective: {
						en: 'Treat the light like a key, not comfort. We only need one door.',
						zh: '别把那盏灯当安慰，要把它当钥匙。我们只需要一扇门。',
						ja: 'あの灯を慰めだと思わず、鍵だと思ってください。必要なのは一つの扉だけです。'
					},
					footerConfirm: {
						en: 'If this harbor is real, it changes the whole escape.',
						zh: '这座港要是真的，整场逃生都会改写。',
						ja: 'この港が本物なら、脱出全体が書き換わります。'
					},
					footerSuccess: {
						en: 'Harbor secured. One final jump and the storm edge is in reach.',
						zh: '港拿下来了。再跳最后一段，风暴边缘就摸得到了。',
						ja: '港を確保しました。あと一跳びで嵐の縁へ届きます。'
					},
					footerFailure: {
						en: 'The light lied. Search the blue static again.',
						zh: '这束光在骗人。回去把那片蓝噪重新扫一遍。',
						ja: 'その光は嘘をついていました。青いノイズをもう一度走査します。'
					}
				}
			},
			{
				id: 'storm-edge',
				title: {
					en: 'Cut through the storm edge',
					zh: '劈开白障边缘',
					ja: '白障の縁を切り裂く'
				},
				summary: {
					en: 'You have one real harbor, one surviving route, and almost no hull warmth left. Make the final lock that carries Polaris Six out of the storm.',
					zh: '你手里现在只剩一座真港、一条活线，以及快见底的船体余温。做出最后一次锁定，把“北辰六号”从风暴里整艘拖出去。',
					ja: '今あなたの手元にあるのは、本物の港一つ、生きたルート一本、そして尽きかけた船体の熱だけです。最後の固定でポラリス・シックスを嵐の外へ引きずり出します。'
				},
				quizSlug: 'world-map-quiz',
				dialogue: {
					briefing: {
						en: 'The hull groans like it remembers every wave that hit it tonight. No one on the bridge is asking for hope anymore, only an exit.',
						zh: '船体在风里发出的声音，像是在一口一口把今夜挨过的浪全吐出来。舰桥上已经没人再问有没有希望了，大家只问还有没有出口。',
						ja: '船体は、今夜受けたすべての波を思い出すように軋んでいます。艦橋ではもう希望を聞く者はなく、出口があるかだけが問われています。'
					},
					objective: {
						en: 'The final escape line opens through {target}. Call it, and Polaris Six clears the whiteout for good.',
						zh: '最后那条逃生线，是从 {target} 打开的。只要你报准，“北辰六号”就能整艘穿出白障。',
						ja: '最後の脱出線は {target} から開きます。そこを言い当てれば、ポラリス・シックスは完全にホワイトアウトを抜けられます。'
					},
					confirm: {
						en: '{selection} is queued as the final jump line. Confirm if this is the cut that opens the storm.',
						zh: '{selection} 已经挂上最终跃迁线了。如果白障真会在这里被劈开，就现在确认。',
						ja: '{selection} を最終ジャンプ線に載せました。白障を切り裂く一手なら今確定します。'
					},
					success: {
						en: '{selection} tears the storm open. The white wall splits, and Polaris Six finally sees a horizon again.',
						zh: '{selection} 把整道风暴硬生生撕开了。那堵白墙裂开的瞬间，“北辰六号”终于又看见了地平线。',
						ja: '{selection} が嵐を切り裂きました。白い壁が割れた瞬間、ポラリス・シックスは再び水平線を見ます。'
					},
					failure: {
						en: '{selection} is not the cut. The storm edge still opens only at {target}.',
						zh: '{selection} 不是那一刀。白障边缘真正会开的地方，仍然只有 {target}。',
						ja: '{selection} はその切れ目ではありません。白障の縁が本当に開くのはまだ {target} だけです。'
					},
					footerObjective: {
						en: 'Last jump. After this, there is either sky or nothing.',
						zh: '最后一跳了。跳出去，就是天；跳不出去，就什么都没有。',
						ja: '最後の跳躍です。この先にあるのは空か、無かのどちらかです。'
					},
					footerConfirm: {
						en: 'This confirmation spends the last of the ship.',
						zh: '这次确认，会把这艘船最后那点余量一口气烧掉。',
						ja: 'この確認で、船の最後の余力を使い切ります。'
					},
					footerSuccess: {
						en: 'Escape corridor complete. Whiteout behind you.',
						zh: '逃生走廊打通了。白障留在身后。',
						ja: '脱出回廊は完成です。ホワイトアウトは背後に残ります。'
					},
					footerFailure: {
						en: 'The wall is still closed. Re-cut the edge now.',
						zh: '那堵墙还没开。立刻再劈一次边缘。',
						ja: '壁はまだ閉じています。すぐに縁を切り直します。'
					}
				}
			}
		]
	}
];

const localizeCampaign = (def: CampaignDef, locale: AppLocale): Campaign => ({
	locale,
	slug: def.slug,
	templateId: def.templateId,
	templateLabel: pick(TEMPLATE_LABELS, locale)[def.templateId],
	accent: def.accent,
	title: pick(def.title, locale),
	summary: pick(def.summary, locale),
	premise: pick(def.premise, locale),
	seoTitle: pick(def.seoTitle, locale),
	seoDescription: pick(def.seoDescription, locale),
	durationMinutes: def.durationMinutes,
	missionCount: def.missionCount,
	difficulty: def.difficulty,
	difficultyLabel: pick(DIFFICULTY_LABELS, locale)[def.difficulty],
	audience: def.audience,
	audienceLabel: pick(AUDIENCE_LABELS, locale)[def.audience],
	launchQuizSlug: def.launchQuizSlug,
	relatedQuizSlugs: [...def.relatedQuizSlugs],
	remixPromptExamples: [...pick(def.remixPromptExamples, locale)],
	story: {
		prologue: pick(def.story.prologue, locale),
		factions: def.story.factions.map((faction) => ({
			name: pick(faction.name, locale),
			role: pick(faction.role, locale),
			summary: pick(faction.summary, locale)
		})),
		epilogue: pick(def.story.epilogue, locale)
	},
	missionPreviews: def.missionPreviews.map((mission) => ({
		id: mission.id,
		title: pick(mission.title, locale),
		summary: pick(mission.summary, locale),
		quizSlug: mission.quizSlug,
		dialogue: mission.dialogue
			? {
					briefing: mission.dialogue.briefing
						? pick(mission.dialogue.briefing, locale)
						: undefined,
					objective: mission.dialogue.objective
						? pick(mission.dialogue.objective, locale)
						: undefined,
					confirm: mission.dialogue.confirm
						? pick(mission.dialogue.confirm, locale)
						: undefined,
					success: mission.dialogue.success
						? pick(mission.dialogue.success, locale)
						: undefined,
					failure: mission.dialogue.failure
						? pick(mission.dialogue.failure, locale)
						: undefined,
					footerObjective: mission.dialogue.footerObjective
						? pick(mission.dialogue.footerObjective, locale)
						: undefined,
					footerConfirm: mission.dialogue.footerConfirm
						? pick(mission.dialogue.footerConfirm, locale)
						: undefined,
					footerSuccess: mission.dialogue.footerSuccess
						? pick(mission.dialogue.footerSuccess, locale)
						: undefined,
					footerFailure: mission.dialogue.footerFailure
						? pick(mission.dialogue.footerFailure, locale)
						: undefined
				}
			: undefined
	}))
});

export const getCampaigns = (locale: AppLocale) =>
	CAMPAIGN_DEFS.map((campaign) => localizeCampaign(campaign, locale));

export const getFeaturedCampaigns = (locale: AppLocale, limit = 3) =>
	getCampaigns(locale).slice(0, limit);

export const getCampaignBySlug = (locale: AppLocale, slug: string) => {
	const campaign = CAMPAIGN_DEFS.find((item) => item.slug === slug);
	return campaign ? localizeCampaign(campaign, locale) : null;
};

export const getAllCampaignSlugs = () =>
	CAMPAIGN_DEFS.map((campaign) => campaign.slug);

export const buildCampaignPlayHref = (
	campaign: Campaign,
	options?: {
		topicSlug?: string;
		remixPrompt?: string | null;
	}
) => {
	const topicSlug = options?.topicSlug ?? campaign.launchQuizSlug;
	const topic = getQuizTopicBySlug(topicSlug);
	if (!topic) {
		throw new Error(`Unknown campaign play topic slug: ${topicSlug}`);
	}

	const params = new URLSearchParams();
	params.set('topic', topic.slug);
	params.set('campaign', campaign.slug);
	if (options?.remixPrompt?.trim()) {
		params.set('remix', options.remixPrompt.trim());
	}

	return `${buildGameHref(topic.gameConfig)}&${params.toString()}`;
};

export const deriveCampaignRemixDraft = (
	campaign: Campaign,
	rawPrompt: string
): CampaignRemixDraft => {
	const prompt = rawPrompt.trim();
	const copy = REMIX_FALLBACK_COPY[campaign.locale];
	const shortPrompt =
		prompt.length > 48 ? `${prompt.slice(0, 45).trimEnd()}...` : prompt;
	const title = prompt
		? `${campaign.title} — ${shortPrompt}`
		: `${campaign.title} ${copy.defaultTitleSuffix}`;
	const summary = prompt
		? `${campaign.summary} ${copy.summaryPrefix} ${prompt}`
		: campaign.summary;
	const premise = prompt
		? `${campaign.premise} ${copy.premisePrefix} ${prompt}${copy.sentenceEnd}`
		: campaign.premise;

	return {
		prompt,
		title,
		summary,
		premise,
		playHref: buildCampaignPlayHref(campaign, {
			remixPrompt: prompt || null
		})
	};
};

for (const campaign of CAMPAIGN_DEFS) {
	if (!getQuizTopicBySlug(campaign.launchQuizSlug)) {
		throw new Error(
			`Unknown campaign launch quiz slug: ${campaign.launchQuizSlug}`
		);
	}

	for (const topicSlug of campaign.relatedQuizSlugs) {
		if (!getQuizTopicBySlug(topicSlug)) {
			throw new Error(`Unknown campaign related quiz slug: ${topicSlug}`);
		}
	}

	for (const mission of campaign.missionPreviews) {
		if (!getQuizTopicBySlug(mission.quizSlug)) {
			throw new Error(
				`Unknown campaign mission quiz slug: ${mission.quizSlug}`
			);
		}
	}
}
