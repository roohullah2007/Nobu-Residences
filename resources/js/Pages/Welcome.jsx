import Home from '@/Website/Home';

// This file serves as a redirect/compatibility layer
// The actual home page is now located at: resources/js/Website/Home.jsx
export default function Welcome(props) {
    return <Home {...props} />;
}
