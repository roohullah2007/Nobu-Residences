import React, { useState } from 'react';

const NearbySchools = ({ propertyData = null }) => {
  const [showAll, setShowAll] = useState(false);

  // Generate unique ID to avoid conflicts
  const uniqueId = `schools-${Math.random().toString(36).substr(2, 9)}`;

  // Process schools data from property object or use sample data
  const getSchoolsData = () => {
    let schoolsData = [];

    // If property data is provided and has nearby schools
    if (propertyData?.NearbySchools && Array.isArray(propertyData.NearbySchools) && propertyData.NearbySchools.length > 0) {
      schoolsData = propertyData.NearbySchools.map(school => ({
        distance_km: school.Distance || '',
        walk_time: school.WalkTime || '',
        name: school.Name || '',
        type: school.Type || '',
        board: school.Board || '',
        url: school.URL || '#'
      }));
    }

    // If no schools data, use sample/fallback data
    if (schoolsData.length === 0) {
      schoolsData = [
        {
          distance_km: '0.2 km',
          walk_time: '3 min walk',
          name: "St Michael's Choir (Sr) School",
          type: 'Catholic',
          board: 'Secondary | Toronto Catholic District School Board',
          url: '#'
        },
        {
          distance_km: '0.5 km',
          walk_time: '6 min walk',
          name: 'Central Technical School',
          type: 'Public',
          board: 'Secondary | Toronto District School Board',
          url: '#'
        },
        {
          distance_km: '0.8 km',
          walk_time: '10 min walk',
          name: 'Ryerson Community School',
          type: 'Public',
          board: 'Elementary | Toronto District School Board',
          url: '#'
        },
        {
          distance_km: '1.2 km',
          walk_time: '15 min walk',
          name: 'Toronto Metropolitan University',
          type: 'University',
          board: 'Post-Secondary | Public University',
          url: '#'
        },
        {
          distance_km: '1.5 km',
          walk_time: '18 min walk',
          name: 'King George Public School',
          type: 'Public',
          board: 'Elementary | Toronto District School Board',
          url: '#'
        }
      ];
    }

    return schoolsData;
  };

  const schoolsData = getSchoolsData();
  const displayedSchools = showAll ? schoolsData : schoolsData.slice(0, 3);
  const remainingCount = schoolsData.length - 3;

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Nearby Schools Styles */
          .idx-nearby-schools-boundary {
              all: initial !important;
              display: block !important;
              position: relative !important;
              isolation: isolate !important;
              contain: layout style !important;
              font-family: "Red Hat Display", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              background: transparent !important;
              font-size: 16px !important;
              font-weight: normal !important;
              line-height: 1.5 !important;
              text-align: left !important;
              text-decoration: none !important;
              text-transform: none !important;
              letter-spacing: normal !important;
              word-spacing: normal !important;
              width: auto !important;
              height: auto !important;
              min-width: 0 !important;
              min-height: 0 !important;
              max-width: none !important;
              max-height: none !important;
              top: auto !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
              z-index: auto !important;
              transform: none !important;
              transition: none !important;
              animation: none !important;
          }

          .idx-nearby-schools-boundary *,
          .idx-nearby-schools-boundary *::before,
          .idx-nearby-schools-boundary *::after {
              all: unset !important;
              display: revert !important;
              box-sizing: border-box !important;
              font-family: inherit !important;
              color: inherit !important;
          }

          .idx-nearby-schools-boundary .nearby-schools-container {
              display: flex !important;
              flex-direction: column !important;
          }

          .idx-nearby-schools-boundary .title {
              font-size: 20px !important;
              font-weight: 700 !important;
              margin-bottom: 16px !important;
              margin-top: 0 !important;
              color: inherit !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .schools-table-container {
              background-color: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          }

          .idx-nearby-schools-boundary .schools-table {
              min-width: 100% !important;
              border-collapse: collapse !important;
              width: 100% !important;
              border: none !important;
          }

          .idx-nearby-schools-boundary .table-header {
              background-color: #FBF9F7 !important;
              border: none !important;
          }

          .idx-nearby-schools-boundary .table-header th {
              padding: 12px 24px !important;
              text-align: left !important;
              font-size: 14px !important;
              font-weight: 700 !important;
              letter-spacing: 0.05em !important;
              color: #374151 !important;
              border: none !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .table-body {
              background-color: white !important;
          }

          .idx-nearby-schools-boundary .school-row {
              border-bottom: 1px solid #e5e7eb !important;
              background-color: white !important;
              background: white !important;
          }

          .idx-nearby-schools-boundary .school-row:hover {
              background-color: #fafbfc !important;
          }

          .idx-nearby-schools-boundary .table-body td {
              padding: 16px 24px !important;
              vertical-align: top !important;
              border: none !important;
              border-bottom: 1px solid #f3f4f6 !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .school-row:last-child td {
              border-bottom: none !important;
          }

          .idx-nearby-schools-boundary .distance-cell {
              white-space: nowrap !important;
          }

          .idx-nearby-schools-boundary .distance-km {
              font-size: 14px !important;
              color: #727272 !important;
              font-weight: 700 !important;
              margin: 0 0 4px 0 !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .distance-walk {
              font-size: 14px !important;
              color: #707070 !important;
              font-weight: 500 !important;
              margin: 0 !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .school-link {
              font-size: 16px !important;
              color: #263238 !important;
              font-weight: 700 !important;
              text-decoration: none !important;
              display: block !important;
              margin-bottom: 4px !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .school-link:hover {
              text-decoration: underline !important;
              color: #263238 !important;
          }

          .idx-nearby-schools-boundary .school-details {
              font-size: 14px !important;
              color: #707070 !important;
              font-weight: 500 !important;
              margin: 0 !important;
              line-height: 1.4 !important;
          }

          .idx-nearby-schools-boundary .schools-toggle-container {
              padding: 16px 24px !important;
              text-align: left !important;
          }

          .idx-nearby-schools-boundary .schools-toggle-button {
              background: none !important;
              border: none !important;
              color: #3b82f6 !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              text-decoration: none !important;
              line-height: 1.4 !important;
              padding: 0 !important;
              margin: 0 !important;
              outline: none !important;
          }

          .idx-nearby-schools-boundary .schools-toggle-button:hover {
              text-decoration: underline !important;
              color: #2563eb !important;
          }

          .idx-nearby-schools-boundary .schools-toggle-button:active {
              color: #1d4ed8 !important;
          }
        `
      }} />
      
      <div className="idx-nearby-schools-boundary">
        <div className="nearby-schools-container">
          <h3 className="title">
            Nearby Schools
          </h3>

          <div className="schools-table-container">
            <table className="schools-table">
              <thead className="table-header">
                <tr>
                  <th>Distance</th>
                  <th>School</th>
                </tr>
              </thead>
              
              <tbody className="table-body">
                {displayedSchools.map((school, index) => (
                  <tr key={index} className="school-row">
                    <td className="distance-cell">
                      <div className="distance-km">
                        {school.distance_km}
                      </div>
                      <div className="distance-walk">
                        {school.walk_time}
                      </div>
                    </td>
                    
                    <td>
                      <a href={school.url} className="school-link">
                        {school.name}
                      </a>
                      <div className="school-details">
                        {school.board}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {schoolsData.length > 3 && (
              <div className="schools-toggle-container">
                <button
                  onClick={handleToggleShow}
                  className="schools-toggle-button"
                >
                  {showAll 
                    ? 'Show Less' 
                    : `Show More (${remainingCount})`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NearbySchools;