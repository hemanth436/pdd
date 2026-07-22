package com.skillexchange.app.api

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime

object SupabaseConfig {
    const val URL = "https://kxhqdsqqhdobxltefzsp.supabase.co"
    const val ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aHFkc3FxaGRvYnhsdGVmenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODkxNDUsImV4cCI6MjA5ODQ2NTE0NX0.GU9qfyjJGahcDWtkHoraUYpLQ1UZOzUr4lG95meaMxQ"

    val client = createSupabaseClient(
        supabaseUrl = URL,
        supabaseKey = ANON_KEY
    ) {
        install(Postgrest)
        install(Auth)
        install(Realtime)
    }
}
