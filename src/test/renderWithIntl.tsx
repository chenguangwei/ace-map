import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

export const renderWithIntl = (
	ui: ReactNode,
	messages: Record<string, unknown>,
	locale = 'en'
) =>
	render(
		<NextIntlClientProvider locale={locale} messages={messages}>
			{ui}
		</NextIntlClientProvider>
	);
