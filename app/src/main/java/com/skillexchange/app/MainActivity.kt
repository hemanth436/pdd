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
                            val extension = MimeTypeMap.getFileExtensionFromUrl(path)
                            
                            // If request has a file extension (e.g. .js, .css, .png, .svg), let WebViewAssetLoader handle it directly
                            if (extension.isNotEmpty() && extension != "html") {
                                return assetLoader.shouldInterceptRequest(url)
                            }

                            // Clean route mapping: /register -> register.html, /login -> login.html
                            val cleanPath = path.removePrefix("/").removeSuffix("/")
                            val candidatePaths = listOf(
                                if (cleanPath.isEmpty()) "index.html" else "$cleanPath.html",
                                "$cleanPath/index.html",
                                cleanPath,
                                "index.html"
                            )

                            for (assetPath in candidatePaths) {
                                try {
                                    val inputStream = context.assets.open(assetPath)
                                    return WebResourceResponse("text/html", "UTF-8", inputStream)
                                } catch (_: Exception) {
                                    // Try next candidate
                                }
                            }
                        }
                        return assetLoader.shouldInterceptRequest(url)
                    }

                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        request?.url?.let { view?.loadUrl(it.toString()) }
                        return true
                    }
                }

                // Load web app main page
                loadUrl("https://appassets.androidplatform.net/index.html")
                onWebViewCreated(this)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
