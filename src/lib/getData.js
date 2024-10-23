"use server"
import { ANIME } from "@consumet/extensions";
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import { findSimilarTitles } from '@/lib/stringSimilarity'

const gogo = new ANIME.Gogoanime();
const hianime = new ANIME.Zoro();

export async function getMappings(anilistId) {
    const data = await getInfo(anilistId);
    let gogores, zorores;
    if (!data) {
        return null;
    }
    gogores = await mapGogo(data?.title);
    zorores = await mapZoro(data?.title);
    return { gogoanime: gogores, zoro: zorores, id: data?.id, malId: data?.idMal, title: data?.title.romaji };
}

async function getInfo(id) {
    try {
        const data = await AnimeInfoAnilist(id);
        return data;
    } catch (error) {
        console.error("Error fetching info: ", error);
    }
}

export async function getRecentEpisodes() {
    try {
        const res = await fetch(
            `https://anify.eltik.cc/recent?type=anime&page=1&perPage=20&fields=[id,title,status,format,currentEpisode,coverImage,episodes,totalEpisodes]`
        );
        const data = await res.json();
        const mappedData = data.map((i) => {
            const episodesData = i?.episodes?.data;
            const getEpisodes = episodesData ? episodesData.find((x) => x.providerId === "gogoanime") || episodesData[0] : [];
            const getEpisode = getEpisodes?.episodes?.find(
                (x) => x.number === i.currentEpisode
            );

            return {
                id: i.id,
                latestEpisode: getEpisode?.id ? getEpisode.id.substring(1) : '',
                title: i.title,
                status: i.status,
                format: i.format,
                totalEpisodes: i?.totalEpisodes,
                currentEpisode: i.currentEpisode,
                coverImage: i.coverImage,
            };
        });
        return mappedData;
    } catch (error) {
        console.error("Error fetching Recent Episodes:", error);
        return [];
    }
}

export const GET = async (req) => {
    const data = await getRecentEpisodes();
    if (data && data.length > 0) {
        return data;
    } else {
        return { message: "Recent Episodes not found" };
    }
};