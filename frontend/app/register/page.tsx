'use client'

import { FormEvent } from "react"
import languagesObject from '../languages.json'

export default function RegisterPage() {
  const userLanguage = navigator.language
  const placeholders = languagesObject['en-US'].register_placeholders
  const errorTexts = languagesObject['en-US'].register_errors
  const sendtext = languagesObject['en-US'].login_send_button

  async function sendData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const request = await fetch('http://localhost:3001/register/validate/fields', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: data.get('account_id'), password: data.get('password'), nickname: data.get('user_nickname') })
    })

    const response = await request.json()

    const fields = document.querySelectorAll('.fielddiv')

    for (const field of fields) {
      field.classList.remove('invalid')
      const span = field.querySelector('span')
      if (span) span.remove()
    }

    const texts: string[][] = [
      [
        'This user ID already exists. Choose another',
        'This user ID is too short. Must be 6 to 20 characters',
        'This user ID is too long. Must be 6 to 20 characters'
      ],
      [
        'This password is too short. Must be 10 to 45 characters',
        'This password is too long. Must be 10 to 45 characters'
      ],
      [
        'This player name is too short. Must be 5 to 30 characters',
        'This player name is too long. Must be 5 to 30 characters'
      ]
    ]

    if (response.messages) {
      for (const msg of response.messages) {
        fields[msg.code[0]].innerHTML += `<span id="account-id-span" class="w-67.5 md:w-80 text-[12px]">${errorTexts[msg.code[1]]}</span>`
        fields[msg.code[0]].classList.add('invalid')
      }
    }
  }

  return (
    <main className="bg-[url(/images/register_background_1.png)] bg-cover bg-center w-dvw h-dvh flex justify-center items-center">
      <form onSubmit={sendData} className="bg-[url(/images/parchment_1.png)] bg-cover bg-center flex flex-col justify-evenly items-center aspect-5/6 w-[98dvw] pb-[3dvh] sm:w-[30dvw] md:w-[35dvw] lg:w-[30dvw]">
        <img src="/images/logo.png" width={80} alt="Logo" />

        <div id="account-id" className="flex flex-col fielddiv">
          <input type="text" name="account_id" placeholder={placeholders[0]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" />
        </div>

        <div id="password" className="flex flex-col fielddiv">
          <input type="password" name="password" placeholder={placeholders[1]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" />
        </div>

        <div id="user-nickname" className="flex flex-col fielddiv">
          <input type="text" name="user_nickname" placeholder={placeholders[2]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" />
        </div>

        <button type="submit" className="border-(--darkgoldgray) border-3 rounded-[7px] bg-(--goldgray) text-white py-1 text-[15px] w-[50dvw] font-bold transition-all duration-300 hover:bg-(--darkgoldgray) cursor-pointer sm:w-[15dvw]">{sendtext}</button>
      </form>
    </main>
  )
}