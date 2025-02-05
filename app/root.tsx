import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useMatches } from '@remix-run/react'
import type { LinksFunction, LoaderFunction } from '@remix-run/node'
import fonts from './styles/fonts.css'
import tailwind from './tailwind.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwind },
  { rel: 'stylesheet', href: fonts },
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

  return { svgContent }
}

export default function App() {
  const { svgContent } = useLoaderData<{ svgContent: string }>()
  const matches = useMatches()
  console.log(matches)

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ display: 'none' }} aria-hidden='true' dangerouslySetInnerHTML={{ __html: svgContent }} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
