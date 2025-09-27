import PropertyDetail from '../Website/Pages/PropertyDetail';

// This file serves as a redirect/compatibility layer
// The actual PropertyDetail page is now located at: resources/js/Pages/Website/Pages/PropertyDetail.jsx
export default function PropertyDetailPage(props) {
    return <PropertyDetail {...props} />;
}