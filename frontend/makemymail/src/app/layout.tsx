// filepath: /media/switchblade/Windows/Users/heman/OneDrive/Desktop/BITS/Coding/Projects/MakeMyMail/frontend/makemymail/src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const metadata = {
  title: 'MakeMyMail - Smart Email Management',
  description: 'Take control of your email chaos with smart grouping and bulk actions.',
  keywords: 'email management, gmail, inbox organization, email automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}