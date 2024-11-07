import { User } from "./user";

export interface CurrentGameCard {
    id: string,
    name: string,
    found: boolean,
    playerFound: User | null,
    revealed: boolean,
    images: {
        small: string,
        large: string,
        setLogo: string
    }
}
