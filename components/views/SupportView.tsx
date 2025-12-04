
import React from 'react';
import { MessageCircle, Mail, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SupportView: React.FC = () => {
  const { supportSettings } = useAuth();

  const waLink = `https://wa.me/${supportSettings.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="pb-24">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Customer Support</h2>
      <p className="text-gray-500 mb-8">We are here to help you 24/7. Choose a method below.</p>

      <div className="grid gap-4">
        {/* WhatsApp */}
        <a href={waLink} target="_blank" rel="noreferrer" className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4 hover:bg-green-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <MessageCircle className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">WhatsApp Support</h3>
                <p className="text-sm text-gray-500">Instant replies within 5 mins</p>
                <p className="text-xs text-gray-400 mt-0.5">{supportSettings.whatsapp}</p>
            </div>
        </a>

        {/* Telegram */}
        <a href={supportSettings.telegram} target="_blank" rel="noreferrer" className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4 hover:bg-blue-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Send className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Telegram Channel</h3>
                <p className="text-sm text-gray-500">Join for official updates</p>
            </div>
        </a>

        {/* Email */}
        <a href={`mailto:${supportSettings.email}`} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4 hover:bg-red-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Mail className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-500">{supportSettings.email}</p>
            </div>
        </a>
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-2xl text-center">
        <p className="text-xs text-gray-400">
            Operating Hours: Mon - Sat (10:00 AM - 6:00 PM) <br/>
            Response time may vary on holidays.
        </p>
      </div>
    </div>
  );
};
