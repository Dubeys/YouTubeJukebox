import { GoogleAPI } from './ts/google.api';
import { App } from './ts/app';
import { gapiKey } from './ts/gapi.key';

import './styles/index.scss';

declare global {
    interface Window {
        onGoogleApiLoad: any
    }
}

window.onGoogleApiLoad = function (api:any) {
    const connector = new GoogleAPI(api,gapiKey);
    const app = new App();
    connector.onSignin = (api:any) => {
        app.init(api)
    };
    connector.onSignout = () => {
        app.dispose();
    };
}