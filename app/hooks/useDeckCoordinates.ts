import { atom, useAtom, useSetAtom } from 'jotai'

const deckCoordinatesAtom = atom<[number, number]>()

export const useDeckCoordinatesAtom = () => useAtom(deckCoordinatesAtom)
