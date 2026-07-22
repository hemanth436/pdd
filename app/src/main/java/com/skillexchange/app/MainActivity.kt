package com.skillexchange.app

import android.os.Bundle
import android.webkit.MimeTypeMap
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.skillexchange.app.ui.theme.SkillExchangeTheme

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SkillExchangeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WebAppContainer(
                        onWebViewCreated = { webView = it }
                    )
                }
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView?.canGoBack() == true) {
            webView?.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

@Composable
fun WebAppContainer(onWebViewCreated: (WebView) -> Unit) {
    AndroidView(
        factory = { context ->
            val assetLoader = WebViewAssetLoader.Builder()
                .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(context))
                .build()

            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                settings.cacheMode = WebSettings.LOAD_DEFAULT

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): WebResourceResponse? {
                        val url = request?.url ?: return null
                        if (url.host == "appassets.androidplatform.net") {
                            val path = url.path ?: ""
                            val cleanPath = path.removePrefix("/")
                            val extension = MimeTypeMap.getFileExtensionFromUrl(path)

                            // Explicit MIME type resolution for CSS, JS, JSON, Fonts, and Images
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
                                else -> if (extension.isNotEmpty()) MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) else null
                            }

                            if (mimeType != null && mimeType != "text/html") {
                                // Try direct path
                                try {
                                    val stream = context.assets.open(cleanPath)
                                    return WebResourceResponse(mimeType, "UTF-8", stream)
                                } catch (_: Exception) {}

                                // Try next/ fallback if _next/ was requested
                                if (cleanPath.startsWith("_next/")) {
                                    val altPath = cleanPath.replaceFirst("_next/", "next/")
                                    try {
                                        val altStream = context.assets.open(altPath)
                                        return WebResourceResponse(mimeType, "UTF-8", altStream)
                                    } catch (_: Exception) {}
                                }
                            }

                            // Route resolution for HTML pages (/register, /login, /dashboard, /explore)
                            val routePath = cleanPath.removeSuffix("/")
                            val candidatePaths = listOf(
                                if (routePath.isEmpty()) "index.html" else "$routePath.html",
                                "$routePath/index.html",
                                routePath,
                                "index.html"
                            )

                            for (assetPath in candidatePaths) {
                                try {
                                    val inputStream = context.assets.open(assetPath)
                                    return WebResourceResponse("text/html", "UTF-8", inputStream)
                                } catch (_: Exception) {}
                            }
                        }
                        return assetLoader.shouldInterceptRequest(url)
                    }

                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        request?.url?.let { view?.loadUrl(it.toString()) }
                        return true
                    }
                }

                // Load main web application
                loadUrl("https://appassets.androidplatform.net/index.html")
                onWebViewCreated(this)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
