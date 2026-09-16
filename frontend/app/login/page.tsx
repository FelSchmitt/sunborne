'use client'

import { useRouter } from "next/navigation"
import { FormEvent } from "react"
import languagesObject from '../languages.json'



export default function LoginPage() {
  const router = useRouter()
  const userLanguage = navigator.language
  const placeholders = languagesObject['en-US'].login_placeholders
  const errorTexts = languagesObject['en-US'].login_errors
  const sendtext = languagesObject['en-US'].login_send_button

  async function sendData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const request = await fetch('http://localhost:3001/login/validate', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ account_id: data.get('account_id'), password: data.get('password') })
    })

    const response = await request.json()

    const fields: NodeListOf<HTMLDivElement> = document.querySelectorAll('.fielddiv')

    for (const field of fields) {
      field.classList.remove('invalid')
      const span = field.querySelector('span')
      if (span) span.remove()
    }

    if (response.field) {
      fields[response.field].innerHTML += `<span class="w-67.5 md:w-80 text-[15px] text-orange-400">${errorTexts[response.field]}</span>`
    }

    else if (response.user_nickname) {
      localStorage.setItem('id', response.account_id)
      localStorage.setItem('nickname', response.user_nickname)
      localStorage.setItem('cards', JSON.stringify(response.cards))
      localStorage.setItem('decks', JSON.stringify(response.decks))
      router.push('/userspace')
    }
  }

  return (
    <main className="bg-[url(/images/register_background_1.png)] bg-cover bg-center w-dvw h-dvh flex justify-center items-center">
      <form onSubmit={sendData} className="bg-[url(/images/parchment_1.png)] bg-cover bg-center flex flex-col justify-evenly items-center aspect-5/6 w-[98dvw] pb-[3dvh] sm:w-[30dvw] md:w-[35dvw] lg:w-[30dvw]">
        <img src="/images/logo.png" width={80} alt="Logo" />

        <div id="account-id" className="fielddiv">
          <input type="text" name="account_id" placeholder={placeholders[0]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" />
        </div>

        <div id="password" className="fielddiv">
          <input type="password" name="password" placeholder={placeholders[1]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" />
        </div>

        <button type="submit" className="border-(--darkgoldgray) border-3 rounded-[7px] bg-(--goldgray) text-white py-1 text-[15px] w-[50dvw] font-bold transition-all duration-300 hover:bg-(--darkgoldgray) cursor-pointer sm:w-[15dvw]">{sendtext}</button>
      </form>
    </main>
  )
}