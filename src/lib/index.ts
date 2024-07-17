import type { CalculatedReponse, MediaListEntry } from "./types";

export function calculateWatchTime(entries: MediaListEntry[]): CalculatedReponse {
	const result: CalculatedReponse = {
		time: {
			withRewatches: 0,
			withoutRewatches: 0,
			diff: 0
		},
		mediaTimes: []
	};

	for (const entry of entries) {
		const withRewatches = ((entry.repeat * entry.media.episodes) + entry.progress) * entry.media.duration;
		const withoutRewatches = entry.progress * entry.media.duration;
		const diff = withRewatches - withoutRewatches;

		result.time.withRewatches += withRewatches;
		result.time.withoutRewatches += withoutRewatches;
		result.time.diff += diff;
		result.mediaTimes.push({
			media: entry.media,
			rewatches: entry.repeat,
			time: {
				withRewatches,
				withoutRewatches,
				diff
			}
		});
	}

	return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryAniList<T>(query: string, variables: Record<string, any>) {
	return fetch("https://graphql.anilist.co", {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables
		})
	}).then(res => res.json() as Promise<T>);
}

export const LIST_QUERY = `query ($username: String!) {
  MediaListCollection(userName: $username, type: ANIME, status_in: [ COMPLETED, CURRENT, DROPPED, PAUSED ]) {
		user {
      id
      name
      avatar {
        large
      }
    }
    lists {
      entries {
        id
        status
        progress
        repeat
        media {
          id
          title {
            romaji
          }
          episodes
          duration
          siteUrl
          coverImage {
						color
            extraLarge
          }
        }
      }
    }
  }
}`;