function createPopup(data,name) {
 
    // Create a new pop-up window
    var tableWindow = window.open('', 'Table Popup RoomColor', 'width=1000,height=600');
    // Handles blocked popup-windows
    if(tableWindow) {
        // Set the name of the window
        tableWindow.name = "Popup "+name;

        // Create a container element for the table
        const container = tableWindow.document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '20px';
        container.style.boxSizing = 'border-box';
        container.style.overflow = 'auto';
        tableWindow.document.body.appendChild(container);
        // Create the table HTML
        const tableHTML = `
            <head>
                <link href="../popup.css" rel="stylesheet" />
            </head>
        <table class="popup-table-RoomColor">
            <thead>
            <tr>
                <th>Room name</th>
                <th>Total CO2e emission (kg)</th>
            </tr>
            </thead>
            <tbody>
            ${Object.entries(data).sort().map(item =>`
            <tr class="parent-row">
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>
        `;
        //container.innerHTML = ''; // clear the container
        container.innerHTML = tableHTML;

    }else{
        alert("Please allow popups for this site");
    }
}