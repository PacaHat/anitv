"use server";
import { ANIME } from "@consumet/extensions";
import { CombineEpisodeMeta } from "@/utils/EpisodeFunctions";
import { getMappings } from "./mappings";

const gogo = new ANIME.Gogoanime();
const zoro = new ANIME.Zoro();

export async function fetchGogoEpisodes(id) {
  try {
    const data = await gogo.fetchAnimeInfo(id);
    return data?.episodes || [];
  } catch (error) {
    console.error("Error fetching gogoanime:", error.message);
    return [];
  }
}

export async function fetchZoroEpisodes(id) {
  try {
    const data = await zoro.fetchAnimeInfo(id);
    return data?.episodes || [];
  } catch (error) {
    console.error("Error fetching zoro:", error.message);
    return [];
  }
}

async function fetchEpisodeMeta(id, available = false) {
  try {
    if (available) {
      return null;
    }
    const res = await fetch(
      `https://api.ani.zip/mappings?anilist_id=${id}`
    );
    const data = await res.json()
    const episodesArray = Object.values(data?.episodes);
    return episodesArray || [];
  } catch (error) {
    console.error("Error fetching and processing meta:", error.message);
    return [];
  }
}

async function fetchEpisodes(id) {
  let mappings;
  let allepisodes = [];

  if (id) {
    mappings = await getMappings(id);
  }

  if (mappings) {
    if (mappings.gogoanime && Object.keys(mappings.gogoanime).length >= 1) {
      let subEpisodes = [];
      let dubEpisodes = [];

      if (
        mappings?.gogoanime?.uncensored ||
        mappings?.gogoanime?.sub ||
        mappings?.gogoanime?.tv
      ) {
        subEpisodes = await fetchGogoEpisodes(
          mappings?.gogoanime?.uncensored ||
            mappings.gogoanime.sub ||
            mappings?.gogoanime?.tv
        );
      }

      if (mappings?.gogoanime?.dub) {
        dubEpisodes = await fetchGogoEpisodes(mappings?.gogoanime?.dub);
      }

      if (subEpisodes?.length > 0 || dubEpisodes?.length > 0) {
        allepisodes.push({
          episodes: { sub: subEpisodes, dub: dubEpisodes },
          providerId: "gogoanime",
          consumet: true,
        });
      }
    }
    if (mappings?.zoro && Object.keys(mappings.zoro).length >= 1) {
      let subEpisodes = [];

      if (
        mappings?.zoro?.uncensored ||
        mappings?.zoro?.sub ||
        mappings?.zoro?.tv
      ) {
        subEpisodes = await fetchZoroEpisodes(
          mappings?.zoro?.uncensored
            ? mappings?.zoro?.uncensored
            : mappings.zoro.sub
        );
      }
      if (subEpisodes?.length > 0) {
        const transformedEpisodes = subEpisodes.map(episode => ({
          ...episode,
          id: transformEpisodeId(episode.id)
        }));
      
        allepisodes.push({
          episodes: transformedEpisodes,
          providerId: "zoro",
        });
      }
    }
  } 
  return allepisodes;
}

const fetchAndCacheData = async (id, meta, refresh) => {
  const allepisodes = await fetchEpisodes(id);
  const cover = await fetchEpisodeMeta(id, !refresh);

  let data = allepisodes;
  if (refresh) {
    if (cover && cover?.length > 0) {
      data = await CombineEpisodeMeta(allepisodes, cover);
    } else if (meta) {
      data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
    }
  } else if (meta) {
    data = await CombineEpisodeMeta(allepisodes, JSON.parse(meta));
  }

  return data;
}

export const getEpisodes = async (id, status, refresh = false) => {
  let meta = null;
  let cached = null;

  const data = await fetchAndCacheData(id, meta, refresh);
  return data;
};

function transformEpisodeId(episodeId) {
  const regex = /^([^$]*)\$episode\$([^$]*)/;
  const match = episodeId.match(regex);

  if (match && match[1] && match[2]) {
    return `${match[1]}?ep=${match[2]}`;
  }
  return episodeId;
}