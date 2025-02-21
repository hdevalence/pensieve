import { useState } from 'react';
import { Timeline } from '@/components/Timeline';

const Home: React.FC = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate + 'T23:59:59').getTime() : 0;

    return (
        <div className="container mx-auto p-4">
            <div className="mb-8 space-y-4">
                <h1 className="text-2xl font-bold">Timeline Viewer</h1>
                <div className="flex gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {startDate && endDate ? (
                <Timeline startTime={startTimestamp} endTime={endTimestamp} />
            ) : (
                <div className="text-center text-gray-500">
                    Please select a date range to view the timeline
                </div>
            )}
        </div>
    );
};

export default Home;
