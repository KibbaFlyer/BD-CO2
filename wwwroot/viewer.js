/// import * as Autodesk from "@types/forge-viewer";
//import './extensions/LoggerExtension.js';
import './extensions/SummaryExtension.js';
import { myChart1, myChart2 } from './extensions/charts.js';


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
                "Autodesk.VisualClusters", /*"LoggerExtension",*/'SummaryExtension','Autodesk.AEC.LevelsExtension']
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    return new Promise(async function (resolve, reject) {
        await getSQLdata();
        function onDocumentLoadSuccess(doc) {
            var viewableId = "517a1b5a-262e-7aa4-ff38-eed0417ed213" //"57851bd6-0496-7b2a-9de6-d53d2cb5ff0f"
            // if a viewableId was specified, load that view, otherwise the default view
            var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
            console.log(viewables);
            console.log(doc);
            resolve(viewer.loadDocumentNode(doc, viewables));
            viewer.addEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                async function onGeometryLoaded() {
                  viewer.removeEventListener(
                    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                    onGeometryLoaded
                  );
                  await myChart1();
                  await myChart2();
                }
              );
            resolve();
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
        // Populate the SQL data in the SQL_data object
    });
}