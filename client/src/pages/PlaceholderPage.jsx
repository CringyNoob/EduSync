import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div className="p-8 max-w-2xl mx-auto text-center">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors font-medium"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-gray-100 flex flex-col items-center">
                <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Construction className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
                <p className="text-gray-500 text-lg mb-8">
                    This feature is currently under development. <br />
                    Stay tuned for updates!
                </p>
                {/* Debug info removed */}
            </div>
        </div>
    );
};

export default PlaceholderPage;
