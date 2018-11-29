export class HTMLAppend {

    static appendThumbnail(appendTo:any,thumbnailData: any, videoTitle: string = "generic title", author: string = "generic author"): void {
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
        link.classList.add("yt-thumbnail");

        appendTo.appendChild(link);
    }

    static appendVideo(appendTo:any ,videoID: string, videoTitle: string = "generic title"): void {
        const iframe = document.createElement('iframe');
        iframe.title = videoTitle;
        iframe.setAttribute("src", `https://www.youtube.com/embed/${videoID}`);
        iframe.setAttribute("width", "560");
        iframe.setAttribute("height", "315");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        appendTo.appendChild(iframe);
    }

}