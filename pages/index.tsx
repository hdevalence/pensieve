import Link from 'next/link';
import { useState } from 'react';

const Home: React.FC = () => {
    const [date, setDate] = useState<string>('');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

    return (
        <div>
            <input type="date" value={date} onChange={handleDateChange} />
            <Link href={`/messages/${date}`}>
                View Messages
            </Link>
        </div>
    );
};

export default Home;
