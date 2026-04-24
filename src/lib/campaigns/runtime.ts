import type {
	AppLocale,
	Campaign,
	CampaignMissionPreview,
	CampaignTemplateId
} from '@/lib/data/campaigns';

export interface CampaignRunState {
	missionCount: number;
	currentMission: number;
	completedMissions: number;
	missionProgress: number;
	answeredQuestions: number;
	totalQuestions: number;
	remainingQuestions: number;
	accuracy: number;
	status: 'briefing' | 'active' | 'finale' | 'complete';
}

export interface CampaignResultEvaluation {
	tier: 'recovery' | 'steady' | 'strong' | 'elite';
	accuracy: number;
	bestStreak: number;
	missionCount: number;
}

export interface CampaignDialogueFrame {
	speaker: string;
	channel: string;
	channelDetail: string;
	headline: string;
	briefingLine: string;
	actionLine: string;
	footerLine: string;
	actionLabel: string;
}

const DIALOGUE_COPY: Record<
	CampaignTemplateId,
	Record<
		AppLocale,
		{
			speaker: string;
			channel: string;
			objectiveLead: string;
			objectiveAction: string;
			confirmAction: string;
			successAction: string;
			failureAction: string;
			footerObjective: string;
			footerConfirm: string;
			footerSuccess: string;
			footerFailure: string;
			actionTransmit: string;
			actionConfirm: string;
			actionAdvance: string;
		}
	>
