package com.skillexchange.app

import android.content.Context
import android.webkit.MimeTypeMap
import fi.iki.elonen.NanoHTTPD
import java.io.InputStream

class AppWebServer(private val context: Context, port: Int = 8080) : NanoHTTPD("127.0.0.1", port) {

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri ?: "/"
        val cleanPath = uri.removePrefix("/")

        // Explicit MIME type lookup
        val extension = MimeTypeMap.getFileExtensionFromUrl(uri)
        val mimeType = when (extension) {
            "css" -> "text/css"
            "js" -> "application/javascript"
            "json" -> "application/json"
            "png" -> "image/png"
            "jpg", "jpeg" -> "image/jpeg"
            "svg" -> "image/svg+xml"
            "woff" -> "font/woff"
            "woff2" -> "font/woff2"
            "ttf" -> "font/ttf"
            "html" -> "text/html"
            else -> if (extension.isNotEmpty()) MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "text/plain" else null
        }

        // If asset file (CSS, JS, image, font)
        if (mimeType != null && mimeType != "text/html") {
            val candidatePaths = listOf(
                cleanPath,
                cleanPath.replaceFirst("_next/", "next/")
            )

            for (path in candidatePaths) {
                try {
                    val stream: InputStream = context.assets.open(path)
                    return newChunkedResponse(Response.Status.OK, mimeType, stream)
                } catch (_: Exception) {}
            }
        }

        // HTML Page route resolution (/register -> register.html, /login -> login.html, etc.)
        val routePath = cleanPath.removeSuffix("/")
        val candidateHtmlPaths = listOf(
            if (routePath.isEmpty()) "index.html" else "$routePath.html",
            "$routePath/index.html",
            routePath,
            "index.html"
        )

        for (htmlPath in candidateHtmlPaths) {
            try {
                val stream: InputStream = context.assets.open(htmlPath)
                return newChunkedResponse(Response.Status.OK, "text/html", stream)
            } catch (_: Exception) {}
        }

        // SPA Router Fallback to index.html
        return try {
            val fallbackStream: InputStream = context.assets.open("index.html")
            newChunkedResponse(Response.Status.OK, "text/html", fallbackStream)
        } catch (e: Exception) {
            newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "File Not Found")
        }
    }
}
