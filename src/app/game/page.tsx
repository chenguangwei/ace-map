import 'maplibre-gl/dist/maplibre-gl.css';
import { Skeleton } from '@heroui/skeleton';
import React from 'react';
import Main from '@/lib/components/game/Main';

const page = async () => {
	return (
		<main className="flex flex-col justify-center items-center h-[calc(100dvh-var(--navbar-height))]">
			<React.Suspense
				fallback={
					<>
						<Skeleton className="grow size-full" />
						<Skeleton className="w-full h-24" />
					</>
				}
			>
				<Main />
			</React.Suspense>
		</main>
	);
};

export default page;
