class App {

    private _channelVideos: any[];

    private _api:any;

    constructor() {

        this._channelVideos = [];        

    }

    init(api:any) {

        this._api = api;

        this.getSubscriptions().then( () => {
            this.sortMostRecent();
            this.showThumbnails();
        } );

    }

    dispose(){

        const root:any = document.getElementById('content');
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        this._channelVideos = [];

    }

    getSubscriptions(token?: number, channelIDs: any[] = []): Promise<string[]> {

        return new Promise((resolve, reject) => {
            const request: any = {
                part: 'id,contentDetails,subscriberSnippet,snippet',
                mine: 'true',
                maxResults: 50
            }

            if (token) { // If we got a token from previous call
                request.pageToken = token; // .. attach it to the new request
            }

            this._api.client.youtube.subscriptions.list(request).execute((response: any) => {
                const list: any[] = response.items;

                const promises:any[] = [];

                for (let item of list) {
                    const channelInfo: any = item.snippet;
                    promises.push(this.getChannel(channelInfo.resourceId.channelId));
                }

                //once all the data related to the subscribed channels of this page have been fetched we can move on to the next page
                Promise.all(promises).then( () => {

                    const nextPage: number = response.nextPageToken; // get token for next page
                    if (nextPage) { // if has next
                        this.getSubscriptions(nextPage, channelIDs).then(() => { resolve() }); // recurse with the new token
                    } else {
                        resolve();
                    }

                })
            })
        })

    }

    getChannel(id:string) {

        return new Promise( (resolve, reject) => {

        
            const request = {
                part: 'snippet,contentDetails,statistics',
                id: id
            };

            this._api.client.youtube.channels.list(request).execute( (response:any) => {

                const uploadsID:string = response.items[0].contentDetails.relatedPlaylists.uploads;
                this.getUploads(uploadsID).then( () => resolve() );

            });

        });

    }

    getUploads(id:string) {

        return new Promise((resolve, reject) => {
            const request = {
                part: 'snippet,contentDetails',
                playlistId: id,
                maxResults: 1
            };

            this._api.client.youtube.playlistItems.list(request).execute( (response:any) => {

                const videosMeta:any[] = response.items;

                const videoList:any[] = [];

                for( let videoMeta of videosMeta ) {

                    this._channelVideos.push({
                        id: videoMeta.snippet.resourceId.videoId,
                        title: videoMeta.snippet.title,
                        author: videoMeta.snippet.channelTitle,
                        thumbnail: videoMeta.snippet.thumbnails.medium,
                        date: videoMeta.snippet.publishedAt
                    })

                }

                resolve();

            });

        });
    }

    sortMostRecent() {

        this._channelVideos.sort((a, b) => {
            const dateA: Date = new Date(a.date);
            const dateB: Date = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        })

    }

    showThumbnails() {

        for (let video of this._channelVideos ) {
                
                App.appendThumbnail(video.thumbnail,video.title,video.author);

        }

    }

    static appendThumbnail(thumbnailData:any , videoTitle:string = "generic title", author:string = "generic author"):void {
        let pre: any = document.getElementById('content');
        const link = document.createElement('a');
        link.title = videoTitle;
        link.style.width = thumbnailData.width + "px";

        const content = document.createElement('div');

        const title = document.createElement('h2');
        const authorEl = document.createElement('p');

        title.appendChild(document.createTextNode(videoTitle));
        authorEl.appendChild(document.createTextNode(author));

        const image = document.createElement('img');
        image.src = thumbnailData.url;
        image.alt = videoTitle;

        content.appendChild(image);
        content.appendChild(title);
        content.appendChild(authorEl);

        link.appendChild(content);

        pre.appendChild(link);
    }

    static appendVideo(videoID:string, videoTitle:string = "generic title"):void {
        let pre:any = document.getElementById('content');
        const iframe = document.createElement('iframe');
        iframe.title = videoTitle;
        iframe.setAttribute("src", `https://www.youtube.com/embed/${videoID}`);
        iframe.setAttribute("width", "560");
        iframe.setAttribute("height", "315");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        pre.appendChild(iframe);
    }

}

class GoogleAPI {

    private authorizeButton:any;
    private signoutButton:any;

    private api:any;
    private signinCB:any;
    private signoutCB:any;

    constructor( google:any, key:string ) {

        this.api = google;

        this.authorizeButton = document.getElementById('authorize-button');
        this.signoutButton = document.getElementById('signout-button');

        this.api.load('client:auth2', () => this.initClient(key));

    }

    initClient(key:string) {

        const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
        const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';

        this.api.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: key,
            scope: SCOPES
        }).then( () => {
            // Listen for sign-in state changes.
            this.api.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

            // Handle the initial sign-in state.
            this.updateSigninStatus(this.api.auth2.getAuthInstance().isSignedIn.get());
            this.authorizeButton.onclick = this.handleAuthClick.bind(this);
            this.signoutButton.onclick = this.handleSignoutClick.bind(this);
        });
    }

    updateSigninStatus(isSignedIn: boolean) {
        if (isSignedIn) {
            this.authorizeButton.style.display = 'none';
            this.signoutButton.style.display = 'block';
            this.signinCB(this.api);

        } else {
            this.authorizeButton.style.display = 'block';
            this.signoutButton.style.display = 'none';
            this.signoutCB();
        }
    }

    handleAuthClick(event: any) {
        this.api.auth2.getAuthInstance().signIn();
    }

    handleSignoutClick(event: any) {
        this.api.auth2.getAuthInstance().signOut();
    }

    set onSignin(fn:any) {
        this.signinCB = fn;
    }

    set onSignout(fn:any) {
        this.signoutCB = fn;
    }

}

declare let gapiKey:string;

function onGoogleApiLoad(api:any) {
    const connector = new GoogleAPI(api,gapiKey);
    const app = new App();
    connector.onSignin = (api:any) => {
        app.init(api)
    };
    connector.onSignout = () => {
        app.dispose();
    };
}