'use server'
import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

let watchHistory = [];

export const getWatchHistory = async () => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return;
    }
    const history = watchHistory.filter(watch => watch.userName === session.user.name);
    return history;
  } catch (error) {
    console.error("Error fetching watch history", error);
  }
  revalidatePath("/");
};

export const createWatchEp = async (aniId, epNum) => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return;
    }

    const existingWatch = watchHistory.find(watch => 
      watch.userName === session.user.name && 
      watch.aniId === aniId && 
      watch.epNum === epNum
    );

    if (existingWatch) {
      return null;
    }

    const newWatch = {
      userName: session.user.name,
      aniId,
      epNum,
      createdAt: new Date()
    };
    watchHistory.push(newWatch);
    return newWatch;
  } catch (error) {
    console.error("Oops! Something went wrong while creating the episode tracking:", error);
    return;
  }
};

export const getEpisode = async (aniId, epNum) => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return;
    }

    if (aniId && epNum) {
      const episode = watchHistory.filter(watch => 
        watch.userName === session.user.name && 
        watch.aniId === aniId && 
        watch.epNum === epNum
      );
      if (episode && episode.length > 0) {
        return episode;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return;
  }
};

export const updateEp = async ({aniId, aniTitle, epTitle, image, epId, epNum, timeWatched, duration, provider, nextepId, nextepNum, subtype}) => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return;
    }

    const index = watchHistory.findIndex(watch => 
      watch.userName === session.user.name && 
      watch.aniId === aniId && 
      watch.epNum === epNum
    );

    if (index !== -1) {
      watchHistory[index] = {
        ...watchHistory[index],
        aniTitle: aniTitle || null,
        epTitle: epTitle || null,
        image: image || null,
        epId: epId || null,
        timeWatched: timeWatched || null,
        duration: duration || null,
        provider: provider || null,
        nextepId: nextepId || null,
        nextepNum: nextepNum || null,
        subtype: subtype || "sub",
      };
      return watchHistory[index];
    }

    return;
  } catch (error) {
    console.log('Error updating episode:', error);
    return;
  }
}

export const deleteEpisodes = async (data) => {
  try {
    const session = await getAuthSession();
    if (!session) {
      return;
    }

    let deletedData;

    if (data.epId) {
      const index = watchHistory.findIndex(watch => 
        watch.userName === session.user.name && 
        watch.epId === data.epId
      );
      if (index !== -1) {
        deletedData = watchHistory.splice(index, 1)[0];
      }
    } else if (data.aniId) {
      deletedData = watchHistory.filter(watch => 
        watch.userName === session.user.name && 
        watch.aniId === data.aniId
      );
      watchHistory = watchHistory.filter(watch => 
        !(watch.userName === session.user.name && watch.aniId === data.aniId)
      );
    } else {
      return { message: "Invalid request, provide watchId or aniId" };
    }

    if (!deletedData) {
      return { message: "Data not found for deletion" };
    }

    const remainingData = watchHistory.filter(watch => watch.userName === session.user.name);

    return { message: `Removed anime from history`, remainingData, deletedData }
  } catch (error) {
    console.log(error);
    return;
  }
}