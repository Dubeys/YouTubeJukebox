import {YTJBApp} from './ts/views/app.view';

import './styles/index.scss';

declare global {
    interface Window {
        onGoogleApiLoad: any
    }
}

window.onGoogleApiLoad = function (api:any) {

    const appView = new YTJBApp(api);
    document.body.appendChild(appView);

}