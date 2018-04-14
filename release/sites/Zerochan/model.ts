export const source: ISource = {
    name: "Zerochan",
    modifiers: [],
    auth: {},
    apis: {
        rss: {
            name: "RSS",
            auth: [],
            forcedLimit: 100,
            search: {
                url: (query: any, opts: any, previous: any): string => {
                    const pagePart = Grabber.pageUrl(query.page, previous, 100, "p={page}", "o={max}", "o={min}");
                    return "/" + query.search + "?" + pagePart;
                },
                parse: (src: string): IParsedSearch => {
                    const map = {
                        "page_url": "link",
                        "tags": "media:keywords",
                        "preview_url": "media:thumbnail",
                        "file_url": "media:content",
                    };

                    const data = Grabber.parseXML(src).rss.channel.item;

                    const images: IImage[] = [];
                    for (const image of data) {
                        const img = Grabber.mapFields(image, map);
                        img["id"] = Grabber.regexToConst("id", "/(?<id>\\d+)", img["page_url"]);
                        images.push(img);
                    }

                    return { images };
                },
            },
        },
        html: {
            name: "Regex",
            auth: [],
            forcedLimit: 22,
            search: {
                url: (query: any, opts: any, previous: any): string => {
                    const pagePart = Grabber.pageUrl(query.page, previous, 100, "p={page}", "o={max}", "o={min}");
                    return "/" + query.search + "?s=id&xml&" + pagePart;
                },
                parse: (src: string): IParsedSearch => {
                    return {
                        tags: Grabber.regexToTags("<li[^>]*>\\s*<a [^>]+>(?<name>[^>]+)</a>\\s+(?:<span>(?<type>[^<]+) (?<count>[0-9]+)</span>|(?<type_2>[^<]*))\\s*</li>", src),
                        images: Grabber.regexToImages("<a href=['\"]/(?<id>[^'\"]+)['\"][^>]*>[^<]*(?:<b>[^<]*</b>)?[^<]*(?:<span>[^<]*</span>)?[^<]*(?<image><img\\s*src=['\"](?<preview_url>[^'\"]*)['\"][^>]*/?>)", src),
                        pageCount: Grabber.regexToConst("page", "page (?:[0-9,]+) of (?<page>[0-9,]+)", src),
                        imageCount: Grabber.regexToConst("count", "has (?<count>[0-9,]+) .*?images\\.", src),
                    };
                },
            },
            details: {
                url: (id: number, md5: string): string => {
                    return "/" + id;
                },
                parse: (src: string): IParsedDetails => {
                    return {
                        tags: Grabber.regexToTags("<li[^>]*>\\s*<a [^>]+>(?<name>[^>]+)</a>\\s+(?:<span>(?<type>[^<]+) (?<count>[0-9]+)</span>|(?<type_2>[^<]*))\\s*</li>", src),
                        imageUrl: Grabber.regexToConst("url", '<div id="large">\\s*<a href="(?<url>[^"]+)"[^>]* tabindex="1">', src),
                        createdAt: Grabber.regexToConst("date", 'Entry by <a href="[^"]+">[^<]+</a>\\s*<span title="(?<date>[^"]+)">', src),
                    };
                },
            },
        },
    },
};
