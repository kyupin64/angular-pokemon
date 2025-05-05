export interface User {
    uid: string,
    email: string,
    username: string,
    stats: {
        played: number,
        won: number,
        lost: number,
        matches: number,
        beat: Array<string>,
        lostTo: Array<string>
    },
    createdAt: Date,
    lastUpdated: Date
}
