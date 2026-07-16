import '@/index.css';
import { Providers } from './providers';

export const metadata = {
  title: 'CalJob Assist',
  description: 'Controla tu vida legal y laboral informado.',
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
