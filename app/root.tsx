import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigation } from '@remix-run/react'
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import fonts from './styles/fonts.css?url'
import tailwind from './tailwind.css?url'
import { LoadingSpinner } from './components/LoadingSpinner'

export const meta: MetaFunction = () => {
  return [
    { title: 'Polar Coup' },
    { property: 'og:title', content: 'Polar Coup' },
    { property: 'og:description', content: 'Play Coup online' },
    { property: 'og:image', content: '/og-image.png' },
    { property: 'og:url', content: 'https://polarcoup.app/' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:domain', content: 'polarcoup.app' },
    { property: 'twitter:url', content: 'https://polarcoup.app/' },
    { name: 'twitter:title', content: 'Polar Coup' },
    { name: 'twitter:description', content: 'Play Coup online' },
    { name: 'twitter:image', content: '/og-image.png' },
    { name: 'theme-color', content: '#2E3440' }
  ]
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwind },
  { rel: 'stylesheet', href: fonts },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  }
]

const isDev = process.env.NODE_ENV === 'development'

export const loader: LoaderFunction = async ({ request }) => {
  // Fetch the SVG sprite content from our own route
  const url = new URL(request.url)
  const spritesUrl = `${url.origin}/sprites.svg`
  const response = await fetch(spritesUrl)
  const svgContent = await response.text()

  return {
    svgContent,
    ENV: {
      FIREBASE_DATABASE_URL: isDev ? process.env.FIREBASE_DEV_DATABASE_URL : process.env.FIREBASE_DATABASE_URL
    }
  }
}

export default function App() {
  const { state: navigationState } = useNavigation()
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
