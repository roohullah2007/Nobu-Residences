import BuildingDetail from '../Website/Pages/BuildingDetail';

// This file serves as a redirect/compatibility layer
// The actual BuildingDetail page is now located at: resources/js/Website/Pages/BuildingDetail.jsx
export default function BuildingDetailPage(props) {
    return <BuildingDetail {...props} />;
}