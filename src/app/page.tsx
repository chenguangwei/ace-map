import { BackgroundBeams } from '@/lib/components/BgBeams';
import { Show } from '@/lib/components/Flow';
import Result from '@/lib/components/Result';
import Start from '@/lib/components/Start';

const Page = async ({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const resultCode = (await searchParams).code;

    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center">
            <BackgroundBeams />
            <Show condition={resultCode === undefined}>
                <Start />
            </Show>
            <Show condition={typeof resultCode === 'string'}>
                <Result code={resultCode as string} />
            </Show>
        </div>
    );
};

export default Page;
