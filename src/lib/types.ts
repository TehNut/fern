export interface CalculatedTime {
	withoutRewatches: number;
	withRewatches: number;
	diff: number;
}

export interface CalculatedReponse {
	time: CalculatedTime;
	mediaTimes: {
		media: Media;
		rewatches: number,
		time: CalculatedTime;
	}[]
}

export interface AniListResponse {
	data: GraphQLData;
}

export interface GraphQLData {
	MediaListCollection: MediaListCollection;
}

export interface MediaListCollection {
	user: User;
	lists: List[];
}

export interface User {
	id: number;
	name: string;
	avatar: Avatar;
}

export interface Avatar {
	large: string;
}

export interface List {
	entries: MediaListEntry[];
}

export interface MediaListEntry {
	id: number;
	status: Status;
	progress: number;
	repeat: number;
	media: Media;
}

export interface Media {
	id: number;
	title: Title;
	episodes: number | null;
	duration: number | null;
	siteUrl: string;
	coverImage: CoverImage;
}

export interface CoverImage {
	extraLarge: string;
	color: string;
}

export interface Title {
	romaji: string;
}

export enum Status {
	completed = "COMPLETED",
	current = "CURRENT",
	dropped = "DROPPED",
	paused = "PAUSED",
}
