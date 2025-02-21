import { useState } from 'react';
import { Timeline } from '@/components/timeline/Timeline';

const Home: React.FC = () => {
    const [startDate, setStartDate] = useState<string>('2025-02-12');
    const [itemCount, setItemCount] = useState<number>(50);

    const startTimestamp = startDate ? new Date(startDate + 'T23:59:59').getTime() : 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto p-4">
                <div className="mb-8 space-y-4">
                    <h1 className="text-2xl font-bold text-white">Timeline Viewer</h1>
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Number of Items
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={itemCount}
                                onChange={(e) => setItemCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 50)))}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {startDate ? (
                    <Timeline startTime={startTimestamp} itemCount={itemCount} />
                ) : (
                    <div className="text-center text-gray-400">
                        Please select a start date to view the timeline
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
