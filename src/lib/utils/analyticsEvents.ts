export const ANALYTICS_LOCAL_CHANGE_EVENT = 'ace-map-analytics-local-change';

export const dispatchAnalyticsLocalChange = () => {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(ANALYTICS_LOCAL_CHANGE_EVENT));
};
