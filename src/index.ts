import { GoogleAuth } from './ts/services/google.auth';
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
    const app = new App();

    app.onUserLoginEvent = auth.handleAuth.bind(auth);
    app.onUserLogoutEvent = auth.handleSignout.bind(auth);

    auth.onSignin = (api:any) => {
        app.handleLogin(api);
    };
    auth.onSignout = () => {
        app.handleLogout();
    };
}