import { HTMLAppend } from './utils/html-append';

export class App {

    private _loginButton: any;
    private _logoutButton: any;

    constructor() {

        this._loginButton = document.getElementById('authorize-button');
        this._logoutButton = document.getElementById('signout-button');

    }

    handleLogin() {

        this._loginButton.style.display = 'none';
        this._logoutButton.style.display = 'block';

    }

    handleLogout() {

        this._loginButton.style.display = 'block';
        this._logoutButton.style.display = 'none';

        const root: any = document.getElementById('content');
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

    }

    showThumbnails(videos:any) {

        const parent = document.createElement('div');
        parent.classList.add("yt-latest");

        for (let video of videos) {

            HTMLAppend.appendThumbnail(parent,video.thumbnail, video.title, video.author);

        }

        let pre: any = document.getElementById('content');
        pre.appendChild(parent);

    }

    set onUserLoginEvent(fn:any) {
        this._loginButton.onclick = fn;
    }

    set onUserLogoutEvent(fn:any) {
        this._logoutButton.onclick = fn;
    }

}