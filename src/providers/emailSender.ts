import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,

  },
});

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Recuperação de Senha',
    text: `Você solicitou a recuperação de senha. Clique no link a seguir para redefinir sua senha: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de recuperação de senha enviado com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}