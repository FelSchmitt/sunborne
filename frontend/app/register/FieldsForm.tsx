import { FormEvent } from "react"
import languagesObject from '../languages.json'

export type FormProps = {
  sendFunction: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const placeholders = languagesObject['en-US'].register_placeholders
const sendButtonText = languagesObject['en-US'].register_send_button



export default function FieldsForm({ sendFunction }: FormProps) {
  return (
    <form onSubmit={sendFunction} className="bg-[url(/images/parchment_1.png)] bg-cover bg-center flex flex-col justify-evenly items-center aspect-5/6 w-[98dvw] pb-[3dvh] sm:w-[30dvw] md:w-[35dvw] lg:w-[30dvw]">
      <img src="/images/logo.png" width={80} alt="Logo" />

      <div className="fielddiv">
        <input type="text" name="account_id" placeholder={placeholders[0]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" required />
      </div>

      <div className="fielddiv">
        <input type="password" name="password" placeholder={placeholders[1]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" required />
      </div>

      <div className="fielddiv">
        <input type="text" name="user_nickname" placeholder={placeholders[2]} className="bg-white w-[65dvw] h-7.5 sm:w-[22dvw]" required />
      </div>

      <button type="submit" className="border-(--darkgoldgray) border-3 rounded-[7px] bg-(--goldgray) text-white py-1 text-[15px] w-[50dvw] font-bold transition-all duration-300 hover:bg-(--darkgoldgray) cursor-pointer sm:w-[15dvw]">{sendButtonText}</button>
    </form>
  )
}