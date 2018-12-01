export class GoogleRequest {

    private _api: any;

    constructor(api: any) {

        this._api = api;

    }

    requestUserInfo() {
        return new Promise((resolve, reject) => {
            const request: any = {
                part: 'id',
                mine: 'true',
                prettyPrint: false
            }

            this._api.client.youtube.channels.list(request).execute((response: any) => {

                resolve(response.items[0])

            })
        })
    }

    requestSubscriptions(token?: number, prevResponse: any[] = []): Promise<string[]> {

        return new Promise((resolve, reject) => {
            const request: any = {
                part: 'snippet',
                mine: 'true',
                maxResults: 50,
                prettyPrint: false
            }

            if (token) { // If we got a token from previous call
                request.pageToken = token; // .. attach it to the new request
            }

            this._api.client.youtube.subscriptions.list(request).execute((response: any) => {
                const responses: any[] = [...prevResponse,...response.items];

                const nextPage: number = response.nextPageToken; // get token for next page
                if (nextPage) { // if has next
                    this.requestSubscriptions(nextPage, responses).then((fullResponses) => { resolve(fullResponses) }); // recurse with the new token
                } else {
                    resolve(responses);
                }

            })
        })

    }

    requestChannel(id: any) {

        return new Promise((resolve, reject) => {


            const request = {
                part: 'contentDetails,statistics',
                id: id,
                prettyPrint: false
            };

            this._api.client.youtube.channels.list(request).execute((response: any) => {

                resolve(response.items);

            });

        });

    }

    requestUploads(id: string,token?:number) {

        return new Promise((resolve, reject) => {
            const request:any = {
                part: 'snippet',
                playlistId: id,
                maxResults: 50,
                prettyPrint: false
            };

            if (token) { // If we got a token from previous call
                request.pageToken = token; // .. attach it to the new request
            }

            this._api.client.youtube.playlistItems.list(request).execute((response: any) => {

                resolve({items: response.items,token: response.result.nextPageToken});

            });

        });
    }

}