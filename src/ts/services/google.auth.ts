export class GoogleAuth {
    
    private api: any;
    private signinCB: any;
    private signoutCB: any;

    constructor(google: any, key: string) {

        this.api = google;

        this.api.load('client:auth2', () => this.initClient(key));

    }

    initClient(key: string) {

        const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
        const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';

        this.api.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: key,
            scope: SCOPES
        }).then(() => {
            // Listen for sign-in state changes.
            this.api.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

            // Handle the initial sign-in state.
            this.updateSigninStatus(this.api.auth2.getAuthInstance().isSignedIn.get());
        });
    }

    updateSigninStatus(isSignedIn: boolean) {
        if (isSignedIn) {
            this.signinCB(this.api);

        } else {
            this.signoutCB();
        }
    }

    handleAuth(event: any) {
        this.api.auth2.getAuthInstance().signIn();
    }

    handleSignout(event: any) {
        this.api.auth2.getAuthInstance().signOut();
    }

    set onSignin(fn: any) {
        this.signinCB = fn;
    }

    set onSignout(fn: any) {
        this.signoutCB = fn;
    }

}