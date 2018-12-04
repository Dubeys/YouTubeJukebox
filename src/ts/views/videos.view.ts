import { PolymerElement,html } from "@polymer/polymer";

import {YTJBThumbnail} from "../elements/thumbnail.element"

export class YTJBVideos extends PolymerElement {

    _videos: object[] = [];

    constructor() {
        super();
    }

    static get properties() {
        return {
            _videos: {
                type: Array,
                observer: '_videosChanged'
            }
        }
    }

    static get template() {
        return html`
            <style>
                :host {
                    display: flex;
                    flex-wrap: wrap;
                    max-width: 1056px;
                    margin: 0 auto;
                    padding: 0 1em;
                } 
            </style>
        `;
    }

    _videosChanged(propNew:any, propOld:any) {

        propNew.map( (video:any) => {
            (<Element>this.root).appendChild(new YTJBThumbnail(video));
        })
        
    }


}

customElements.define('ytjb-videos', YTJBVideos);