import SchoolDetail from '../Website/Pages/SchoolDetail';

// This file serves as a redirect/compatibility layer
// The actual SchoolDetail page is now located at: resources/js/Website/Pages/SchoolDetail.jsx
export default function SchoolDetailPage(props) {
    return <SchoolDetail {...props} />;
}
