/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const config = {
                extensions: ['Autodesk.DocumentBrowser','CustomProperties','Autodesk.DataVisualization','Colorization',
                "Autodesk.VisualClusters",]
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
        // Populate the SQL data in the SQL_data object
        getSQLdata();
    });
}
/*
// Colors all isolated objects from all shown models
export function colorByValue(viewer) {
    console.log("Coloring by value");
    var dbids = getAlldbids();
    var color = (0, 1, 1, 1);
    const viewer = view.viewer;
    model = this.model;
    for (var model of Models) {
        isolateddbIds = viewer.getIsolatedNodes(model)
        for (var dbIds of isolateddbIds) {
            viewer.setThemingColor(dbIds, new THREE.Vector4(color), model, false)
        }
    }
}

export function getAlldbids(model, viewer, propertyvalue, propertyname) {
    model.search('"' + propertyvalue + '"', function (dbIds) {
        if (dbIds.length == 0) {
            viewer.hide(getLoadedIds())
        } else {
            viewer.isolate(dbIds, model)
        }
    }, function (error) { console.log("Error OnPropertyClick " + error) }, propertyname, searchHidden = false)
}

// Function to grab node of all visible models
export function GetModels(viewer) {
    var modelurn = [];
    var visibleNodes = view.getVisibleNodes();
    visibleNodes.forEach(node => {
        var i = view.getModel(node);
        modelurn.push(i);
    });
    return modelurn;
    */