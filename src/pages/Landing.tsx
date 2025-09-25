import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Zap, Calendar, MapPin } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/f1.jpg?v=2)',
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
            F1 Grand Prix
            <span className="block text-f1-red">Tickets</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the thrill of Formula 1 with premium seat booking. 
            Real-time availability, secure holds, guaranteed authenticity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/events"
              className="bg-f1-red hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 flex items-center space-x-2 group min-w-[200px] justify-center"
            >
              <span>View Events</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/my-orders"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-f1-black font-semibold px-8 py-4 rounded-lg transition-all duration-200 min-w-[200px] text-center"
            >
              My Orders
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-gradient-to-b from-f1-red to-transparent rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-f1-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 f1-accent">
              Why Choose F1 Tickets?
            </h2>
            <p className="text-xl text-f1-gray max-w-2xl mx-auto">
              Built for speed and precision, just like Formula 1 itself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock />}
              title="Real-time Seat Map"
              description="See live seat availability with instant updates. No surprises, no double bookings."
            />
            <FeatureCard
              icon={<Shield />}
              title="Secure Hold System"
              description="Reserve your seats for 10 minutes while you decide. Fair and transparent for everyone."
            />
            <FeatureCard
              icon={<Zap />}
              title="Idempotent Payments"
              description="Safe to retry if interrupted. No double charges, no payment errors."
            />
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-f1-black carbon-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6 f1-accent">
                Premium Racing Experience
              </h2>
              <p className="text-lg text-f1-gray mb-6">
                From trackside to grandstand, every seat offers an unforgettable view of the world's 
                fastest sport. Our platform ensures you get the best seats at transparent prices.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-f1-red flex-shrink-0" size={20} />
                  <span className="text-white">Multiple race weekends available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-f1-red flex-shrink-0" size={20} />
                  <span className="text-white">Premium circuit locations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="text-f1-red flex-shrink-0" size={20} />
                  <span className="text-white">100% authentic tickets guaranteed</span>
                </div>
              </div>

              <Link
                to="/events"
                className="inline-flex items-center space-x-2 bg-f1-red hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors mt-8"
              >
                <span>Book Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative">
              <div 
                className="rounded-lg overflow-hidden shadow-2xl"
                style={{
                  backgroundImage: 'url(/f1%20lights.jpg?v=2)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '400px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-f1-red/20 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-f1-red/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-f1-red chequered-pattern">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Ready for the Race?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Don't miss out on the most exciting motorsport event of the year.
            Book your premium F1 experience today.
          </p>
          
          <Link
            to="/events"
            className="inline-flex items-center space-x-2 bg-white text-f1-red font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            <span>View Available Events</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-f1-black rounded-lg p-8 border border-white/10 hover:border-f1-red/50 transition-colors group">
    <div className="text-f1-red mb-4 group-hover:scale-110 transition-transform">
      {React.cloneElement(icon as React.ReactElement, { size: 32 })}
    </div>
    <h3 className="text-xl font-display font-semibold text-white mb-3">
      {title}
    </h3>
    <p className="text-f1-gray">
      {description}
    </p>
  </div>
);