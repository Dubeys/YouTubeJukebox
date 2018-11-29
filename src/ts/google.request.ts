export class GoogleRequest {

    private _channelVideos: any[];

    private _api: any;

    constructor() {

        this._channelVideos = [];

    }

    request(api: any): Promise<string[]> {

        this._api = api;
        return new Promise ( (resolve, reject) => {

            this.requestSubscriptions().then(() => {
                this.sortMostRecent();
                resolve();
            });

        })

    }

    dispose() {

        const root: any = document.getElementById('content');
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        this._channelVideos = [];

    }

    requestSubscriptions(token?: number, channelIDs: any[] = []): Promise<string[]> {

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

                const promises: any[] = [];

                for (let item of list) {
                    const channelInfo: any = item.snippet;
                    promises.push(this.requestChannel(channelInfo.resourceId.channelId));
                }

                //once all the data related to the subscribed channels of this page have been fetched we can move on to the next page
                Promise.all(promises).then(() => {

                    const nextPage: number = response.nextPageToken; // get token for next page
                    if (nextPage) { // if has next
                        this.requestSubscriptions(nextPage, channelIDs).then(() => { resolve() }); // recurse with the new token
                    } else {
                        resolve();
                    }

                })
            })
        })

    }

    requestChannel(id: string) {

        return new Promise((resolve, reject) => {


            const request = {
                part: 'snippet,contentDetails,statistics',
                id: id
            };

            this._api.client.youtube.channels.list(request).execute((response: any) => {

                const uploadsID: string = response.items[0].contentDetails.relatedPlaylists.uploads;
                this.requestUploads(uploadsID).then(() => resolve());

            });

        });

    }

    requestUploads(id: string) {

        return new Promise((resolve, reject) => {
            const request = {
                part: 'snippet,contentDetails',
                playlistId: id,
                maxResults: 1
            };

            this._api.client.youtube.playlistItems.list(request).execute((response: any) => {

                const videosMeta: any[] = response.items;

                const videoList: any[] = [];

                for (let videoMeta of videosMeta) {

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

    get latestVideos (): any[] {
        return this._channelVideos;
    }

}