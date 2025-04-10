export interface CurrentGameCard {
    id: string,
    name: string,
    found: boolean,
    playerFoundId: string | null,
    revealed: boolean,
    images: {
        small: string,
        large: string,
        setLogo: string
    }
}
