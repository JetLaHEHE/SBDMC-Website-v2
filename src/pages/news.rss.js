import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("news");
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: "SBDMC, Inc. — News & Updates",
    description: "Latest news and announcements from SBDMC, Inc.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: "/en/news/" + post.id.replace(/\.\w+$/, "") + "/",
    })),
    customData: "<language>en</language>",
  });
}
