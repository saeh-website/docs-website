import './globals.css'

export const metadata = {
  title: 'SAEH Website Documentation',
  description: 'Documentation platform for SAEH',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}