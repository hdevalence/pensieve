import { useState } from 'react';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const timestamp = new Date(selectedDate + 'T12:00:00').getTime(); // Noon on selected date
        router.push(`/messages#t=${timestamp}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
            <div className="max-w-md w-full p-6">
                <h1 className="text-2xl font-bold text-white mb-8 text-center">
                    Jump to Date
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        View Messages
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;
