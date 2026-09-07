export function serverMailMessage(verificationCode: string, html: boolean) {
    if (html) {
        return `
        <h2>Greetings</h2>
        <br />
        <p>Use the code below to verify and complete your new account on Sunborne:</p>
        <br />
        <h3>${verificationCode}</h3>
        <br />
        <p>If you did not request this, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
        `
    }
    else {
        return `
        Greetings,\n\n
        Use the code below to verify and complete your new account on Sunborne:\n\n
        ${verificationCode}\n\n
        If you did not request this, you can safely ignore this email. Someone may have entered your email address by mistake.
        `
    }
}