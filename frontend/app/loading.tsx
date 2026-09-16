import { headers } from "next/headers"
import languagesObject from './languages.json'

export default function Loading() {
    const loadingText = languagesObject['en-US'].general_loading

    return (
        <>
            <h1 className="text-[5vw]">{loadingText}</h1>
        </>
    )
}