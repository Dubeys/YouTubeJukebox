import { PolymerElement, html } from '@polymer/polymer';

import { GoogleAuth } from '../services/google.auth';
import { GoogleData } from '../services/google.data';
import { gapiKey } from '../gapi.key';

import './videos.view';

export class YTJBApp extends PolymerElement { 

    private _auth: GoogleAuth;
    private _data: GoogleData;

    private _loginDisplay: string;
    private _logoutDisplay: string;

    private _videos: object[] = [];

    constructor (api:any) {
        super();

        this._auth = new GoogleAuth(api, gapiKey);
        this._data = new GoogleData();

        this._loginDisplay = 'none';
        this._logoutDisplay = 'none';
        
    }

    static get properties() {
        return {
            _loginDisplay: String,
            _logoutDisplay: String,
            _videos: Array
        }
    }

    static get template() {

        return html`

            <style>

                :host {
                    display: block;
                    width: 100%;
                    background: white;
                }

            </style>

            <h1>Youtube Jukebox</h1>
            <button id="authorize-button" style="display: [[_loginDisplay]];">Authorize</button>
            <button id="signout-button" style="display: [[_logoutDisplay]];">Sign Out</button>

            <div id="content">

                <ytjb-videos id="videos-page" _videos="[[_videos]]"></ytjb-videos>
            
            </div>
        `

    }

    connectedCallback() {
        super.connectedCallback();

        this.$["authorize-button"].addEventListener('click', (e) => {
            e.preventDefault();
            this._auth.handleAuth();
        })

        this.$["signout-button"].addEventListener('click', (e) => {
            e.preventDefault();
            this._auth.handleSignout();
        })

        this._auth.onSignin = (api: any) => {
            this.handleSignin(api);
        };
        this._auth.onSignout = () => {
            this.handleSignout();
        };
    }

    private handleSignin(api:any) {
        this._loginDisplay = 'none';
        this._logoutDisplay = 'block';

        this._data.init(api)
            .then( () => this._data.getAllVideos() )
            .then( () => {

                const videos = this._data.getVideosByDate(1);
                this.set('_videos',videos);

            });
    }

    private handleSignout() {
        this._loginDisplay = 'block';
        this._logoutDisplay = 'none';

        this._data.dispose();
    }

}

customElements.define('ytjb-app',YTJBApp);