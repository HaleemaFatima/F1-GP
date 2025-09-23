import React from 'react';
import { Flag, Shield, Clock, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-f1-dark border-t border-white/10 chequered-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-f1-red p-2 rounded-lg">
                <img src="/Screenshot%202025-09-22%20221019.png" alt="F1 Logo" className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-semibold">F1 Tickets</h3>
            </div>
            <p className="text-f1-gray text-sm">
              Premium Formula 1 experience with secure, real-time seat booking.
            </p>
          </div>

          {/* Features */}
          <div className="col-span-1">
            <h4 className="font-display text-white mb-4 f1-accent">Features</h4>
            <div className="space-y-3">
              <FeatureItem icon={<Clock />} text="Real-time Seat Map" />
              <FeatureItem icon={<Shield />} text="Secure Hold System" />
              <FeatureItem icon={<Zap />} text="Idempotent Payments" />
            </div>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="font-display text-white mb-4 f1-accent">Support</h4>
            <div className="space-y-2 text-sm text-f1-gray">
              <p>Help Center</p>
              <p>Contact Us</p>
              <p>Booking Policy</p>
              <p>Accessibility</p>
            </div>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-display text-white mb-4 f1-accent">Legal</h4>
            <div className="space-y-2 text-sm text-f1-gray">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Cookie Policy</p>
              <p>GDPR Compliance</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-f1-gray">
          <p>&copy; 2025 F1 Tickets. All rights reserved. Built for the premium racing experience.</p>
        </div>
      </div>
    </footer>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <div className="flex items-center space-x-3 text-sm text-f1-gray">
    <div className="text-f1-red">
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </div>
    <span>{text}</span>
  </div>
);