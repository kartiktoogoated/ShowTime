import { Film } from 'lucide-react';
import MovieList from '../components/MovieList';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-12 h-12 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              ShowTime
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Book your perfect movie experience today
          </p>
        </header>
        <MovieList />
      </main>
      <Footer />
    </div>
  );
}

export default App;