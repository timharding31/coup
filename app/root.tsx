import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import type { LinksFunction, LoaderFunction } from '@remix-run/node'
import fonts from './styles/fonts.css?url'
import tailwind from './tailwind.css?url'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwind },
  { rel: 'stylesheet', href: fonts },
  // { rel: 'stylesheet', href: '/fonts/fonts.css' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  }
]

export const loader: LoaderFunction = async ({ request }) => {
  // Fetch the SVG sprite content from our own route
  const url = new URL(request.url)
  const spritesUrl = `${url.origin}/sprites.svg`
  const response = await fetch(spritesUrl)
  const svgContent = await response.text()

  return {
    svgContent,
    ENV: {
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
    }
  }
}

export default function App() {
  const { ENV, svgContent } = useLoaderData<{ svgContent: string } & (typeof globalThis)['window']>()
  return (
    <html lang='en' translate='no'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className='hidden'
          style={{ display: 'none' }}
          aria-hidden='true'
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        <div id='root'>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`
          }}
        />
      </body>
    </html>
  )
}
