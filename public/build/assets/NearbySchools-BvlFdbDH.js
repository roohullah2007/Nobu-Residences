import{r as c,j as o}from"./app-xtRRCL6T.js";const h=({propertyData:a=null})=>{const[i,e]=c.useState(!1);`${Math.random().toString(36).substr(2,9)}`;const r=(()=>{let t=[];return a?.NearbySchools&&Array.isArray(a.NearbySchools)&&a.NearbySchools.length>0&&(t=a.NearbySchools.map(n=>({distance_km:n.Distance||"",walk_time:n.WalkTime||"",name:n.Name||"",type:n.Type||"",board:n.Board||"",url:n.URL||"#"}))),t.length===0&&(t=[{distance_km:"0.2 km",walk_time:"3 min walk",name:"St Michael's Choir (Sr) School",type:"Catholic",board:"Secondary | Toronto Catholic District School Board",url:"#"},{distance_km:"0.5 km",walk_time:"6 min walk",name:"Central Technical School",type:"Public",board:"Secondary | Toronto District School Board",url:"#"},{distance_km:"0.8 km",walk_time:"10 min walk",name:"Ryerson Community School",type:"Public",board:"Elementary | Toronto District School Board",url:"#"},{distance_km:"1.2 km",walk_time:"15 min walk",name:"Toronto Metropolitan University",type:"University",board:"Post-Secondary | Public University",url:"#"},{distance_km:"1.5 km",walk_time:"18 min walk",name:"King George Public School",type:"Public",board:"Elementary | Toronto District School Board",url:"#"}]),t})(),l=i?r:r.slice(0,3),s=r.length-3,m=()=>{e(!i)};return o.jsxs(o.Fragment,{children:[o.jsx("style",{dangerouslySetInnerHTML:{__html:`
          /* Nearby Schools Styles */
          .idx-nearby-schools-boundary {
              all: initial !important;
              display: block !important;
              position: relative !important;
              isolation: isolate !important;
              contain: layout style !important;
              font-family: 'Helvetica', 'Arial', sans-serif !important;
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
        `}}),o.jsx("div",{className:"idx-nearby-schools-boundary",children:o.jsxs("div",{className:"nearby-schools-container",children:[o.jsx("h3",{className:"title",children:"Nearby Schools"}),o.jsxs("div",{className:"schools-table-container",children:[o.jsxs("table",{className:"schools-table",children:[o.jsx("thead",{className:"table-header",children:o.jsxs("tr",{children:[o.jsx("th",{children:"Distance"}),o.jsx("th",{children:"School"})]})}),o.jsx("tbody",{className:"table-body",children:l.map((t,n)=>o.jsxs("tr",{className:"school-row",children:[o.jsxs("td",{className:"distance-cell",children:[o.jsx("div",{className:"distance-km",children:t.distance_km}),o.jsx("div",{className:"distance-walk",children:t.walk_time})]}),o.jsxs("td",{children:[o.jsx("a",{href:t.url,className:"school-link",children:t.name}),o.jsx("div",{className:"school-details",children:t.board})]})]},n))})]}),r.length>3&&o.jsx("div",{className:"schools-toggle-container",children:o.jsx("button",{onClick:m,className:"schools-toggle-button",children:i?"Show Less":`Show More (${s})`})})]})]})})]})};export{h as default};
