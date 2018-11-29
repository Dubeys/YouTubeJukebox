import { GoogleAuth } from './ts/google.auth';
import { GoogleRequest } from './ts/google.request';
import { App } from './ts/app';
import { gapiKey } from './ts/gapi.key';

import './styles/index.scss';

declare global {
    interface Window {
        onGoogleApiLoad: any
    }
}

window.onGoogleApiLoad = function (api:any) {

    const auth = new GoogleAuth(api, gapiKey);
    const req = new GoogleRequest();
    const app = new App();

    app.onUserLoginEvent = auth.handleAuth.bind(auth);
    app.onUserLogoutEvent = auth.handleSignout.bind(auth);

    auth.onSignin = (api:any) => {
        req.request(api).then( () => {
            app.showThumbnails(req.latestVideos);
        })
        app.handleLogin();
    };
    auth.onSignout = () => {
        req.dispose();
        app.handleLogout();
    };
}