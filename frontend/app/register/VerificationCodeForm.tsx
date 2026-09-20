import { ChangeEvent } from "react"
import languagesObject from '../languages.json'
import { FormProps } from "./FieldsForm"

const codePlaceholder = languagesObject['en-US'].verification_code_placeholder
const codeButtonText = languagesObject['en-US'].verification_code_send_button
const instructionText = languagesObject['en-US'].verification_code_instruction



function removeFocus(event: ChangeEvent<HTMLInputElement>) {
  if (event.currentTarget.value.length === event.currentTarget.maxLength) event.currentTarget.blur()
}



export default function VerificationCodeForm({ sendFunction }: FormProps) {
  return (
    <form onSubmit={sendFunction} className="bg-[url(/images/parchment_1.png)] bg-cover bg-center flex flex-col justify-evenly items-center aspect-5/6 w-[98dvw] pb-[3dvh] sm:w-[30dvw] md:w-[35dvw] lg:w-[30dvw]">
      <img src="/images/logo.png" width={80} alt="Logo" />

      <p className="text-center text-[16px] font-bold w-[65dvw] sm:w-[22dvw]">{instructionText}</p>

      <div id="validate-div">
        <input type="text" name="validation_code" id="validation-code-input" maxLength={8} onChange={removeFocus} placeholder={codePlaceholder} className="bg-white text-center w-[50dvw] h-12 sm:w-[15dvw] text-[4dvh]" required />
      </div>

      <button type="submit" className="border-(--darkgoldgray) border-3 rounded-[7px] bg-(--goldgray) text-white py-1 text-[15px] w-[50dvw] font-bold transition-all duration-300 hover:bg-(--darkgoldgray) cursor-pointer sm:w-[15dvw]">{codeButtonText}</button>
    </form>
  )
}