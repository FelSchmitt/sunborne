'use client'

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import languagesObject from '../languages.json'
import FieldsForm from "./FieldsForm"
import VerificationCodeForm from "./VerificationCodeForm"



const userLanguage = navigator.language
const regErrorTexts = languagesObject['en-US'].register_errors
const codErrorTexts = languagesObject['en-US'].verification_code_errors



export default function RegisterPage() {
  const router = useRouter()
  const [currentForm, changeForm] = useState(<FieldsForm sendFunction={sendNewAccountData} />)

  const forms = [
    <FieldsForm sendFunction={sendNewAccountData} />,
    <VerificationCodeForm sendFunction={sendValidationCode} />
  ]



  async function sendNewAccountData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const request = await fetch('http://localhost:3001/register/validate/fields', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: data.get('account_id'), password: data.get('password'), nickname: data.get('user_nickname') })
    })

    const response = await request.json()

    const fields: NodeListOf<HTMLElement> = document.querySelectorAll('.fielddiv')

    for (const field of fields) {
      field.classList.remove('invalid')
      const span = field.querySelector('span')
      if (span) span.remove()
    }

    if (response.ok === false) {
      for (const msg of response.messages) {
        fields[msg.code[0]].innerHTML += `<span class="w-67.5 md:w-80 text-[12px]">${regErrorTexts[msg.code[1]]}</span>`
        fields[msg.code[0]].classList.add('invalid')
      }
    }
    else if (response.ok) changeForm(forms[1])
  }

  async function sendValidationCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const request = await fetch('http://localhost:3001/register/validate/activation', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code: data.get('validation_code') })
    })

    const response = await request.json()

    const field = document.getElementById('validate-div') as HTMLDivElement

    field.classList.remove('invalid')
    const span = field.querySelector('span')
    if (span) span.remove()

    if (response.ok === false && response.message == 'max attempts count reached') {
      changeForm(forms[0])
    }
    else if (response.ok === false) {
      field.classList.add('invalid')
      field.innerHTML += `<span class="w-67.5 md:w-80 text-[12px]">${codErrorTexts[response.field_message]}</span>`
    }
    else if (response.ok) {
      router.push('/hub')
    }
  }



  return (
    <main className="bg-[url(/images/register_background_1.png)] bg-cover bg-center w-dvw h-dvh flex justify-center items-center">
      {currentForm}
    </main>
  )
}