import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Link } from '@heroui/link';
import { Progress } from '@heroui/progress';
import { addToast } from '@heroui/toast';
import { motion } from 'framer-motion';
import { type RefObject, useEffect, useMemo, useState } from 'react';
import { encodeResult, type GameState } from '@/lib/utils/game';
import { Show } from '../Flow';
import type { InfoState } from './Main';

const TimerComp = (props: { timer: RefObject<number> }) => {
    const [_, setTick] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((tick) => !tick);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: _ is needed to re-render every second
    const timeValue = useMemo(() => {
        const { timer } = props;

        const minutes = timer.current > 60 ? Math.floor(timer.current / 60) : 0;
        const seconds = minutes > 0 ? timer.current - minutes * 60 : timer.current;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [props, _]);

    return <Chip>{timeValue}</Chip>;
};

const MotionLink = motion.create(Link);

const GameBar = (
    props: InfoState & {
        gameState: GameState;
    }
) => {
    const { gameState, info, setInfo } = props;

    useEffect(() => {
        if (gameState.toMark === null && gameState.status === 'running') {
            const resultCode = encodeResult(gameState);
            gameState.reset();

            addToast({
                color: 'success',
                title: 'Game Over!',
                description: (
                    <MotionLink
                        href={`/?code=${resultCode}`}
                        color="success"
                        initial={{ y: 0, rotate: 0 }}
                        animate={{ y: [0, -5, 0, -5, 0], rotate: [0, -5, 0, 5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                    >
                        Get your result
                    </MotionLink>
                ),
                timeout: 20000
            });
        }
    }, [gameState]);

    return (
        <div className="w-full">
            <Progress
                radius="none"
                color="success"
                value={(gameState.score.current / gameState.score.total) * 100}
                aria-label="Game Progress"
                size="sm"
            />
            {/** biome-ignore lint/a11y/useSemanticElements: ignore it */}
            <div
                role="group"
                className="flex flex-wrap justify-center items-center gap-4 w-full p-4"
            >
                <Show condition={gameState.status === 'paused' || gameState.status === 'running'}>
                    <Chip>{gameState.toMark?.name ?? 'Done'}</Chip>
                </Show>
                <Button
                    radius="lg"
                    onPress={() => {
                        if (gameState.toMark === null && gameState.status === 'running') {
                            gameState.resetAndStart();
                        } else if (gameState.status === 'idle') {
                            gameState.start();
                        } else if (gameState.status === 'running') {
                            gameState.pause();
                        } else if (gameState.status === 'paused') {
                            gameState.resume();
                        }
                    }}
                    isDisabled={gameState.currentMarker === 'submitted'}
                >
                    {gameState.toMark === null && gameState.status === 'running'
                        ? 'Reset'
                        : gameState.status === 'idle'
                          ? 'Start'
                          : gameState.status === 'running'
                            ? 'Pause'
                            : 'Resume'}
                </Button>
                <Button
                    radius="lg"
                    color="secondary"
                    onPress={() => {
                        if (info) {
                            gameState.next(info);
                            setInfo(null);
                        } else {
                            const info = gameState.submitMarker();
                            setInfo(info);
                        }
                    }}
                    isDisabled={gameState.currentMarker === 'none' || gameState.status === 'idle'}
                >
                    {info ? 'Next' : 'Submit'}
                </Button>
                <TimerComp timer={gameState.timer} />
            </div>
        </div>
    );
};

export default GameBar;
