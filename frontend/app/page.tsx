import Link from "next/link"
import { headers } from "next/headers"
import languagesObject from './languages.json'

export default async function Home() {
  const headersList = await headers()
  const language = headersList.get('accept-language')
  const userLanguage = language?.split(',')[0] || 'en-US'

  const title = languagesObject['en-US'].home_title
  const logLine = languagesObject['en-US'].home_logline
  const optionsTexts = languagesObject['en-US'].home_options
  const aboutTitle = languagesObject['en-US'].home_about_title
  const aboutText = languagesObject['en-US'].home_about_text
  const featuresTexts = languagesObject['en-US'].home_features_section

  return (
    <>
      <main className="bg-[url(/images/home-background.png)] bg-cover w-dvw h-dvh flex justify-evenly items-center flex-col">
        <h1 className="font-['thecenturion'] leading-[10dvh] text-(--gold) text-[24dvw] text-shadow-[-8px_8px_4px_#0009] sm:text-[16dvw] lg:text-[10dvw]">{title}</h1>
        <div className="flex">
          <Link href="/login" className="border-(--gold) border-3 rounded-[7px] bg-(--gray) text-white px-[5%] pt-[6%] text-[15px] font-bold transition-all duration-300 hover:bg-(--goldgray)">{optionsTexts[0]}</Link>
          <p className="text-white text-[35px] font-['cloisterblack'] mx-5">{optionsTexts[1]}</p>
          <Link href="/register" className="border-(--gold) border-3 rounded-[7px] bg-(--gray) text-white px-[5%] pt-[6%] text-[15px] font-bold transition-all duration-300 hover:bg-(--goldgray)">{optionsTexts[2]}</Link>
        </div>
        <p className="text-white text-[20px] w-[70%] text-center font-serif font-bold lg:text-[27px] lg:w-[50%]">{logLine}</p>
      </main>

      <img src="images/division_bar.png" alt="Section Division Image" className="absolute w-screen top-[96dvh] left-0" />

      <section className="bg-[url(/images/home_about_section.jpg)] bg-center bg-cover w-dvw h-dvh flex flex-col justify-evenly items-center md:flex-row">
        <h1 className="text-white font-['cloisterblack'] text-[15vw] sm:text-[6dvw] sm:font-[10vw]">{aboutTitle}</h1>
        <p className="bg-[url(/images/parchment_2.png)] text-center bg-center w-[92%] aspect-8/7 text-shadow-[-1px_1px_2px_#000a] bg-cover font-serif text-[5dvw] pt-[14%] px-[6%] sm:w-[40%] sm:text-[2vw] sm:pt-[6%]">{aboutText}</p>
      </section>

      <img src="images/division_bar.png" alt="Section Division Image" className="absolute w-dvw top-[196dvh] left-0" />

      <section className="bg-[url(/images/home_features_section.png)] bg-center bg-cover w-dvw h-dvh flex flex-col justify-evenly items-center">
        <div className="w-[90dvw] flex justify-start">
          <p className="text-white text-center text-[5dvw] font-bold w-[45%] font-serif text-shadow-[-2px_2px_2px_#000a] sm:text-[2dvw]">{featuresTexts[0]}</p>
        </div>

        <div className="w-[90dvw] flex justify-end">
          <p className="text-white text-center text-[5dvw] font-bold w-[45%] font-serif text-shadow-[-2px_2px_2px_#000a] sm:text-[2dvw]">{featuresTexts[1]}</p>
        </div>

        <div className="w-[90dvw] flex justify-start">
          <p className="text-white text-center text-[5dvw] font-bold w-[45%] font-serif text-shadow-[-2px_2px_2px_#000a] sm:text-[2dvw]">{featuresTexts[2]}</p>
        </div>
      </section>
    </>
  )
}