import { NextRequest, NextResponse } from 'next/server'

const ACCUWEATHER_KEY = process.env.ACCUWEATHER_API_KEY

// AccuWeather icon number → unicode symbol
function iconSymbol(iconNum: number, isDay: boolean): string {
  if ([1, 2].includes(iconNum)) return isDay ? '☼' : '☽'
  if ([3, 4, 5].includes(iconNum)) return '🌤'
  if ([6, 7, 8].includes(iconNum)) return '☁'
  if (iconNum === 11) return '🌫'
  if ([12, 13, 14, 18].includes(iconNum)) return '🌧'
  if ([15, 16, 17].includes(iconNum)) return '⛈'
  if ([19, 20, 21].includes(iconNum)) return '🌨'
  if ([22, 23].includes(iconNum)) return '❄'
  if ([24, 25, 26, 29].includes(iconNum)) return '🌧'
  if (iconNum === 32) return '💨'
  if ([33, 34, 35, 36, 37, 38].includes(iconNum)) return '☽'
  if ([39, 40].includes(iconNum)) return '🌧'
  if ([41, 42].includes(iconNum)) return '⛈'
  if ([43, 44].includes(iconNum)) return '❄'
  return '☼'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 })
  }

  if (!ACCUWEATHER_KEY) {
    return NextResponse.json({ error: 'AccuWeather API key not configured' }, { status: 503 })
  }

  try {
    // Step 1 — resolve lat/lon to AccuWeather location key
    const locRes = await fetch(
      `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${ACCUWEATHER_KEY}&q=${lat},${lon}&toplevel=true`,
      { next: { revalidate: 3600 } } // cache location key for 1 hour
    )

    if (!locRes.ok) {
      return NextResponse.json({ error: `Location lookup failed: ${locRes.status}` }, { status: 502 })
    }

    const locData = await locRes.json()
    const locationKey: string = locData.Key
    const cityName: string = locData.LocalizedName ?? ''
    const country: string = locData.Country?.LocalizedName ?? ''

    // Step 2 — get current conditions
    const condRes = await fetch(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_KEY}&details=false`,
      { next: { revalidate: 600 } } // cache conditions for 10 minutes
    )

    if (!condRes.ok) {
      return NextResponse.json({ error: `Conditions lookup failed: ${condRes.status}` }, { status: 502 })
    }

    const condData = await condRes.json()
    const current = condData[0]

    const temp = Math.round(current.Temperature.Metric.Value)
    const iconNum: number = current.WeatherIcon
    const isDayTime: boolean = current.IsDayTime
    const weatherText: string = current.WeatherText

    return NextResponse.json({
      temp,
      unit: 'C',
      text: weatherText,
      icon: iconSymbol(iconNum, isDayTime),
      iconNum,
      isDayTime,
      city: cityName,
      country,
    })
  } catch (err) {
    console.error('AccuWeather error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
