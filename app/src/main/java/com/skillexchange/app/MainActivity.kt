package com.skillexchange.app

import android.os.Bundle
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
                        url = "https://appassets.androidplatform.net/assets/login.html",
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
fun WebAppContainer(url: String, onWebViewCreated: (WebView) -> Unit) {
    AndroidView(
        factory = { context ->
            val assetLoader = WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
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
                settings.cacheMode = WebSettings.LOAD_NO_CACHE

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): WebResourceResponse? {
                        val reqUrl = request?.url ?: return null
                        val response = assetLoader.shouldInterceptRequest(reqUrl)
                        if (response != null) return response

                        // Route Fallback Interceptor (/dashboard -> dashboard.html)
                        val path = reqUrl.path ?: ""
                        if (!path.contains(".")) {
                            val cleanPath = path.trim('/').ifEmpty { "index" }
                            val htmlCandidate = "$cleanPath.html"
                            try {
                                val stream = context.assets.open(htmlCandidate)
                                return WebResourceResponse("text/html", "UTF-8", stream)
                            } catch (_: Exception) {
                                try {
                                    val fallbackStream = context.assets.open("index.html")
                                    return WebResourceResponse("text/html", "UTF-8", fallbackStream)
                                } catch (_: Exception) {}
                            }
                        }
                        return null
                    }

                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        return false
                    }
                }

                loadUrl(url)
                onWebViewCreated(this)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
