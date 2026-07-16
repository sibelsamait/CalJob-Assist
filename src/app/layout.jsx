import '@/index.css';
import { Providers } from './providers';

export const metadata = {
  title: 'CalJob Assist',
  description: 'Controla tu vida legal y laboral informado.',
  icons: {
    icon: '/images/black.png',
    shortcut: '/images/black.png',
    apple: '/images/white.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
