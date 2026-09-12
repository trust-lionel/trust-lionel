// ============================================================
// src/pages/events.json.js
// JSON endpoint — exposes all events for Bluesky automation
// https://trust-lionel.com/events.json
// ============================================================

import { getCollection } from 'astro:content'
import { SITE } from '~/config'

export async function GET() {
  const allEvents = await getCollection('events')

  const events = allEvents
    .filter((event) => !event.data.draft)
    .map((event) => ({
      id: event.id,
      title: event.data.title,
      description: event.data.description,
      eventDate: event.data.eventDate?.toISOString() ?? null,
      eventEndDate: event.data.eventEndDate?.toISOString() ?? null,
      eventTime: event.data.eventTime ?? null,
      eventFormat: event.data.eventFormat ?? null,
      eventHost: event.data.eventHost ?? null,
      eventHostUrl: event.data.eventHostUrl ?? null,
      eventRegistrationUrl: event.data.eventRegistrationUrl ?? null,
      eventSameAs: event.data.eventSameAs ?? null,
      eventStatus: event.data.eventStatus ?? null,
      tags: event.data.tags ?? [],
      featured: event.data.featured ?? false,
      url: `${SITE.website}/events/${event.id}`,
    }))
    .sort((a, b) => {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0
      return dateA - dateB
    })

  return new Response(JSON.stringify(events, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