> = {
	pursuit: {
		en: {
			speaker: 'Route Dispatch',
			channel: 'Supply channel',
			objectiveLead: 'The route is still broken at this handoff.',
			objectiveAction:
				'Locate {target} and reconnect this segment before the trail goes cold.',
			confirmAction:
				'You have {selection} locked. Send it now if this is the missing handoff.',
			successAction:
				'{selection} is confirmed. One more supply segment is back online.',
			failureAction:
				'{selection} is a false transfer. The route is still waiting on {target}.',
			footerObjective:
				'Trace first, then transmit the recovered handoff.',
			footerConfirm:
				'Dispatch is waiting for your final lock confirmation.',
			footerSuccess:
				'Route updated. Advance to the next recovery window.',
			footerFailure: 'Reset the line and search the next live corridor.',
			actionTransmit: 'Transmit coordinates',
			actionConfirm: 'Confirm handoff',
			actionAdvance: 'Advance route'
		},
		zh: {
			speaker: '航线调度台',
			channel: '补给链路',
			objectiveLead: '这段航线的交接点还没有接回去。',
			objectiveAction: '先找出 {target}，把这一段断链重新接上。',
			confirmAction:
				'你已经锁定 {selection}。如果这里就是失联转运点，现在回传。',
			successAction: '{selection} 已确认，补给链恢复了一段。',
			failureAction:
				'{selection} 不是正确交接点。当前断链仍然卡在 {target}。',
			footerObjective: '先定位，再把回收的交接点发回调度台。',
			footerConfirm: '调度台正在等待你的最终锁定确认。',
			footerSuccess: '航线已更新，继续推进下一段回收窗口。',
			footerFailure: '重置搜索线，转去下一段仍然在线的走廊。',
			actionTransmit: '回传坐标',
			actionConfirm: '确认交接点',
			actionAdvance: '推进航线'
		},
		ja: {
			speaker: '航路ディスパッチ',
			channel: '補給ライン',
			objectiveLead: 'この受け渡し地点で航路がまだ途切れています。',
			objectiveAction:
				'{target} を見つけ、この区間の補給ラインをつなぎ直してください。',
			confirmAction:
				'{selection} を固定しました。ここが欠落した受け渡し地点なら今送信します。',
			successAction:
				'{selection} を確認。補給ラインの一区間が復旧しました。',
			failureAction:
				'{selection} は誤転送です。ラインはまだ {target} を待っています。',
			footerObjective:
				'まず特定し、そのあと復旧した受け渡し地点を送信します。',
			footerConfirm: 'ディスパッチが最終固定の確認を待っています。',
			footerSuccess: '航路を更新しました。次の復旧区間へ進みます。',
			footerFailure: '探索線を戻し、次の有効な回廊へ切り替えます。',
			actionTransmit: '座標を送信',
			actionConfirm: '受け渡し確認',
			actionAdvance: '次の航路へ'
		}
	},
	command: {
		en: {
			speaker: 'Command Desk',
			channel: 'Crisis net',
			objectiveLead: 'The response grid is opening a new front.',
			objectiveAction:
				'Verify {target} so the command chain can reinforce the right pressure point.',
			confirmAction:
				'{selection} is in your sights. Confirm the lock before we redeploy units.',
			successAction:
				'{selection} holds. Command can stabilize this front and keep the network intact.',
			failureAction:
				'{selection} is the wrong front. Redirect to {target} before the line buckles.',
			footerObjective: 'Command needs a clean read before assets move.',
			footerConfirm:
				'This confirmation will decide the next deployment order.',
			footerSuccess: 'Front secured. Push the next command packet.',
			footerFailure:
				'Abort this lock and reopen the crisis map immediately.',
			actionTransmit: 'Send command read',
			actionConfirm: 'Confirm deployment',
			actionAdvance: 'Issue next order'
		},
		zh: {
			speaker: '指挥席',
			channel: '危机网络',
			objectiveLead: '响应网络正在打开新的压力前线。',
			objectiveAction: '确认 {target}，指挥链才能把增援派去正确位置。',
			confirmAction:
				'{selection} 已进入锁定区。确认后才能重排下一批单位。',
			successAction:
				'{selection} 判断正确，这条前线可以稳住，指挥网络继续在线。',
			failureAction:
				'{selection} 不是正确前线。立刻改向 {target}，别让整条线塌掉。',
			footerObjective: '指挥链需要一份干净判断，增援才能动。',
			footerConfirm: '这次确认会直接决定下一条部署命令。',
			footerSuccess: '前线已稳，继续下发下一道命令。',
			footerFailure: '取消这次锁定，立刻重开危机地图。',
			actionTransmit: '提交指挥判断',
			actionConfirm: '确认部署',
			actionAdvance: '下达下一令'
		},
		ja: {
			speaker: 'コマンドデスク',
			channel: '危機ネット',
			objectiveLead: '対応網が新しい圧力フロントを開いています。',
			objectiveAction:
				'{target} を確認し、指揮系統が正しい地点へ増援できるようにします。',
			confirmAction:
				'{selection} をロックしました。次の部隊再配置の前に確認します。',
			successAction:
				'{selection} は正解です。この前線を安定させ、指揮網を維持できます。',
			failureAction:
				'{selection} は誤った前線です。ラインが崩れる前に {target} へ切り替えます。',
			footerObjective:
				'部隊を動かす前に、指揮所は正確な読みに依存しています。',
			footerConfirm: 'この確認が次の展開順を決めます。',
			footerSuccess: '前線を確保しました。次の指令を送ります。',
			footerFailure: 'このロックを中止し、危機マップを再展開します。',
			actionTransmit: '指揮判断を送信',
			actionConfirm: '配置を確認',
			actionAdvance: '次の命令へ'
		}
	},
	escape: {
		en: {
			speaker: 'Flight Navigator',
			channel: 'Escape corridor',
			objectiveLead: 'Visibility is collapsing along the route.',
			objectiveAction:
				'Find {target} before the last clear window closes and the corridor disappears.',
			confirmAction:
				'{selection} is marked as your escape line. Confirm before the map whites out again.',
			successAction:
				'{selection} is clean. The escape corridor opens for one more jump.',
			failureAction:
				'{selection} is a dead turn. The real escape window is still at {target}.',
			footerObjective:
				'Move fast. The map will not stay readable for long.',
			footerConfirm:
				'One confirmation now decides whether the corridor survives.',
			footerSuccess:
				'Window secured. Take the next jump while it is still clear.',
			footerFailure:
				'Drop this turn and search before the whiteout closes in.',
			actionTransmit: 'Commit escape line',
			actionConfirm: 'Confirm jump',
			actionAdvance: 'Take next jump'
		},
		zh: {
			speaker: '领航台',
			channel: '逃生走廊',
			objectiveLead: '路线上的可视窗口正在迅速关闭。',
			objectiveAction:
				'在最后一块清晰视野消失前，找到 {target} 并穿过去。',
			confirmAction:
				'{selection} 已被标记为逃生线。地图再次白障前，立刻确认。',
			successAction: '{selection} 正确，逃生走廊又打开了一次跳转窗口。',
			failureAction: '{selection} 是死路。真正的逃生窗口还在 {target}。',
			footerObjective: '动作要快，这张图不会长时间保持可读。',
			footerConfirm: '这次确认会决定走廊能不能继续打开。',
			footerSuccess: '窗口已锁住，趁视野还清楚立刻继续跳转。',
			footerFailure: '放弃这次转向，在白障彻底压过来前重新搜索。',
			actionTransmit: '提交逃生线',
			actionConfirm: '确认跃迁',
			actionAdvance: '继续跳转'
		},
		ja: {
			speaker: 'ナビゲーター',
			channel: '脱出回廊',
			objectiveLead: 'ルート上の視界が急速に崩れています。',
			objectiveAction:
				'最後のクリアな窓が閉じる前に {target} を見つけて抜けます。',
			confirmAction:
				'{selection} を脱出ラインとして記録しました。再びホワイトアウトする前に確認します。',
			successAction:
				'{selection} は正解です。脱出回廊がもう一跳び分だけ開きました。',
			failureAction:
				'{selection} は行き止まりです。本当の脱出窓はまだ {target} にあります。',
			footerObjective: '急いでください。このマップは長く読めません。',
			footerConfirm: 'この確認で回廊が生き残るかどうかが決まります。',
			footerSuccess: '窓を確保しました。視界があるうちに次へ跳びます。',
			footerFailure:
				'この進路を切り、ホワイトアウトが閉じる前に再探索します。',
			actionTransmit: '脱出線を送信',
			actionConfirm: 'ジャンプ確認',
			actionAdvance: '次へ跳ぶ'
		}
	}
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

const inject = (
	template: string,
	values: Record<string, string | null | undefined>
) => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

const resolveMissionLine = (
	mission: CampaignMissionPreview | null,
	key: keyof NonNullable<CampaignMissionPreview['dialogue']>,
	fallback: string,
	values: Record<string, string | null | undefined>
) => inject(mission?.dialogue?.[key] ?? fallback, values);

export const deriveCampaignRunState = ({
	campaign,
	answeredQuestions,
	totalQuestions,
	correctAnswers
}: {
	campaign: Campaign;
	answeredQuestions: number;
	totalQuestions: number;
	correctAnswers: number;
}): CampaignRunState => {
	const missionCount = Math.max(1, campaign.missionCount);
	const safeAnswered = Math.max(0, answeredQuestions);
	const safeTotal = Math.max(0, totalQuestions);
	const safeCorrect = Math.max(0, correctAnswers);
	const missionSize =
		safeTotal > 0 ? Math.max(1, safeTotal / missionCount) : 1;
	const completedMissions =
		safeTotal > 0 && safeAnswered >= safeTotal
			? missionCount
			: Math.min(missionCount, Math.floor(safeAnswered / missionSize));
	const currentMission =
		safeTotal > 0 && safeAnswered >= safeTotal
			? missionCount
			: Math.min(missionCount, completedMissions + 1);
	const missionStart = (currentMission - 1) * missionSize;
	const missionProgress =
		safeTotal === 0 || safeAnswered >= safeTotal
			? safeAnswered > 0
				? 1
				: 0
			: clamp((safeAnswered - missionStart) / missionSize, 0, 1);
	const accuracy =
		safeAnswered === 0 ? 0 : Math.round((safeCorrect / safeAnswered) * 100);
	const status =
		safeAnswered === 0
			? 'briefing'
			: safeTotal > 0 && safeAnswered >= safeTotal
				? 'complete'
				: currentMission >= missionCount
					? 'finale'
					: 'active';

	return {
		missionCount,
		currentMission,
		completedMissions,
		missionProgress,
		answeredQuestions: safeAnswered,
		totalQuestions: safeTotal,
		remainingQuestions: Math.max(0, safeTotal - safeAnswered),
		accuracy,
		status
	};
};

export const evaluateCampaignResult = ({
	campaign,
	accuracy,
	bestStreak
}: {
	campaign: Campaign;
	accuracy: number;
	bestStreak: number;
}): CampaignResultEvaluation => {
	let tier: CampaignResultEvaluation['tier'] = 'recovery';

	if (
		accuracy >= 88 &&
		bestStreak >= Math.min(5, campaign.missionCount + 1)
	) {
		tier = 'elite';
	} else if (accuracy >= 72) {
		tier = 'strong';
	} else if (accuracy >= 45) {
		tier = 'steady';
	}

	return {
		tier,
		accuracy,
		bestStreak,
		missionCount: campaign.missionCount
	};
};

export const deriveCampaignDialogueFrame = ({
	campaign,
	mission,
	targetLabel,
	selectedRegionLabel,
	hasResult,
	isCorrect
}: {
	campaign: Campaign;
	mission: CampaignMissionPreview | null;
	targetLabel: string | null;
	selectedRegionLabel: string | null;
	hasResult: boolean;
	isCorrect: boolean;
}): CampaignDialogueFrame => {
	const copy = DIALOGUE_COPY[campaign.templateId][campaign.locale];
	const target = targetLabel ?? mission?.title ?? campaign.title;
	const selection = selectedRegionLabel ?? target;
	const briefingLine =
		mission?.dialogue?.briefing ??
		`${copy.objectiveLead} ${mission?.summary ?? campaign.premise}`.trim();

	if (hasResult) {
		return {
			speaker: copy.speaker,
			channel: copy.channel,
			channelDetail: mission?.title ?? campaign.title,
			headline: mission?.title ?? campaign.title,
			briefingLine,
			actionLine: resolveMissionLine(
				mission,
				isCorrect ? 'success' : 'failure',
				isCorrect ? copy.successAction : copy.failureAction,
				{ target, selection }
			),
			footerLine:
				(isCorrect
					? mission?.dialogue?.footerSuccess
					: mission?.dialogue?.footerFailure) ??
				(isCorrect ? copy.footerSuccess : copy.footerFailure),
			actionLabel: copy.actionAdvance
		};
	}

	if (selectedRegionLabel) {
		return {
			speaker: copy.speaker,
			channel: copy.channel,
			channelDetail: mission?.title ?? campaign.title,
			headline: mission?.title ?? campaign.title,
			briefingLine,
			actionLine: resolveMissionLine(
				mission,
				'confirm',
				copy.confirmAction,
				{ target, selection }
			),
			footerLine: mission?.dialogue?.footerConfirm ?? copy.footerConfirm,
			actionLabel: copy.actionConfirm
		};
	}

	return {
		speaker: copy.speaker,
		channel: copy.channel,
		channelDetail: mission?.title ?? campaign.title,
		headline: mission?.title ?? campaign.title,
		briefingLine,
		actionLine: resolveMissionLine(
			mission,
			'objective',
			copy.objectiveAction,
			{ target, selection }
		),
		footerLine: mission?.dialogue?.footerObjective ?? copy.footerObjective,
		actionLabel: copy.actionTransmit
	};
};
