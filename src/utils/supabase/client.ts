import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://xxaewalempyltftrsnvf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YWV3YWxlbXB5bHRmdHJzbnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODE4MDUsImV4cCI6MjA3OTU1NzgwNX0.IIS05mFAnV2dY3uE48n92ygGt5mLwxM8guHYPxxrtDc'
  )
}